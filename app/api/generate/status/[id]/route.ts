import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

// AI 图片生成配置
const AI_CONFIG = {
  baseUrl: process.env.AI_API_BASE_URL || 'https://api.bltcy.ai',
  apiKey: process.env.AI_API_KEY || '',
  model: 'nano-banana-2',
  endpoint: '/v1/images/generations',
};

// 处理生成任务
async function processJob(job: {
  id: string;
  pet_image: string;
  pet_type: string;
  prompt: string;
  retry_count?: number;
}) {
  console.log('🎨 开始处理任务:', job.id);

  // 标记为处理中
  await supabase
    .from('generation_jobs')
    .update({
      status: 'processing',
      processing_started_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  try {
    // 准备图片数据
    const imageArray: string[] = [];
    if (job.pet_image.startsWith('data:image')) {
      const base64Data = job.pet_image.split(',')[1];
      imageArray.push(base64Data);
    } else if (job.pet_image.startsWith('http')) {
      imageArray.push(job.pet_image);
    }

    if (imageArray.length === 0) {
      throw new Error('无效的图片格式');
    }

    const requestBody = {
      prompt: job.prompt,
      model: AI_CONFIG.model,
      response_format: 'url',
      aspect_ratio: '1:1',
      image: imageArray,
    };

    console.log('⏳ 调用 AI API...');
    const startTime = Date.now();

    // 设置 25 秒超时（Edge Runtime 限制 30 秒，留余量）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    console.log('⏱️ API 响应时间:', Date.now() - startTime, 'ms');

    let generatedImageUrl: string | null = null;

    if (data.data && data.data[0] && data.data[0].url) {
      generatedImageUrl = data.data[0].url;
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
      generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
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
        .eq('id', job.id);

      console.log('✅ 任务完成:', job.id);
      return { success: true, generatedImage: generatedImageUrl };
    } else {
      throw new Error(data.error?.message || 'AI 生成失败');
    }
  } catch (error) {
    console.error('❌ 处理失败:', error);

    // 如果是超时错误，恢复为 pending 状态以便重试
    if (error instanceof Error && error.name === 'AbortError') {
      await supabase
        .from('generation_jobs')
        .update({
          status: 'pending',
          retry_count: job.retry_count ? job.retry_count + 1 : 1,
        })
        .eq('id', job.id);
      return { success: false, error: 'timeout', canRetry: true };
    }

    // 其他错误标记为失败
    await supabase
      .from('generation_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : '未知错误',
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id);

    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: '缺少任务ID' },
        { status: 400 }
      );
    }

    // 查询任务状态
    const { data: job, error: queryError } = await supabase
      .from('generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (queryError || !job) {
      return NextResponse.json(
        { success: false, error: '任务不存在' },
        { status: 404 }
      );
    }

    // 检查 API Key
    if (!AI_CONFIG.apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI 服务未配置', status: 'failed' },
        { status: 500 }
      );
    }

    // 根据状态处理
    switch (job.status) {
      case 'completed':
        return NextResponse.json({
          success: true,
          status: 'completed',
          data: {
            id: job.id,
            rarity: job.rarity,
            titleId: job.title_id,
            title: job.title,
            description: job.description,
            prompt: job.prompt,
            originalImage: job.pet_image,
            generatedImage: job.generated_image,
            petType: job.pet_type,
          },
        });

      case 'failed':
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: job.error_message || '生成失败',
        });

      case 'processing':
        // 检查是否卡住了（超过 60 秒）
        const processingTime = job.processing_started_at
          ? Date.now() - new Date(job.processing_started_at).getTime()
          : 0;

        if (processingTime > 60000) {
          console.log('⚠️ 任务卡住，重新处理:', jobId);
          // 重置为 pending 状态
          await supabase
            .from('generation_jobs')
            .update({ status: 'pending' })
            .eq('id', jobId);

          // 尝试处理
          const result = await processJob({ ...job, retry_count: job.retry_count });
          if (result.success) {
            return NextResponse.json({
              success: true,
              status: 'completed',
              data: {
                id: job.id,
                rarity: job.rarity,
                titleId: job.title_id,
                title: job.title,
                description: job.description,
                prompt: job.prompt,
                originalImage: job.pet_image,
                generatedImage: result.generatedImage,
                petType: job.pet_type,
              },
            });
          }
        }

        return NextResponse.json({
          success: true,
          status: 'processing',
          message: '正在生成中...',
        });

      case 'pending':
        // 检查重试次数
        if (job.retry_count && job.retry_count >= 5) {
          await supabase
            .from('generation_jobs')
            .update({
              status: 'failed',
              error_message: '重试次数过多',
            })
            .eq('id', jobId);

          return NextResponse.json({
            success: false,
            status: 'failed',
            error: '服务繁忙，请稍后重试',
          });
        }

        // 开始处理
        const result = await processJob({ ...job, retry_count: job.retry_count });

        if (result.success) {
          return NextResponse.json({
            success: true,
            status: 'completed',
            data: {
              id: job.id,
              rarity: job.rarity,
              titleId: job.title_id,
              title: job.title,
              description: job.description,
              prompt: job.prompt,
              originalImage: job.pet_image,
              generatedImage: result.generatedImage,
              petType: job.pet_type,
            },
          });
        } else if (result.canRetry) {
          return NextResponse.json({
            success: true,
            status: 'processing',
            message: '正在重试...',
          });
        } else {
          return NextResponse.json({
            success: false,
            status: 'failed',
            error: result.error,
          });
        }

      default:
        return NextResponse.json({
          success: false,
          status: 'unknown',
          error: '未知状态',
        });
    }
  } catch (error) {
    console.error('查询状态错误:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
