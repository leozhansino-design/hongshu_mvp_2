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

    // 获取所有可用的卡密
    const { data: cdkeys, error } = await db
      .from('cdkeys')
      .select('code')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Export error:', error);
      throw error;
    }

    const codes = cdkeys?.map(c => c.code) || [];

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
