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

    // 先查询卡密，检测 schema 类型
    const { data: cdkey } = await db
      .from('cdkeys')
      .select('*')
      .eq('code', upperCode)
      .single();

    if (!cdkey) {
      console.log('⚠️ 卡密不存在，跳过处理:', upperCode);
      return NextResponse.json({ success: true });
    }

    // 检测是新 schema 还是旧 schema
    const useNewSchema = 'status' in cdkey;

    if (isSuccess) {
      // 成功 - 标记为已使用
      if (useNewSchema) {
        // 新 schema: 更新 status
        const { error } = await db
          .from('cdkeys')
          .update({
            status: 'used',
            used_at: new Date().toISOString(),
          })
          .eq('code', upperCode);

        if (error) {
          console.error('❌ 标记卡密为已使用失败:', error);
        } else {
          console.log('✅ 卡密已标记为已使用 (新schema):', upperCode);
        }
      } else {
        // 旧 schema: is_active 设为 false 或增加 used_count
        // 因为 verify 时已经增加了 used_count，这里只需确认
        console.log('✅ 卡密已使用 (旧schema, verify时已扣次数):', upperCode);
      }
    } else {
      // 失败 - 恢复为可用
      if (useNewSchema) {
        // 新 schema: 恢复 status
        const { error } = await db
          .from('cdkeys')
          .update({ status: 'available' })
          .eq('code', upperCode)
          .eq('status', 'pending');

        if (error) {
          console.error('❌ 恢复卡密状态失败:', error);
        } else {
          console.log('✅ 卡密已恢复为可用 (新schema):', upperCode);
        }
      } else {
        // 旧 schema: 恢复 used_count
        const usedCount = cdkey.used_count || 0;
        if (usedCount > 0) {
          const { error } = await db
            .from('cdkeys')
            .update({
              used_count: usedCount - 1,
              updated_at: new Date().toISOString(),
            })
            .eq('code', upperCode);

          if (error) {
            console.error('❌ 恢复卡密使用次数失败:', error);
          } else {
            console.log('✅ 卡密使用次数已恢复 (旧schema):', upperCode);
          }
        }
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
