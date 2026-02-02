// Supabase Edge Function: 处理 AI 图片生成 (可灵 Kling API)
// 部署方法见 README

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AI_CONFIG = {
  baseUrl: Deno.env.get('AI_API_BASE_URL') || 'https://api.bltcy.ai',
  apiKey: Deno.env.get('AI_API_KEY') || '',
  model: 'kling-v2',
  submitEndpoint: '/kling/v1/images/multi-image2image',
  queryEndpoint: '/kling/v1/images/generations',  // 查询用 generations 接口
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 延时函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // 创建 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    supabase = createClient(supabaseUrl, supabaseKey)

    // 获取任务信息
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

    // 检查状态 - 已完成直接返回
    if (job.status === 'completed') {
      console.log('✅ 任务已完成:', jobId)
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查状态 - 已失败直接返回
    if (job.status === 'failed') {
      console.log('❌ 任务已失败:', jobId)
      return new Response(
        JSON.stringify({ success: false, status: 'failed', error: job.error_message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 检查是否正在处理中（防止重复处理）
    if (job.status === 'processing' && job.kling_task_id) {
      // 如果已经有 kling_task_id，直接查询状态
      console.log('⏳ 已有可灵任务，查询状态:', job.kling_task_id)
      const result = await pollKlingTask(job.kling_task_id)

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
          JSON.stringify({ success: true, status: 'processing' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else if (result.failed) {
        throw new Error(result.error || '可灵生成失败')
      }
    }

    // 检查重试次数
    if (job.retry_count && job.retry_count >= 3) {
      console.error('❌ 重试次数过多:', jobId)
      await supabase
        .from('generation_jobs')
        .update({
          status: 'failed',
          error_message: '重试次数过多，请重新生成',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      return new Response(
        JSON.stringify({ success: false, status: 'failed', error: '重试次数过多' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 标记为处理中
    console.log('📝 标记为处理中:', jobId)
    await supabase
      .from('generation_jobs')
      .update({
        status: 'processing',
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    // 准备图片数据 - 可灵需要图片 URL 或 base64
    let imageData: string
    if (job.pet_image.startsWith('data:image')) {
      // base64 格式，直接使用
      imageData = job.pet_image
    } else if (job.pet_image.startsWith('http')) {
      imageData = job.pet_image
    } else {
      throw new Error('无效的图片格式')
    }

    // 构建可灵 API 请求 - 竖屏 9:16 (1024×1792)
    const requestBody = {
      model_name: AI_CONFIG.model,
      prompt: job.prompt,
      negative_prompt: '模糊, 低质量, 变形, 丑陋, 多余肢体',
      subject_image_list: [imageData],
      n: 1,
      aspect_ratio: '9:16',
    }

    console.log('⏳ 提交可灵任务...', 'prompt:', job.prompt.substring(0, 50) + '...')
    const startTime = Date.now()

    // 1. 提交任务到可灵
    const submitResponse = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.submitEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const submitData = await submitResponse.json()
    console.log('📦 可灵提交响应:', JSON.stringify(submitData))

    if (submitData.code !== 0 || !submitData.data?.task_id) {
      throw new Error(submitData.message || '提交可灵任务失败')
    }

    const klingTaskId = submitData.data.task_id
    console.log('✅ 可灵任务已提交:', klingTaskId)

    // 保存 kling_task_id
    await supabase
      .from('generation_jobs')
      .update({ kling_task_id: klingTaskId })
      .eq('id', jobId)

    // 2. 轮询等待结果（最多等待 120 秒）
    const result = await pollKlingTask(klingTaskId, 120000)

    const responseTime = Date.now() - startTime
    console.log('⏱️ 总用时:', responseTime, 'ms')

    if (result.success && result.imageUrl) {
      // 更新为完成状态
      console.log('📝 更新为完成状态:', jobId)
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
      // 还在处理中，让前端继续轮询
      return new Response(
        JSON.stringify({ success: true, status: 'processing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(result.error || '可灵生成失败')
    }
  } catch (error) {
    console.error('❌ 处理失败:', error)

    // 更新状态
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
          console.log('📝 重置为 pending，等待重试，当前重试次数:', newRetryCount)
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

// 轮询可灵任务状态
async function pollKlingTask(taskId: string, maxWaitMs = 120000): Promise<{
  success: boolean;
  imageUrl?: string;
  status?: string;
  failed?: boolean;
  error?: string;
}> {
  const startTime = Date.now()
  const pollInterval = 3000  // 每 3 秒查询一次

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const queryUrl = `${AI_CONFIG.baseUrl}${AI_CONFIG.queryEndpoint}/${taskId}`
      console.log('🔍 查询可灵任务:', taskId)

      const response = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        },
      })

      const data = await response.json()
      console.log('📦 可灵查询响应:', JSON.stringify(data).substring(0, 200))

      if (data.code !== 0) {
        console.error('❌ 查询失败:', data.message)
        return { success: false, failed: true, error: data.message }
      }

      const taskStatus = data.data?.task_status

      if (taskStatus === 'succeed') {
        // 成功，获取图片
        const images = data.data?.task_result?.images
        if (images && images.length > 0) {
          const imageUrl = images[0].url
          console.log('✅ 可灵生成成功:', imageUrl)
          return { success: true, imageUrl }
        }
        return { success: false, failed: true, error: '未获取到图片' }
      } else if (taskStatus === 'failed') {
        const errorMsg = data.data?.task_status_msg || '生成失败'
        console.error('❌ 可灵生成失败:', errorMsg)
        return { success: false, failed: true, error: errorMsg }
      } else {
        // 还在处理中 (submitted / processing)
        console.log('⏳ 可灵任务状态:', taskStatus)
      }
    } catch (e) {
      console.error('❌ 查询出错:', e)
    }

    await delay(pollInterval)
  }

  // 超时，但任务可能还在处理
  console.log('⏰ 轮询超时，任务可能还在处理')
  return { success: false, status: 'processing' }
}
