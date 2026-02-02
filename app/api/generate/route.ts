import { NextRequest, NextResponse } from 'next/server';
import { getRandomTitle, rollRarityWithBonus, Rarity, TitleData } from '@/lib/titles';

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

// 内存缓存存储任务状态（生产环境应该用 Redis 或数据库）
const taskCache = new Map<string, {
  status: 'pending' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  createdAt: number;
}>();

// 清理过期任务（5分钟）
function cleanupOldTasks() {
  const now = Date.now();
  for (const [taskId, task] of taskCache.entries()) {
    if (now - task.createdAt > 5 * 60 * 1000) {
      taskCache.delete(taskId);
    }
  }
}

// 构建增强的 prompt
function buildEnhancedPrompt(basePrompt: string, petType: 'cat' | 'dog'): string {
  const petWord = petType === 'cat' ? 'cat' : 'dog';
  return `A ${petWord}, ${basePrompt}, maintain the original pet's appearance and features, high quality, detailed`;
}

// 异步调用 AI 生成图片（不阻塞主请求）
async function generateImageAsync(
  taskId: string,
  petImage: string,
  petType: 'cat' | 'dog',
  enhancedPrompt: string,
  rarity: Rarity,
  titleData: TitleData
) {
  console.log(`[${taskId}] 开始异步生成图片...`);

  let generatedImageUrl = petImage; // 默认使用原图

  if (AI_CONFIG.apiKey) {
    try {
      const imageArray: string[] = [];

      if (petImage.startsWith('data:image')) {
        const base64Data = petImage.split(',')[1];
        imageArray.push(base64Data);
        console.log(`[${taskId}] 图片大小: ${Math.round(base64Data.length / 1024)}KB`);
      } else if (petImage.startsWith('http')) {
        imageArray.push(petImage);
      }

      const requestBody: Record<string, unknown> = {
        prompt: enhancedPrompt,
        model: AI_CONFIG.model,
        response_format: 'url',
        aspect_ratio: '1:1',
      };

      if (imageArray.length > 0) {
        requestBody.image = imageArray;
      }

      console.log(`[${taskId}] 调用 AI API...`);
      console.log(`[${taskId}] Prompt: ${enhancedPrompt}`);
      const startTime = Date.now();

      const response = await fetch(`${AI_CONFIG.baseUrl}${AI_CONFIG.endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(`[${taskId}] API 响应时间: ${Date.now() - startTime}ms`);
      console.log(`[${taskId}] API 响应状态: ${response.status}`);
      console.log(`[${taskId}] API 响应: ${JSON.stringify(data).substring(0, 500)}`);

      if (data.data && data.data[0] && data.data[0].url) {
        generatedImageUrl = data.data[0].url;
        console.log(`[${taskId}] ✅ 图片生成成功: ${generatedImageUrl}`);
      } else if (data.data && data.data[0] && data.data[0].b64_json) {
        generatedImageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        console.log(`[${taskId}] ✅ 图片生成成功 (base64)`);
      } else {
        console.log(`[${taskId}] ⚠️ API 返回格式异常:`, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`[${taskId}] ❌ AI 生成错误:`, error);
    }
  }

  // 更新任务状态
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

  taskCache.set(taskId, {
    status: 'completed',
    result,
    createdAt: Date.now(),
  });

  console.log(`[${taskId}] 任务完成，结果已缓存`);
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

    // 清理过期任务
    cleanupOldTasks();

    // 生成任务 ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 抽取稀有度和称号
    const rarity: Rarity = rollRarityWithBonus(weights);
    const titleData: TitleData = getRandomTitle(rarity, petType);
    const enhancedPrompt = buildEnhancedPrompt(titleData.prompt, petType);

    console.log(`[${taskId}] 新任务创建`);
    console.log(`[${taskId}] 稀有度: ${rarity}, 称号: ${titleData.title}`);

    // 初始化任务状态
    taskCache.set(taskId, {
      status: 'pending',
      createdAt: Date.now(),
    });

    // 异步执行图片生成（不等待）
    generateImageAsync(taskId, petImage, petType, enhancedPrompt, rarity, titleData)
      .catch(err => {
        console.error(`[${taskId}] 异步任务失败:`, err);
        taskCache.set(taskId, {
          status: 'failed',
          error: '生成失败',
          createdAt: Date.now(),
        });
      });

    // 立即返回任务 ID，让客户端轮询
    return NextResponse.json({
      success: true,
      taskId,
      message: '任务已创建，请轮询获取结果',
    });
  } catch (error) {
    console.error('生成错误:', error);
    return NextResponse.json(
      { success: false, error: '生成失败' },
      { status: 500 }
    );
  }
}

// GET 请求用于轮询任务状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: '缺少 taskId' },
      { status: 400 }
    );
  }

  const task = taskCache.get(taskId);

  if (!task) {
    return NextResponse.json(
      { success: false, error: '任务不存在或已过期' },
      { status: 404 }
    );
  }

  if (task.status === 'pending') {
    return NextResponse.json({
      success: true,
      status: 'pending',
      message: '正在生成中...',
    });
  }

  if (task.status === 'failed') {
    return NextResponse.json({
      success: false,
      status: 'failed',
      error: task.error,
    });
  }

  // 任务完成
  return NextResponse.json({
    success: true,
    status: 'completed',
    data: task.result,
  });
}
