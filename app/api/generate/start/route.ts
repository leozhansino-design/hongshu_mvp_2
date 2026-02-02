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
// 生成符合头衔的拟人化宠物形象
function buildEnhancedPrompt(title: string, description: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? '猫' : '狗';

  // 获取职业/身份描述
  const identityInfo = getIdentityDescription(title, petType);

  // 中文风格增强词
  const styleBoost = '超高清写实摄影风格，专业摄影棚灯光，毛发质感逼真，8K画质';

  return `一只${identityInfo.identity}${petWord}，${identityInfo.appearance}，${styleBoost}，保留原本宠物的毛色和面部特征`;
}

// 根据头衔获取身份和外观描述
function getIdentityDescription(title: string, petType: 'cat' | 'dog'): { identity: string; appearance: string } {
  const petWord = petType === 'cat' ? '猫' : '狗';

  // 头衔到身份的映射 - 使用更自然的职业/身份描述
  const identityMappings: { [key: string]: { identity: string; appearance: string } } = {
    // SSR
    '量子神猫': { identity: '神秘的星际旅行者', appearance: '穿着星光斗篷，眼睛闪烁着宇宙星辰的光芒' },
    '寂灭恐惧战神': { identity: '末日战士', appearance: '穿着黑色科幻机甲，周围电闪雷鸣' },
    '数字生命0号实验体': { identity: '赛博朋克黑客', appearance: '穿着霓虹灯光的科技外套，身上有发光电路纹路' },
    '万界唯一纯爱战士': { identity: '纯爱骑士', appearance: '穿着洁白的骑士盔甲，手持粉红水晶心' },
    '赛博佛祖': { identity: '机械禅师', appearance: '穿着金色电子袈裟，身后有巨大齿轮光环' },
    '机械降神': { identity: '机械禅师', appearance: '穿着金色电子袈裟，身后有巨大齿轮光环' },
    // SR
    '黑帮教父': { identity: '黑道大佬', appearance: '穿着黑色条纹西装，戴墨镜叼雪茄，坐在皮椅上' },
    '华尔街': { identity: '华尔街精英', appearance: '穿着高级蓝色衬衫，戴金丝眼镜，面前是股票曲线' },
    '皇家': { identity: '皇室贵族', appearance: '头戴镶红宝石王冠，身披红色天鹅绒斗篷' },
    '大公爵': { identity: '皇室贵族', appearance: '头戴镶红宝石王冠，身披红色天鹅绒斗篷' },
    '米其林': { identity: '米其林大厨', appearance: '戴高高的白色厨师帽，穿白色厨师服，手持金色锅铲' },
    '主厨': { identity: '米其林大厨', appearance: '戴高高的白色厨师帽，穿白色厨师服，手持金色锅铲' },
    '优雅': { identity: '名媛贵妇', appearance: '戴着珍珠项链，穿着蕾丝礼服，优雅端庄' },
    // R
    '超市': { identity: '购物狂', appearance: '推着堆满商品的购物车，穿着休闲T恤' },
    '扫货': { identity: '购物狂', appearance: '推着堆满商品的购物车，穿着休闲T恤' },
    '摸鱼': { identity: '摸鱼达人', appearance: '穿着宽松卫衣，躺在办公椅上打哈欠' },
    '办公室': { identity: '办公室白领', appearance: '穿着休闲商务装，坐在办公桌前' },
    '深夜食堂': { identity: '深夜食客', appearance: '围着围裙坐在居酒屋吧台，面前是一碗热腾腾的拉面' },
    '公园': { identity: '退休老干部', appearance: '穿着运动服戴遮阳帽，在公园长椅上晒太阳' },
    '遛弯': { identity: '退休老干部', appearance: '穿着运动服戴遮阳帽，在公园长椅上晒太阳' },
    '点赞': { identity: '网络冲浪达人', appearance: '拿着手机疯狂刷屏，表情专注' },
    // N
    '野猫': { identity: '流浪艺术家', appearance: '穿着破旧但有艺术感的衣服，眼神桀骜不驯' },
    '屌丝': { identity: '屌丝宅男', appearance: '穿着皱巴巴的格子衬衫，戴着厚眼镜' },
    '打不过': { identity: '弱鸡废柴', appearance: '穿着普通T恤，一脸无奈的表情' },
    '蟑螂': { identity: '弱鸡废柴', appearance: '穿着普通T恤，一脸无奈的表情' },
    '普通': { identity: '普通市民', appearance: '穿着简单朴素的日常服装' },
    '平凡': { identity: '平凡打工人', appearance: '穿着朴素的工装，表情疲惫但坚韧' },
  };

  // 尝试匹配头衔关键词
  for (const [key, value] of Object.entries(identityMappings)) {
    if (title.includes(key)) {
      return value;
    }
  }

  // 默认描述 - 根据稀有度猜测
  return { identity: '时尚达人', appearance: '穿着潮流服饰，气质出众' };
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
