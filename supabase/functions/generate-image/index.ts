// Supabase Edge Function: 处理 AI 图片生成
// 部署方法见 README

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const AI_CONFIG = {
  baseUrl: Deno.env.get('AI_API_BASE_URL') || 'https://api.bltcy.ai',
  apiKey: Deno.env.get('AI_API_KEY') || '',
  model: 'nano-banana-2',
  endpoint: '/v1/images/generations',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // 检查状态 - 正在处理中
    if (job.status === 'processing') {
      console.log('⏳ 任务处理中:', jobId)
      return new Response(
        JSON.stringify({ success: true, status: 'processing', message: '正在生成中...' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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

    // 构建 API 请求 - 标准图片生成格式
    const requestBody = {
      model: AI_CONFIG.model,
      prompt: job.prompt,
      n: 1,
      size: '1024x1792',  // 竖屏 9:16
    }

    console.log('⏳ 调用 AI API...', 'model:', AI_CONFIG.model)
    console.log('📝 Prompt:', job.prompt.substring(0, 100) + '...')
    const startTime = Date.now()

    // 调用 AI API
    const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseTime = Date.now() - startTime
    console.log('⏱️ API 响应时间:', responseTime, 'ms')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API 错误:', response.status, errorText)
      throw new Error(`${AI_CONFIG.model} failed: ${response.status}, ${errorText}`)
    }

    const data = await response.json()
    console.log('📦 API 响应:', JSON.stringify(data).substring(0, 200))

    // 获取生成的图片 URL
    let imageUrl: string | null = null

    if (data.data && data.data[0]) {
      imageUrl = data.data[0].url || data.data[0].b64_json
      if (data.data[0].b64_json && !data.data[0].url) {
        // 如果返回的是 base64，转换为 data URL
        imageUrl = `data:image/png;base64,${data.data[0].b64_json}`
      }
    }

    if (!imageUrl) {
      throw new Error('未获取到生成的图片')
    }

    console.log('✅ 图片生成成功')

    // 更新为完成状态
    await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        generated_image: imageUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    console.log('✅ 任务完成:', jobId)
    return new Response(
      JSON.stringify({ success: true, status: 'completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

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
