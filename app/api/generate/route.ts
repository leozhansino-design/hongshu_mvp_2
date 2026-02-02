import { NextRequest, NextResponse } from 'next/server';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

// 设置 Vercel Serverless Function 最大执行时间为 60 秒
// 因为 AI 图片生成可能需要 15-30 秒
export const maxDuration = 60;

// AI 图片生成配置
const AI_CONFIG = {
  baseUrl: process.env.AI_API_BASE_URL || 'https://api.bltcy.ai',
  apiKey: process.env.AI_API_KEY || '',
  model: 'nano-banana-2', // 固定使用 nano-banana-2 模型
  endpoint: '/v1/images/generations',
};

interface GenerateRequest {
  petImage: string;
  petType: 'cat' | 'dog';
  weights: { SSR: number; SR: number; R: number; N: number };
}

// 构建增强的 prompt，融入宠物特征
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';
  // 在 prompt 中明确指定宠物类型，并添加保持宠物特征的描述
  return `A ${petWord}, ${basePrompt}, maintain the original pet's appearance and features, high quality, detailed`;
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

    // 构建增强的 prompt
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);
    console.log('🎨 发送 Prompt:', enhancedPrompt);

    let generatedImageUrl = petImage; // 默认使用原图

    // 调用 AI 生成图片
    console.log('🔑 API Key 状态:', AI_CONFIG.apiKey ? '已配置' : '未配置');
    console.log('🌐 API Base URL:', AI_CONFIG.baseUrl);

    if (AI_CONFIG.apiKey) {
      try {
        // 准备参考图片数组
        const imageArray: string[] = [];

        if (petImage.startsWith('data:image')) {
          // 提取 base64 数据（去掉 data:image/xxx;base64, 前缀）
          const base64Data = petImage.split(',')[1];
          imageArray.push(base64Data);
          console.log('📷 图片格式: base64, 大小:', Math.round(base64Data.length / 1024), 'KB');
        } else if (petImage.startsWith('http')) {
          // 如果是 URL，直接添加
          imageArray.push(petImage);
          console.log('📷 图片格式: URL');
        }

        // 准备请求体 - 使用 nano-banana-2 格式
        const requestBody: Record<string, unknown> = {
          prompt: enhancedPrompt,
          model: AI_CONFIG.model,
          response_format: 'url', // 返回 URL 格式
          aspect_ratio: '1:1', // 正方形图片
        };

        // 添加参考图片数组
        if (imageArray.length > 0) {
          requestBody.image = imageArray;
        }

        console.log('📤 API 请求配置:', {
          url: `${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`,
          model: AI_CONFIG.model,
          hasImage: imageArray.length > 0,
          imageSize: imageArray.length > 0 ? Math.round(imageArray[0].length / 1024) + 'KB' : 'N/A',
          prompt: enhancedPrompt,
        });

        console.log('⏳ 开始调用 AI API...');
        const startTime = Date.now();

        const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AI_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const endTime = Date.now();
        console.log(`⏱️ API 响应时间: ${endTime - startTime}ms`);

        const data = await response.json();
        console.log('🖼️ API 响应状态:', response.status);
        console.log('🖼️ API 响应内容:', JSON.stringify(data).substring(0, 1000));

        if (data.data && data.data[0] && data.data[0].url) {
          generatedImageUrl = data.data[0].url;
          console.log('✅ 图片生成成功:', generatedImageUrl);
        } else if (data.data && data.data[0] && data.data[0].b64_json) {
          // 如果返回的是 base64 格式
          generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
          console.log('✅ 图片生成成功 (base64)');
        } else {
          console.log('⚠️ 图片生成失败，完整 API 响应:', JSON.stringify(data));
          console.log('⚠️ 使用原图作为结果');
        }
      } catch (error) {
        console.error('❌ AI 生成错误:', error);
        console.error('❌ 错误详情:', error instanceof Error ? error.message : String(error));
        console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : 'N/A');
        // 失败时使用原图
      }
    } else {
      console.log('⚠️ 未配置 AI API Key，使用原图');
      console.log('💡 提示: 请在 .env.local 中配置 AI_API_KEY');
    }

    // 生成结果 ID（用于结果页面）
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
