import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

export const runtime = 'edge';

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建增强的 prompt - 强调穿衣服、拟人化、独特风格
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';

  // 风格增强词 - 让图片更有分享欲
  const styleBoost = [
    'anthropomorphic character design',
    'wearing detailed costume and clothing',
    'standing upright like a human',
    'expressive face with personality',
    'viral social media worthy',
    'trending illustration style',
    'vibrant colors',
    'professional concept art',
    'highly detailed fabric textures',
  ].join(', ');

  return `An adorable ${petWord} character, ${basePrompt}, IMPORTANT: the ${petWord} MUST be wearing the costume/clothing described, ${styleBoost}, maintain the original pet's fur color and facial features, 8k quality, masterpiece`;
}

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
      console.log('Edge function call initiated (fire and forget):', err?.message || 'unknown');
    });

    console.log('🚀 已触发 Supabase Edge Function 处理:', jobId);
  } catch (error) {
    console.error('触发处理失败:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { petImage, petType, weights }: GenerateRequest = await request.json();

    if (!petImage || !petType || !weights) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 抽取稀有度和称号
    const rarity: Rarity = rollRarityWithBonus(weights);
    const titleData: TitleData = getRandomTitle(rarity, petType);
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log('🎲 稀有度:', rarity, '称号:', titleData.title);
    console.log('📝 原始 Prompt:', titleData.prompt);
    console.log('🎨 完整 Prompt:', enhancedPrompt);

    // 生成任务ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 保存任务到 Supabase
    const { error: insertError } = await supabase
      .from('generation_jobs')
      .insert({
        id: jobId,
        status: 'pending',
        pet_image: petImage,
        pet_type: petType,
        rarity: rarity,
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

    console.log('✅ 任务创建成功:', jobId);

    // 触发 Supabase Edge Function 处理（不等待）
    triggerProcessing(jobId);

    // 立即返回任务ID，让前端开始轮询
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        rarity,
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
