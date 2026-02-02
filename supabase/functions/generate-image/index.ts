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

  try {
    const { jobId } = await req.json()

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
    const supabase = createClient(supabaseUrl, supabaseKey)

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

    // 检查状态
    if (job.status === 'completed') {
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (job.status === 'processing') {
      // 检查是否卡住（超过 120 秒）
      const processingTime = job.processing_started_at
        ? Date.now() - new Date(job.processing_started_at).getTime()
        : 0

      if (processingTime < 120000) {
        return new Response(
          JSON.stringify({ success: true, status: 'processing' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // 如果卡住了，继续处理
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
    const imageArray: string[] = []
    if (job.pet_image.startsWith('data:image')) {
      const base64Data = job.pet_image.split(',')[1]
      imageArray.push(base64Data)
    } else if (job.pet_image.startsWith('http')) {
      imageArray.push(job.pet_image)
    }

    if (imageArray.length === 0) {
      throw new Error('无效的图片格式')
    }

    const requestBody = {
      prompt: job.prompt,
      model: AI_CONFIG.model,
      response_format: 'url',
      aspect_ratio: '1:1',
      image: imageArray,
    }

    console.log('⏳ 调用 AI API...')
    const startTime = Date.now()

    // 调用 AI API（Supabase Edge Function 支持最长 150 秒）
    const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()
    console.log('⏱️ API 响应时间:', Date.now() - startTime, 'ms')

    let generatedImageUrl: string | null = null

    if (data.data && data.data[0] && data.data[0].url) {
      generatedImageUrl = data.data[0].url
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
      generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`
    }

    if (generatedImageUrl) {
      // 更新为完成状态
      await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          generated_image: generatedImageUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      console.log('✅ 任务完成:', jobId)
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      throw new Error(data.error?.message || 'AI 生成失败')
    }
  } catch (error) {
    console.error('❌ 处理失败:', error)

    // 尝试更新状态为失败
    try {
      const { jobId } = await req.clone().json()
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase
        .from('generation_jobs')
        .update({
          status: 'pending', // 重置为 pending 以便重试
          retry_count: supabase.rpc('increment_retry', { job_id: jobId }),
        })
        .eq('id', jobId)
    } catch (e) {
      console.error('更新状态失败:', e)
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message || '处理失败' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
