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

// 性别特征描述
const GENDER_CHARACTERISTICS = {
  female: {
    cat: 'elegant female cat with graceful features, feminine appearance, beautiful eyelashes',
    dog: 'lovely female dog with gentle features, feminine appearance, beautiful eyes',
    clothing: 'wearing elegant feminine attire, dress, skirt, or fashionable womens clothing',
    avoid: 'avoid masculine suits, ties, or overly formal male business attire',
  },
  male: {
    cat: 'handsome male cat with strong features, masculine appearance, confident look',
    dog: 'handsome male dog with strong features, masculine appearance, confident look',
    clothing: 'wearing smart masculine attire, suit, tie, or professional mens clothing',
    avoid: 'avoid dresses, skirts, or feminine clothing',
  },
};

// 构建真实风格的 prompt（包含性别特征）
function buildEnhancedPrompt(basePrompt: string, petType: PetTypeWithGender): string {
  const { base, gender } = parsePetType(petType);
  const petWord = base === 'cat' ? 'cat' : 'dog';
  const genderChar = GENDER_CHARACTERISTICS[gender];

  // 替换 prompt 中的 "pet" 为具体的猫/狗（带性别特征）
  let prompt = basePrompt.replace(/\bpet\b/gi, `${gender} ${petWord}`);

  // 替换 "cat" 或 "dog" 为带性别特征的版本
  if (base === 'cat') {
    prompt = prompt.replace(/\bcat\b/gi, `${gender} cat`);
  } else {
    prompt = prompt.replace(/\bdog\b/gi, `${gender} dog`);
  }

  // 真实风格增强词 - 确保生成真实照片风格而不是艺术风格
  const realisticStyle = [
    'ultra realistic photograph',
    'professional studio portrait',
    'detailed fur texture',
    'sharp focus',
    'beautiful lighting',
    'high quality 8K',
  ].join(', ');

  // 性别特征增强
  const genderEnhancement = `${genderChar[base]}, ${genderChar.clothing}`;

  // 如果 prompt 不包含 cat/dog，在开头添加
  if (!prompt.toLowerCase().includes(petWord)) {
    prompt = `A ${gender} ${petWord} ${prompt}`;
  }

  // 添加真实风格增强和性别特征
  return `${prompt}, ${genderEnhancement}, ${realisticStyle}`;
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
