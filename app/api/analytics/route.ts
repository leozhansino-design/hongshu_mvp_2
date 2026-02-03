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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = getSupabase();

    // 获取用户信息
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    // 尝试保存到数据库
    try {
      const { error } = await db.from('analytics_events').insert({
        event_name: data.event_name,
        event_data: data.event_data || {},
        page_url: data.page_url,
        referrer: data.referrer,
        user_fingerprint: data.user_fingerprint || data.device_id,
        ip_address: ip,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      });

      if (error) {
        // 如果表不存在，只打印日志
        console.log('Analytics DB error (table may not exist):', error.message);
      }
    } catch (dbError) {
      // 数据库错误不影响响应
      console.log('Analytics save failed:', dbError);
    }

    // 打印日志（开发调试用）
    console.log('📊 埋点事件:', {
      event_name: data.event_name,
      event_data: data.event_data,
      page_url: data.page_url,
      timestamp: data.timestamp,
      fingerprint: data.user_fingerprint?.substring(0, 8),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('埋点错误:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
