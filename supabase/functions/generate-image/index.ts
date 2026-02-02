// Supabase Edge Function: 处理 AI 图片生成 (Midjourney)
// 部署方法见 README

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MJ_CONFIG = {
  baseUrl: Deno.env.get('AI_API_BASE_URL') || 'https://api.bltcy.ai',
  apiKey: Deno.env.get('AI_API_KEY') || '',
  submitEndpoint: '/mj/submit/imagine',
  uploadEndpoint: '/mj/submit/upload-discord-images',
  fetchEndpoint: '/mj/task/{id}/fetch',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let jobId: string | null = null
  let supabase: ReturnType<typeof createClient> | null = null

  try {
    const body = await req.json()
    jobId = body.jobId

    if (!jobId) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少 jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🎨 开始处理任务:', jobId)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    supabase = createClient(supabaseUrl, supabaseKey)

    const { data: job, error: fetchError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (fetchError || !job) {
      console.error('❌ 任务不存在:', fetchError)
      return new Response(
        JSON.stringify({ success: false, error: '任务不存在' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 已完成
    if (job.status === 'completed') {
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 已失败
    if (job.status === 'failed') {
      return new Response(
        JSON.stringify({ success: false, status: 'failed', error: job.error_message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 正在处理中 - 查询 MJ 任务状态
    if (job.status === 'processing' && job.mj_task_id) {
      console.log('⏳ 查询 MJ 任务状态:', job.mj_task_id)
      const result = await pollMjTask(job.mj_task_id)

      if (result.success && result.imageUrl) {
        await supabase
          .from('generation_jobs')
          .update({
            status: 'completed',
            generated_image: result.imageUrl,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId)

        return new Response(
          JSON.stringify({ success: true, status: 'completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (result.status === 'processing') {
        return new Response(
          JSON.stringify({ success: true, status: 'processing', message: '正在生成中...' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (result.failed) {
        throw new Error(result.error || 'MJ 生成失败')
      }
    }

    // 检查重试次数
    if (job.retry_count && job.retry_count >= 3) {
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: '重试次数过多',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      return new Response(
        JSON.stringify({ success: false, status: 'failed', error: '重试次数过多' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 标记为处理中
    await supabase
      .from('generation_jobs')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    // 1. 上传图片到 Discord 获取 URL
    console.log('📤 上传图片到 MJ...')
    let imageUrl: string

    if (job.pet_image.startsWith('data:image')) {
      // 提取 base64 数据
      const base64Data = job.pet_image.split(',')[1]

      const uploadResponse = await fetch(`${MJ_CONFIG.baseUrl}${MJ_CONFIG.uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MJ_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64: base64Data,
        }),
      })

      const uploadData = await uploadResponse.json()
      console.log('📦 上传响应:', JSON.stringify(uploadData))

      if (!uploadData.result || uploadData.code !== 1) {
        throw new Error(uploadData.description || '图片上传失败')
      }

      imageUrl = uploadData.result
      console.log('✅ 图片上传成功:', imageUrl)
    } else if (job.pet_image.startsWith('http')) {
      imageUrl = job.pet_image
    } else {
      throw new Error('无效的图片格式')
    }

    // 2. 构建 MJ prompt（图片 URL + 描述）
    // MJ 格式: 图片URL 描述文字 --参数
    const mjPrompt = `${imageUrl} ${job.prompt} --ar 9:16 --v 6.1 --s 750`
    console.log('📝 MJ Prompt:', mjPrompt.substring(0, 200) + '...')

    // 3. 提交 MJ imagine 任务
    const submitResponse = await fetch(`${MJ_CONFIG.baseUrl}${MJ_CONFIG.submitEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MJ_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: mjPrompt,
        botType: 'MID_JOURNEY',  // 使用 MJ bot
      }),
    })

    const submitData = await submitResponse.json()
    console.log('📦 MJ 提交响应:', JSON.stringify(submitData))

    if (!submitData.result || submitData.code !== 1) {
      throw new Error(submitData.description || '提交 MJ 任务失败')
    }

    const mjTaskId = submitData.result
    console.log('✅ MJ 任务已提交:', mjTaskId)

    // 保存 mj_task_id
    await supabase
      .from('generation_jobs')
      .update({ mj_task_id: mjTaskId })
      .eq('id', jobId)

    // 4. 轮询等待结果（最多 120 秒）
    const result = await pollMjTask(mjTaskId, 120000)

    if (result.success && result.imageUrl) {
      await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          generated_image: result.imageUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      console.log('✅ 任务完成:', jobId)
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (result.status === 'processing') {
      return new Response(
        JSON.stringify({ success: true, status: 'processing', message: '正在生成中...' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(result.error || 'MJ 生成失败')
    }

  } catch (error) {
    console.error('❌ 处理失败:', error)

    if (jobId && supabase) {
      try {
        const { data: currentJob } = await supabase
          .from('generation_jobs')
          .select('retry_count')
          .eq('id', jobId)
          .single()

        const newRetryCount = (currentJob?.retry_count || 0) + 1

        if (newRetryCount >= 3) {
          await supabase
            .from('generation_jobs')
            .update({
              status: 'failed',
              error_message: error.message || '处理失败',
              completed_at: new Date().toISOString(),
            })
            .eq('id', jobId)
        } else {
          await supabase
            .from('generation_jobs')
            .update({
              status: 'pending',
              retry_count: newRetryCount,
            })
            .eq('id', jobId)
        }
      } catch (e) {
        console.error('❌ 更新状态失败:', e)
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message || '处理失败' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 轮询 MJ 任务状态
async function pollMjTask(taskId: string, maxWaitMs = 120000): Promise<{
  success: boolean;
  imageUrl?: string;
  status?: string;
  failed?: boolean;
  error?: string;
}> {
  const startTime = Date.now()
  const pollInterval = 5000  // 每 5 秒查询一次

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const fetchUrl = `${MJ_CONFIG.baseUrl}${MJ_CONFIG.fetchEndpoint.replace('{id}', taskId)}`
      console.log('🔍 查询 MJ 任务:', taskId)

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MJ_CONFIG.apiKey}`,
        },
      })

      const data = await response.json()
      console.log('📦 MJ 查询响应:', data.status, data.progress || '')

      const status = data.status

      if (status === 'SUCCESS') {
        // 成功，获取图片 - MJ 返回的是 4 宫格，我们取第一张或 imageUrl
        const imageUrl = data.imageUrl
        if (imageUrl) {
          console.log('✅ MJ 生成成功:', imageUrl)
          return { success: true, imageUrl }
        }
        return { success: false, failed: true, error: '未获取到图片' }
      } else if (status === 'FAILURE' || status === 'FAILED') {
        const errorMsg = data.failReason || '生成失败'
        console.error('❌ MJ 生成失败:', errorMsg)
        return { success: false, failed: true, error: errorMsg }
      } else {
        // 还在处理中 (SUBMITTED / IN_PROGRESS / PENDING 等)
        console.log('⏳ MJ 任务状态:', status, 'progress:', data.progress || '0%')
      }
    } catch (e) {
      console.error('❌ 查询出错:', e)
    }

    await delay(pollInterval)
  }

  console.log('⏰ 轮询超时，任务可能还在处理')
  return { success: false, status: 'processing' }
}
