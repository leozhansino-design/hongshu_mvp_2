// Supabase Edge Function: 处理 AI 图片生成 (nano-banana-2-2k)
// 部署方法见 README

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AI_CONFIG = {
  baseUrl: Deno.env.get('AI_API_BASE_URL') || 'https://api.bltcy.ai',
  apiKey: Deno.env.get('AI_API_KEY') || '',
  model: 'nano-banana-2-2k',  // 2k 版本应该更快
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // 准备图片数据
    let imageData = job.pet_image
    if (imageData.startsWith('data:image')) {
      // 已经是 base64 格式，保持原样
      imageData = job.pet_image
    }

    console.log('📝 Prompt:', job.prompt.substring(0, 100) + '...')
    console.log('🤖 模型:', AI_CONFIG.model)

    // 调用 AI API 生成图片
    const apiUrl = `${AI_CONFIG.baseUrl}/v1/images/edits`
    console.log('🚀 调用 API:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        image: imageData,
        prompt: job.prompt,
        n: 1,
        size: '768x1024',  // 竖版图片
      }),
    })

    const responseText = await response.text()
    console.log('📦 API 响应状态:', response.status)
    console.log('📦 API 响应:', responseText.substring(0, 500))

    if (!response.ok) {
      throw new Error(`API 错误 ${response.status}: ${responseText}`)
    }

    const data = JSON.parse(responseText)

    // 获取生成的图片
    let generatedImage: string | null = null

    if (data.data && data.data[0]) {
      if (data.data[0].url) {
        generatedImage = data.data[0].url
      } else if (data.data[0].b64_json) {
        generatedImage = `data:image/png;base64,${data.data[0].b64_json}`
      }
    }

    if (!generatedImage) {
      throw new Error('未获取到生成的图片')
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
