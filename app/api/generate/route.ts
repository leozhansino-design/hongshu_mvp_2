import { NextRequest, NextResponse } from 'next/server';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

// AI 图片生成配置
const AI_CONFIG = {
  baseUrl: process.env.AI_API_BASE_URL || 'https://api.bltcy.ai',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'nano-banana-2',
  endpoint: '/v1/images/generations',
};

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
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

    // 根据权重抽取稀有度
    const rarity: Rarity = rollRarityWithBonus(weights);
    console.log('🎲 抽取稀有度:', rarity, '权重:', weights);

    // 获取随机称号
    const titleData: TitleData = getRandomTitle(rarity, petType);
    console.log('🏷️ 抽取称号:', titleData.title);
    console.log('🎨 发送 Prompt:', titleData.prompt);

    let generatedImageUrl = petImage; // 默认使用原图

    // 调用 AI 生成图片
    if (AI_CONFIG.apiKey) {
      try {
        const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AI_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: titleData.prompt,
            model: AI_CONFIG.model,
            image: petImage, // 原始宠物图片作为参考
          }),
        });

        const data = await response.json();
        console.log('🖼️ API 响应:', data);

        if (data.data && data.data[0] && data.data[0].url) {
          generatedImageUrl = data.data[0].url;
          console.log('✅ 图片生成成功:', generatedImageUrl);
        } else {
          console.log('⚠️ 图片生成失败，使用原图');
        }
      } catch (error) {
        console.error('❌ AI 生成错误:', error);
        // 失败时使用原图
      }
    } else {
      console.log('⚠️ 未配置 AI API Key，使用原图');
    }

    // 生成结果 ID（用于结果页面）
    const resultId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = {
      id: resultId,
      rarity,
      titleId: titleData.id,
      title: titleData.title,
      description: titleData.description,
      prompt: titleData.prompt,
      originalImage: petImage,
      generatedImage: generatedImageUrl,
      petType,
    };

    console.log('📦 生成结果:', { id: resultId, rarity, title: titleData.title });

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
