import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build errors
let supabase: SupabaseClient | null = null;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// 管理员卡密
const ADMIN_CDKEY = 'DIANZI123';

export async function POST(request: NextRequest) {
  try {
    const { code, success: isSuccess } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: '缺少卡密参数' },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // 管理员卡密不需要处理
    if (upperCode === ADMIN_CDKEY) {
      return NextResponse.json({ success: true });
    }

    const db = getSupabase();

    if (isSuccess) {
      // 成功 - 标记为已使用
      const { error } = await db
        .from('cdkeys')
        .update({
          status: 'used',
          used_at: new Date().toISOString(),
        })
        .eq('code', upperCode);

      if (error) {
        console.error('❌ 标记卡密为已使用失败:', error);
        // 不返回错误，因为用户已经看到结果了
      } else {
        console.log('✅ 卡密已标记为已使用:', upperCode);
      }
    } else {
      // 失败 - 恢复为可用
      const { error } = await db
        .from('cdkeys')
        .update({ status: 'available' })
        .eq('code', upperCode)
        .eq('status', 'pending'); // 只有 pending 状态才能恢复

      if (error) {
        console.error('❌ 恢复卡密状态失败:', error);
      } else {
        console.log('✅ 卡密已恢复为可用:', upperCode);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('卡密完成处理错误:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
