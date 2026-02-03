import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

export const runtime = 'edge';

// 新的宠物类型：包含种类和性别
type PetTypeWithGender = 'cat_female' | 'cat_male' | 'dog_female' | 'dog_male';
type BasePetType = 'cat' | 'dog';
type PetGender = 'female' | 'male';

interface GenerateRequest {
  petImage: string;
  petType: PetTypeWithGender;
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 解析宠物类型和性别
function parsePetType(petType: PetTypeWithGender): { base: BasePetType; gender: PetGender } {
  if (petType.startsWith('cat')) {
    return { base: 'cat', gender: petType === 'cat_female' ? 'female' : 'male' };
  }
  return { base: 'dog', gender: petType === 'dog_female' ? 'female' : 'male' };
}

// 性别特征描述 - 只描述外貌特征，不强制服装
const GENDER_CHARACTERISTICS = {
  female: {
    cat: 'elegant female cat with graceful feminine features, soft gentle expression, beautiful eyelashes, delicate appearance',
    dog: 'lovely female dog with gentle feminine features, sweet expression, beautiful eyes, graceful appearance',
  },
  male: {
    cat: 'handsome male cat with strong masculine features, confident bold expression, sturdy build, dignified appearance',
    dog: 'handsome male dog with strong masculine features, confident expression, robust build, noble appearance',
  },
};

// 构建真实风格的 prompt（包含性别特征，但保留原有职业服装）
function buildEnhancedPrompt(basePrompt: string, petType: PetTypeWithGender): string {
  const { base, gender } = parsePetType(petType);
  const petWord = base === 'cat' ? 'cat' : 'dog';
  const genderFeatures = GENDER_CHARACTERISTICS[gender][base];

  // 替换 prompt 中的 "pet" 为具体的猫/狗
  let prompt = basePrompt.replace(/\bpet\b/gi, petWord);

  // 替换 "a cat" 或 "a dog" 为带性别的版本
  if (base === 'cat') {
    prompt = prompt.replace(/\ba cat\b/gi, `a ${gender} cat`);
    prompt = prompt.replace(/\bof a cat\b/gi, `of a ${gender} cat`);
  } else {
    prompt = prompt.replace(/\ba dog\b/gi, `a ${gender} dog`);
    prompt = prompt.replace(/\bof a dog\b/gi, `of a ${gender} dog`);
  }

  // 真实风格增强词
  const realisticStyle = [
    'ultra realistic photograph',
    'professional studio portrait',
    'detailed fur texture',
    'sharp focus',
    'beautiful lighting',
    'high quality 8K',
  ].join(', ');

  // 在 prompt 末尾添加性别特征（不改变服装，只增加外貌特征）
  return `${prompt}, ${genderFeatures}, ${realisticStyle}`;
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

    // 解析宠物类型（提取基础类型用于匹配称号）
    const { base: basePetType, gender } = parsePetType(petType);

    // 抽取稀有度和称号（使用基础类型匹配）
    const rarity: Rarity = rollRarityWithBonus(weights);
    const titleData: TitleData = getRandomTitle(rarity, basePetType);
    // 使用 titles.ts 里的英文 prompt（已经为每个头衔精心设计）+ 性别特征
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log('🐾 宠物:', basePetType, '性别:', gender);

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
