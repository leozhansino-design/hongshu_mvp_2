// AI 图片生成配置 (Nano Banana 2)

const AI_CONFIG = {
  baseUrl: process.env.AI_API_BASE_URL || 'https://api.bltcy.ai',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'gemini-3-pro-image-preview',
  endpoint: '/v1/images/generations'
};

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function generateImage(prompt: string, imageUrl?: string): Promise<GenerateImageResult> {
  console.log('🎨 发送 Prompt:', prompt);

  try {
    const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        model: AI_CONFIG.model,
        image: imageUrl, // 原始宠物图片（如果是 img2img 模式）
      })
    });

    const data = await response.json();
    console.log('🖼️ API 响应:', data);

    if (data.data && data.data[0] && data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url
      };
    }

    return {
      success: false,
      error: data.error?.message || '图片生成失败'
    };
  } catch (error) {
    console.error('AI 生成错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}
