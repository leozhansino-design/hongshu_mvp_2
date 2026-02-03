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

    let codes: string[] = [];

    if (useNewSchema) {
      // 新 schema: 用 status 字段
      const { data: cdkeys, error } = await db
        .from('cdkeys')
        .select('code')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      codes = cdkeys?.map(c => c.code) || [];
    } else {
      // 旧 schema: 用 is_active 和 used_count/total_uses
      const { data: cdkeys, error } = await db
        .from('cdkeys')
        .select('code, is_active, used_count, total_uses')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      // 过滤出真正可用的（used_count < total_uses）
      codes = cdkeys?.filter(c => {
        const usedCount = c.used_count || 0;
        const totalUses = c.total_uses || 1;
        return usedCount < totalUses;
      }).map(c => c.code) || [];
    }

    return NextResponse.json({
      success: true,
      data: {
        codes,
        count: codes.length,
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
