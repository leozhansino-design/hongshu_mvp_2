import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

// 这个 endpoint 只做状态检查，不处理任务
// 任务处理由前端直接调用 Supabase Edge Function 完成

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
        return NextResponse.json({
          success: true,
          status: 'processing',
          message: '正在生成中...',
        });

      case 'pending':
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
