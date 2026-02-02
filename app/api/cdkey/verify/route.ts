import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 管理员卡密 - 用于测试，无限使用
const ADMIN_CDKEY = 'DIANZI123';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '请输入卡密' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();
    console.log('🔑 验证卡密:', upperCode);

    // 管理员卡密 - 始终有效
    if (upperCode === ADMIN_CDKEY) {
      console.log('✅ 管理员卡密验证成功');
      return NextResponse.json({
        success: true,
        data: {
          code: ADMIN_CDKEY,
          type: 'admin',
          remainingUses: 999,
        },
      });
    }

    // 从 Supabase 查询卡密
    const { data: cdkey, error: queryError } = await supabase
      .from('cdkeys')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single();

    if (queryError || !cdkey) {
      console.log('❌ 卡密不存在或未激活:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密无效' },
        { status: 400 }
      );
    }

    // 检查是否过期
    if (cdkey.expires_at && new Date(cdkey.expires_at) < new Date()) {
      console.log('❌ 卡密已过期:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密已过期' },
        { status: 400 }
      );
    }

    // 检查使用次数
    if (cdkey.used_count >= cdkey.total_uses) {
      console.log('❌ 卡密已用完:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密已用完' },
        { status: 400 }
      );
    }

    // 增加使用次数
    const { error: updateError } = await supabase
      .from('cdkeys')
      .update({
        used_count: cdkey.used_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', cdkey.id);

    if (updateError) {
      console.error('❌ 更新卡密使用次数失败:', updateError);
      return NextResponse.json(
        { success: false, error: '服务器错误' },
        { status: 500 }
      );
    }

    console.log('✅ 卡密验证成功:', upperCode, '剩余次数:', cdkey.total_uses - cdkey.used_count - 1);

    return NextResponse.json({
      success: true,
      data: {
        code: cdkey.code,
        type: cdkey.type,
        remainingUses: cdkey.total_uses - cdkey.used_count - 1,
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
