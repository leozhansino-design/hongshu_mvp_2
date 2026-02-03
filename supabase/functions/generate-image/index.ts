// Supabase Edge Function: 处理 AI 图片生成
// 支持多模型备选：2k -> 4k -> 普通版
// 部署: supabase functions deploy generate-image

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AI_CONFIG = {
  baseUrl: Deno.env.get('AI_API_BASE_URL') || 'https://api.bltcy.ai',
  apiKey: Deno.env.get('AI_API_KEY') || '',
  // 模型优先级：2k最快 -> 4k质量更好 -> 普通版最稳定
  models: ['nano-banana-2-2k', 'nano-banana-2-4k', 'nano-banana-2'],
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 尝试使用指定模型生成图片
async function tryGenerateWithModel(
  model: string,
  imageBlob: Blob,
  prompt: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  console.log(`🤖 尝试模型: ${model}`)

  const formData = new FormData()
  formData.append('model', model)
  formData.append('prompt', prompt)
  formData.append('n', '1')
  formData.append('size', '768x1024')
  formData.append('image', imageBlob, 'pet.png')

  const apiUrl = `${AI_CONFIG.baseUrl}/v1/images/edits`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: formData,
    })

    const responseText = await response.text()
    console.log(`📦 ${model} 响应状态:`, response.status)

    if (!response.ok) {
      console.log(`❌ ${model} 失败:`, responseText.substring(0, 200))
      return { success: false, error: `${model} 失败: ${response.status}` }
    }

    const data = JSON.parse(responseText)

    if (data.data && data.data[0]) {
      if (data.data[0].url) {
        console.log(`✅ ${model} 成功`)
        return { success: true, imageUrl: data.data[0].url }
      } else if (data.data[0].b64_json) {
        console.log(`✅ ${model} 成功 (base64)`)
        return { success: true, imageUrl: `data:image/png;base64,${data.data[0].b64_json}` }
      }
    }

    return { success: false, error: '未获取到图片' }
  } catch (e) {
    console.error(`❌ ${model} 异常:`, e)
    return { success: false, error: e.message || '请求异常' }
  }
}

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

    // 准备图片数据 - 转换 base64 为 Blob
    console.log('📝 Prompt:', job.prompt.substring(0, 100) + '...')

    let imageBlob: Blob
    if (job.pet_image.startsWith('data:image')) {
      const [header, base64Data] = job.pet_image.split(',')
      const mimeMatch = header.match(/data:([^;]+)/)
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'

      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      imageBlob = new Blob([bytes], { type: mimeType })
      console.log('📷 图片大小:', Math.round(imageBlob.size / 1024), 'KB')
    } else {
      throw new Error('需要 base64 格式的图片')
    }

    // 依次尝试各模型
    let generatedImage: string | null = null
    let lastError = ''

    for (const model of AI_CONFIG.models) {
      const result = await tryGenerateWithModel(model, imageBlob, job.prompt)
      if (result.success && result.imageUrl) {
        generatedImage = result.imageUrl
        break
      }
      lastError = result.error || '未知错误'
    }

    if (!generatedImage) {
      throw new Error(`所有模型均失败: ${lastError}`)
    }

    console.log('✅ 图片生成成功')

    // 更新任务状态
    await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        generated_image: generatedImage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return new Response(
      JSON.stringify({ success: true, status: 'completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
