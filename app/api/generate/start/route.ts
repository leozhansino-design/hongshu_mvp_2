import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

export const runtime = 'edge';

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建英文 prompt - Midjourney 用英文效果更好
// 生成符合头衔的拟人化宠物形象
function buildEnhancedPrompt(title: string, description: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';

  // 获取英文描述
  const promptInfo = getEnglishPrompt(title, petType);

  // MJ 风格增强词
  const styleBoost = 'ultra realistic pet portrait photography, professional studio lighting, detailed fur texture, 8K quality, cinematic';

  return `A ${petWord} as a ${promptInfo.role}, ${promptInfo.appearance}, ${styleBoost}, preserve the original pet face and fur color`;
}

// 根据头衔获取英文 prompt 描述
function getEnglishPrompt(title: string, petType: 'cat' | 'dog'): { role: string; appearance: string } {
  // 头衔到英文描述的映射
  const promptMappings: { [key: string]: { role: string; appearance: string } } = {
    // SSR - 神级
    '量子神猫': { role: 'mystical space traveler', appearance: 'wearing a starlight cloak, eyes glowing with cosmic aurora, surrounded by galaxies' },
    '寂灭恐惧战神': { role: 'apocalypse warrior', appearance: 'wearing black carbon fiber mecha armor, surrounded by blue lightning' },
    '数字生命0号实验体': { role: 'cyberpunk hacker', appearance: 'wearing neon tech jacket, glowing circuit patterns on body, matrix style' },
    '万界唯一纯爱战士': { role: 'pure love knight', appearance: 'wearing white knight armor, holding a glowing pink crystal heart' },
    '赛博佛祖': { role: 'cyber buddha', appearance: 'wearing golden electronic robe, giant gear-shaped halo behind' },
    '机械降神': { role: 'deus ex machina', appearance: 'steampunk sacred style, brass and gold mechanical body' },
    // SR - 精英
    '黑帮教父': { role: 'mafia godfather', appearance: 'wearing black pinstripe suit, sunglasses, smoking cigar, sitting in leather chair' },
    '华尔街': { role: 'Wall Street elite', appearance: 'wearing expensive blue shirt, gold-rimmed glasses, stock charts behind' },
    '皇家': { role: 'royal aristocrat', appearance: 'wearing ruby crown, red velvet cape, noble and majestic' },
    '大公爵': { role: 'grand duke', appearance: 'wearing ornate crown, royal robe, in baroque palace' },
    '米其林': { role: 'Michelin star chef', appearance: 'wearing tall white chef hat, white chef uniform, holding golden spatula' },
    '主厨': { role: 'master chef', appearance: 'professional chef attire, in high-end kitchen, culinary excellence' },
    '优雅': { role: 'elegant socialite', appearance: 'wearing pearl necklace, lace dress, sophisticated and graceful' },
    // R - 稀有
    '超市': { role: 'shopping enthusiast', appearance: 'pushing overflowing shopping cart, wearing casual clothes, supermarket background' },
    '扫货': { role: 'bargain hunter', appearance: 'surrounded by shopping bags, excited expression' },
    '摸鱼': { role: 'office slacker', appearance: 'wearing hoodie, lounging in office chair, relaxed expression' },
    '办公室': { role: 'office worker', appearance: 'wearing business casual, at office desk with computer' },
    '深夜食堂': { role: 'late night diner', appearance: 'sitting at izakaya bar, bowl of ramen, cozy atmosphere' },
    '公园': { role: 'park regular', appearance: 'wearing athletic clothes, sun hat, sitting on park bench' },
    '遛弯': { role: 'morning walker', appearance: 'casual sportswear, peaceful park setting' },
    '点赞': { role: 'social media addict', appearance: 'holding phone, scrolling intensely, notification icons around' },
    // N - 普通
    '野猫': { role: 'street artist', appearance: 'wearing worn but artistic clothes, rebellious expression' },
    '屌丝': { role: 'nerd', appearance: 'wearing wrinkled plaid shirt, thick glasses, messy hair' },
    '打不过': { role: 'underdog', appearance: 'wearing plain t-shirt, helpless expression, comedic' },
    '蟑螂': { role: 'survivor', appearance: 'ordinary clothes, determined but tired expression' },
    '普通': { role: 'everyday citizen', appearance: 'simple casual clothes, friendly expression' },
    '平凡': { role: 'hardworking commoner', appearance: 'work clothes, tired but resilient expression' },
  };

  // 尝试匹配头衔关键词
  for (const [key, value] of Object.entries(promptMappings)) {
    if (title.includes(key)) {
      return value;
    }
  }

  // 默认描述
  return { role: 'fashionista', appearance: 'wearing trendy outfit, stylish and cool' };
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
    // 使用头衔和描述构建中文 prompt（而不是英文 prompt）
    const enhancedPrompt = buildEnhancedPrompt(titleData.title, titleData.description, petType);

    console.log('🎲 稀有度:', rarity, '称号:', titleData.title);
    console.log('📝 头衔描述:', titleData.description);
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
