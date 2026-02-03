import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getTitleById, TitleData } from '@/lib/titles';

export const runtime = 'edge';

interface PromoteRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  titleId: number;
}

// 构建真实风格的 prompt
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';
  let prompt = basePrompt.replace(/\bpet\b/gi, petWord);

  const realisticStyle = [
    'ultra realistic photograph',
    'professional studio portrait',
    'detailed fur texture',
    'sharp focus',
    'beautiful lighting',
    'high quality 8K',
    'wearing professional clothes',
    'elegant background',
  ].join(', ');

  if (!prompt.toLowerCase().includes(petWord)) {
    prompt = `A ${petWord} ${prompt}`;
  }

  return `${prompt}, ${realisticStyle}`;
}

export async function POST(request: NextRequest) {
  try {
    const { petImage, petType, titleId }: PromoteRequest = await request.json();

    if (!petImage || !petType || !titleId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取指定的头衔
    const titleData = getTitleById(titleId);
    if (!titleData) {
      return NextResponse.json(
        { success: false, error: '头衔不存在' },
        { status: 400 }
      );
    }

    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log('🎯 Promote 生成:', titleData.title);
    console.log('🎨 Prompt:', enhancedPrompt.substring(0, 100) + '...');

    // 生成任务ID
    const jobId = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 保存任务到 Supabase
    const { error: insertError } = await supabase
      .from('generation_jobs')
      .insert({
        id: jobId,
        status: 'pending',
        pet_image: petImage,
        pet_type: petType,
        rarity: titleData.rarity,
        title_id: titleData.id,
        title: titleData.title,
        description: titleData.description,
        prompt: enhancedPrompt,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ 保存任务失败:', insertError);
      return NextResponse.json(
        { success: false, error: '创建任务失败' },
        { status: 500 }
      );
    }

    console.log('✅ Promote 任务创建成功:', jobId);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        rarity: titleData.rarity,
        title: titleData.title,
      },
    });
  } catch (error) {
    console.error('创建任务错误:', error);
    return NextResponse.json(
      { success: false, error: '创建任务失败' },
      { status: 500 }
    );
  }
}
