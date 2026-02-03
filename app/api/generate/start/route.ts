import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

export const runtime = 'edge';

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建真实风格的 prompt
// 重点：真实照片风格、清晰毛发、穿职业服装、美丽背景
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';

  // 替换 prompt 中的 "pet" 为具体的猫/狗
  let prompt = basePrompt.replace(/\bpet\b/gi, petWord);

  // 真实风格增强词 - 确保生成真实照片风格而不是艺术风格
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

  // 如果 prompt 不包含 cat/dog，在开头添加
  if (!prompt.toLowerCase().includes(petWord)) {
    prompt = `A ${petWord} ${prompt}`;
  }

  // 添加真实风格增强
  return `${prompt}, ${realisticStyle}`;
}

// 注意：Edge Function 由前端结果页面调用，这里不再重复调用
// 避免重复提交导致两次 API 调用

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
    // 使用 titles.ts 里的英文 prompt（已经为每个头衔精心设计）
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log('🎲 稀有度:', rarity, '称号:', titleData.title);
    console.log('📝 原始 Prompt:', titleData.prompt.substring(0, 100) + '...');
    console.log('🎨 最终 Prompt:', enhancedPrompt.substring(0, 100) + '...');

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

    // Edge Function 由前端结果页面调用，避免重复调用

    // 立即返回任务ID，让前端开始轮询
    return NextResponse.json({
      success: true,
      data: {
        jobId,
        rarity,
        title: titleData.title,
        prompt: enhancedPrompt,  // 返回完整 prompt 方便调试
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
