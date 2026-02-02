import { NextRequest, NextResponse } from 'next/server';

// 测试用卡密列表（实际生产中应该从数据库读取）
const TEST_CDKEYS = [
  { code: 'TEST001', totalUses: 10, usedCount: 0, isActive: true },
  { code: 'TEST002', totalUses: 5, usedCount: 0, isActive: true },
  { code: 'DEMO123', totalUses: 100, usedCount: 0, isActive: true },
  { code: 'VIP888', totalUses: 1, usedCount: 0, isActive: true },
];

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '请输入卡密' },
        { status: 400 }
      );
    }

    console.log('🔑 验证卡密:', code);

    // 查找卡密
    const cdkey = TEST_CDKEYS.find(
      (k) => k.code === code.toUpperCase() && k.isActive
    );

    if (!cdkey) {
      return NextResponse.json(
        { success: false, error: '卡密无效' },
        { status: 400 }
      );
    }

    // 检查使用次数
    if (cdkey.usedCount >= cdkey.totalUses) {
      return NextResponse.json(
        { success: false, error: '卡密已用完' },
        { status: 400 }
      );
    }

    // 增加使用次数
    cdkey.usedCount++;

    console.log('✅ 卡密验证成功:', code);

    return NextResponse.json({
      success: true,
      data: {
        code: cdkey.code,
        remainingUses: cdkey.totalUses - cdkey.usedCount,
      },
    });
  } catch (error) {
    console.error('卡密验证错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
