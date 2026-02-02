import { NextRequest, NextResponse } from 'next/server';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

// 使用 Edge Runtime - Hobby 计划最长 30 秒
export const runtime = 'edge';

// AI 图片生成配置
const AI_CONFIG = {
  baseUrl: process.env.AI_API_BASE_URL || 'https://api.bltcy.ai',
  apiKey: process.env.AI_API_KEY || '',
  model: 'nano-banana-2',
  endpoint: '/v1/images/generations',
};

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建增强的 prompt - 真实风格，穿衣服的宠物
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';

  // 真实风格增强词 - 不要卡通/动画风格
  const styleBoost = [
    'photorealistic',
    'realistic fur texture',
    'the pet MUST be wearing clothes or costume',
    'detailed fabric and clothing',
    'studio portrait lighting',
    'sharp focus on face',
    'professional photography',
    'hyperrealistic',
    '8k ultra detailed',
  ].join(', ');

  return `A real ${petWord} portrait, ${basePrompt}, ${styleBoost}, preserve the original pet's unique facial features and fur pattern, NOT cartoon, NOT illustration, NOT anime`;
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
    console.log('🎨 Prompt:', enhancedPrompt);

    // 检查 API Key 配置
    if (!AI_CONFIG.apiKey) {
      console.error('❌ 未配置 AI API Key');
      return NextResponse.json(
        { success: false, error: 'AI 服务未配置' },
        { status: 500 }
      );
    }

    // 准备图片数据
    const imageArray: string[] = [];
    if (petImage.startsWith('data:image')) {
      const base64Data = petImage.split(',')[1];
      imageArray.push(base64Data);
      console.log('📷 图片大小:', Math.round(base64Data.length / 1024), 'KB');
    } else if (petImage.startsWith('http')) {
      imageArray.push(petImage);
    }

    if (imageArray.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的图片格式' },
        { status: 400 }
      );
    }

    const requestBody: Record<string, unknown> = {
      prompt: enhancedPrompt,
      model: AI_CONFIG.model,
      response_format: 'url',
      aspect_ratio: '1:1',
      image: imageArray,
    };

    console.log('⏳ 调用 AI API...');
    console.log('🎨 Prompt:', enhancedPrompt);
    const startTime = Date.now();

    let generatedImageUrl: string | null = null;

    try {
      // 设置 28 秒超时（Edge Runtime 限制 30 秒，留 2 秒余量）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      console.log('⏱️ API 响应时间:', Date.now() - startTime, 'ms');
      console.log('📦 API 响应:', JSON.stringify(data).substring(0, 500));

      if (data.data && data.data[0] && data.data[0].url) {
        generatedImageUrl = data.data[0].url;
        console.log('✅ 图片生成成功:', generatedImageUrl);
      } else if (data.data && data.data[0] && data.data[0].b64_json) {
        generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        console.log('✅ 图片生成成功 (base64)');
      } else {
        console.error('❌ API 响应异常:', JSON.stringify(data));
        return NextResponse.json(
          { success: false, error: data.error?.message || 'AI 生成失败，请重试' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('❌ AI 生成错误:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'AI 服务响应超时，请重试' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: '网络错误，请重试' },
        { status: 500 }
      );
    }

    // 确保生成了图片才继续
    if (!generatedImageUrl) {
      return NextResponse.json(
        { success: false, error: 'AI 生成失败' },
        { status: 500 }
      );
    }

    // 生成结果
    const resultId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const result = {
      id: resultId,
      rarity,
      titleId: titleData.id,
      title: titleData.title,
      description: titleData.description,
      prompt: enhancedPrompt,
      originalImage: petImage,
      generatedImage: generatedImageUrl,
      petType,
    };

    console.log('📦 返回结果:', { id: resultId, rarity, title: titleData.title });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('生成错误:', error);
    return NextResponse.json(
      { success: false, error: '生成失败' },
      { status: 500 }
    );
  }
}
