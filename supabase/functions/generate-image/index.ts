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

    // 检查是否正在处理中（防止重复处理）
    if (job.status === 'processing') {
      const processingTime = job.processing_started_at
        ? Date.now() - new Date(job.processing_started_at).getTime()
        : 0

      // 如果处理时间不超过 120 秒，认为正在正常处理
      if (processingTime < 120000) {
        console.log('⏳ 任务正在处理中:', jobId, '已用时:', Math.round(processingTime / 1000), '秒')
        return new Response(
          JSON.stringify({ success: true, status: 'processing' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // 超过 120 秒，认为卡住了，继续处理
      console.log('⚠️ 任务可能卡住，重新处理:', jobId)
    }

    // 检查重试次数
    if (job.retry_count && job.retry_count >= 5) {
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

    console.log('⏳ 调用 AI API...', 'prompt:', job.prompt.substring(0, 50) + '...')
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

    const responseTime = Date.now() - startTime
    console.log('⏱️ AI API 响应时间:', responseTime, 'ms')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ AI API 错误:', response.status, errorText)
      throw new Error(`AI API 错误: ${response.status}`)
    }

    const data = await response.json()

    let generatedImageUrl: string | null = null

    if (data.data && data.data[0] && data.data[0].url) {
      generatedImageUrl = data.data[0].url
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
      generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`
    }

    if (generatedImageUrl) {
      // 更新为完成状态
      console.log('📝 更新为完成状态:', jobId)
      const { error: updateError } = await supabase
        .from('generation_jobs')
        .update({
          status: 'completed',
          generated_image: generatedImageUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      if (updateError) {
        console.error('❌ 更新状态失败:', updateError)
        throw new Error('更新状态失败')
      }

      console.log('✅ 任务完成:', jobId, '用时:', responseTime, 'ms')
      return new Response(
        JSON.stringify({ success: true, status: 'completed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('❌ AI 返回数据异常:', JSON.stringify(data))
      throw new Error(data.error?.message || 'AI 生成失败，返回数据异常')
    }
  } catch (error) {
    console.error('❌ 处理失败:', error)

    // 更新状态为 pending 以便重试（而不是直接失败）
    if (jobId && supabase) {
      try {
        // 获取当前 retry_count
        const { data: currentJob } = await supabase
          .from('generation_jobs')
          .select('retry_count')
          .eq('id', jobId)
          .single()

        const newRetryCount = (currentJob?.retry_count || 0) + 1

        if (newRetryCount >= 5) {
          // 重试次数过多，标记为失败
          await supabase
            .from('generation_jobs')
            .update({
              status: 'failed',
              error_message: error.message || '处理失败',
              completed_at: new Date().toISOString(),
            })
            .eq('id', jobId)
        } else {
          // 重置为 pending，增加重试次数
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
