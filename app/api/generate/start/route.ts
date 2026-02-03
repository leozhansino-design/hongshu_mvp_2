import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitleEqual, TitleData } from '@/lib/titles';

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
// 最重要：必须保留原图宠物的特征（毛色、脸型、眼睛等）
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

  // 【最重要】保留原图宠物特征的指令 - 放在最前面
  const preserveOriginal = [
    'IMPORTANT: preserve the exact appearance of the pet from the reference image',
    'keep the same fur color and pattern',
    'maintain the original face shape and facial features',
    'same eye color and expression',
    'the pet must be recognizable as the same individual',
  ].join(', ');

  // 【强制穿衣服】- 必须穿着服装
  const mustWearClothes = [
    'MUST be wearing clothes or costume',
    'wearing a cute outfit or uniform matching the theme',
    'detailed clothing with visible fabric texture',
  ].join(', ');

  // 眼睛优化 - 大瞳孔、圆眼睛、更萌
  const cuteEyes = [
    'adorable big round eyes',
    'large dilated pupils like in dim light',
    'sparkling innocent eyes',
    'extremely cute expression',
  ].join(', ');

  // 美化效果 - 让宠物更漂亮可爱
  const beautify = [
    'enhanced beauty',
    'fluffy well-groomed fur',
    'photogenic and adorable',
    'magazine cover quality',
  ].join(', ');

  // 真实风格增强词
  const realisticStyle = [
    'ultra realistic photograph',
    'professional studio portrait',
    'detailed fur texture matching the original',
    'sharp focus',
    'beautiful lighting',
    'high quality 8K',
  ].join(', ');

  // 组合：保留原图特征 + 必须穿衣服 + 职业prompt + 性别特征 + 可爱眼睛 + 美化 + 真实风格
  return `${preserveOriginal}, ${mustWearClothes}, ${prompt}, ${genderFeatures}, ${cuteEyes}, ${beautify}, ${realisticStyle}`;
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

    // 抽取称号（所有100个称号概率均等，每个1%）
    const titleData: TitleData = getRandomTitleEqual(basePetType);
    // 稀有度由抽到的称号决定
    const rarity = titleData.rarity;
    // 使用 titles.ts 里的英文 prompt（已经为每个头衔精心设计）+ 性别特征
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log('🐾 宠物:', basePetType, '性别:', gender);

    console.log('🎲 抽到称号:', titleData.title, '稀有度:', rarity);
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
