import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization
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

// GET - Export all available cdkeys
export async function GET() {
  try {
    const db = getSupabase();

    // 先检测 schema 类型
    const { data: sample } = await db
      .from('cdkeys')
      .select('*')
      .limit(1);

    const useNewSchema = sample && sample.length > 0 && 'status' in sample[0];

    const allCodes: string[] = [];
    const pageSize = 1000;
    let offset = 0;
    let hasMore = true;

    if (useNewSchema) {
      // 新 schema: 分页获取所有 status='available' 的
      while (hasMore) {
        const { data, error } = await db
          .from('cdkeys')
          .select('code')
          .eq('status', 'available')
          .range(offset, offset + pageSize - 1)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          for (const item of data) {
            allCodes.push(item.code);
          }
          offset += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
    } else {
      // 旧 schema: 分页获取所有 is_active=true 的，然后过滤
      while (hasMore) {
        const { data, error } = await db
          .from('cdkeys')
          .select('code, used_count, total_uses')
          .eq('is_active', true)
          .range(offset, offset + pageSize - 1)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          for (const item of data) {
            const usedCount = item.used_count || 0;
            const totalUses = item.total_uses || 1;
            if (usedCount < totalUses) {
              allCodes.push(item.code);
            }
          }
          offset += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        codes: allCodes,
        count: allCodes.length,
      },
    });
  } catch (error) {
    console.error('Failed to export cdkeys:', error);
    return NextResponse.json(
      { success: false, error: `导出卡密失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}
