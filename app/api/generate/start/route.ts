import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

export const runtime = 'edge';

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建中文 prompt - 可灵模型使用中文效果更好
// 包含头衔信息，生成符合头衔身份的图片
function buildEnhancedPrompt(title: string, description: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? '猫咪' : '狗狗';

  // 从头衔提取关键特征
  const titleKeywords = extractTitleKeywords(title);

  // 中文风格增强词
  const styleBoost = [
    '超高清写实风格',
    '穿着精致服装',
    '专业摄影棚灯光',
    '面部特写清晰',
    '毛发质感逼真',
    '8K超高清画质',
  ].join('，');

  return `一只${petWord}的写真照片，身份是「${title}」，${titleKeywords}，${styleBoost}，保留原本宠物的毛色和面部特征`;
}

// 根据头衔提取关键描述词
function extractTitleKeywords(title: string): string {
  // 根据不同头衔类型返回对应的视觉描述
  const titleMappings: { [key: string]: string } = {
    '量子神猫': '穿着星光斗篷，神秘的眼神，周围有宇宙星辰',
    '寂灭恐惧战神': '穿着黑色机甲盔甲，威风凛凛，周围有闪电',
    '数字生命0号实验体': '穿着赛博朋克风格服装，身上有发光电路',
    '万界唯一纯爱战士': '穿着白色骑士盔甲，手持粉色水晶心',
    '赛博佛祖·机械降神': '穿着金色袈裟，身后有齿轮状光环',
    '黑帮教父': '穿着黑色条纹西装，戴墨镜，叼着雪茄',
    '华尔街金牌交易员': '穿着蓝色衬衫，戴金边眼镜，看着股票图表',
    '皇家大公爵': '戴着红宝石王冠，穿着红色天鹅绒斗篷',
    '米其林三星主厨': '戴着高高的厨师帽，穿着白色厨师服',
    '优雅永不过时': '戴着珍珠项链，穿着蕾丝披肩',
    '超市扫货王': '推着满满的购物车，穿着购物达人T恤',
    '办公室摸鱼冠军': '穿着休闲办公装，躺在办公椅上',
    '深夜食堂常客': '围着围裙，在深夜小店里吃面',
    '公园遛弯达人': '穿着运动服，戴着遮阳帽',
    '朋友圈点赞狂魔': '拿着手机，疯狂点赞',
  };

  // 尝试匹配头衔关键词
  for (const [key, value] of Object.entries(titleMappings)) {
    if (title.includes(key)) {
      return value;
    }
  }

  // 默认描述
  return '穿着时尚服装，气质独特';
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
