import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 管理员卡密 - 用于测试，无限使用
const ADMIN_CDKEY = 'DIANZI123';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '请输入卡密', errorType: 'empty' },
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

    // 首先尝试新的 cdkeys 表（status 字段）
    const { data: newCdkey, error: newQueryError } = await supabase
      .from('cdkeys')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (!newQueryError && newCdkey) {
      // 检查状态
      if (newCdkey.status === 'used') {
        console.log('❌ 卡密已使用:', upperCode);
        return NextResponse.json(
          { success: false, error: '该卡密已被使用，请使用新的卡密', errorType: 'used' },
          { status: 400 }
        );
      }

      if (newCdkey.status === 'pending') {
        console.log('⏳ 卡密正在使用中:', upperCode);
        return NextResponse.json(
          { success: false, error: '该卡密正在处理中，请稍后重试或联系客服', errorType: 'pending' },
          { status: 400 }
        );
      }

      // 将状态改为 pending
      const { error: updateError } = await supabase
        .from('cdkeys')
        .update({ status: 'pending' })
        .eq('code', upperCode);

      if (updateError) {
        console.error('❌ 更新卡密状态失败:', updateError);
        return NextResponse.json(
          { success: false, error: '服务器繁忙，请稍后重试', errorType: 'server' },
          { status: 500 }
        );
      }

      console.log('✅ 卡密验证成功 (新表):', upperCode);
      return NextResponse.json({
        success: true,
        data: {
          code: upperCode,
          type: 'standard',
          remainingUses: 1,
        },
      });
    }

    // 回退到旧的 cdkeys 表结构（is_active, total_uses 等）
    const { data: cdkey, error: queryError } = await supabase
      .from('cdkeys')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .single();

    if (queryError || !cdkey) {
      console.log('❌ 卡密不存在或无效:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密无效，请检查输入是否正确', errorType: 'invalid' },
        { status: 400 }
      );
    }

    // 检查是否过期
    if (cdkey.expires_at && new Date(cdkey.expires_at) < new Date()) {
      console.log('❌ 卡密已过期:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密已过期，请购买新的卡密', errorType: 'expired' },
        { status: 400 }
      );
    }

    // 检查使用次数
    if (cdkey.used_count >= cdkey.total_uses) {
      console.log('❌ 卡密已用完:', upperCode);
      return NextResponse.json(
        { success: false, error: '卡密使用次数已用完，请购买新的卡密', errorType: 'exhausted' },
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
        { success: false, error: '服务器繁忙，请稍后重试', errorType: 'server' },
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
      { success: false, error: '服务器错误，请稍后重试', errorType: 'server' },
      { status: 500 }
    );
  }
}
