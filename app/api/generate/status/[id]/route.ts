import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

// 调用 Supabase Edge Function 处理图片生成
async function triggerProcessing(jobId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase config');
    return;
  }

  try {
    // 调用 Supabase Edge Function（不等待响应）
    fetch(`${supabaseUrl}/functions/v1/generate-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobId }),
    }).catch(err => {
      console.log('Edge function call initiated:', err?.message || 'ok');
    });

    console.log('🚀 已触发 Supabase Edge Function 处理:', jobId);
  } catch (error) {
    console.error('触发处理失败:', error);
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

    // 根据状态返回
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
        // 检查是否卡住了（超过 120 秒）
        const processingTime = job.processing_started_at
          ? Date.now() - new Date(job.processing_started_at).getTime()
          : 0;

        if (processingTime > 120000) {
          console.log('⚠️ 任务可能卡住，重新触发处理:', jobId);
          // 重置为 pending 并重新触发
          await supabase
            .from('generation_jobs')
            .update({
              status: 'pending',
              retry_count: (job.retry_count || 0) + 1,
            })
            .eq('id', jobId);

          triggerProcessing(jobId);
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

        // 如果任务还是 pending，重新触发处理
        const createdTime = job.created_at
          ? Date.now() - new Date(job.created_at).getTime()
          : 0;

        // 如果创建超过 5 秒还是 pending，说明初始触发可能失败了
        if (createdTime > 5000) {
          console.log('⚠️ 任务仍为 pending，重新触发处理:', jobId);
          triggerProcessing(jobId);
        }

        return NextResponse.json({
          success: true,
          status: 'pending',
          message: '等待处理...',
        });

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
