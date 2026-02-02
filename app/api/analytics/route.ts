import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 测试阶段只打印日志
    console.log('📊 埋点事件:', {
      event_name: data.event_name,
      event_data: data.event_data,
      page_url: data.page_url,
      timestamp: data.timestamp,
    });

    // TODO: 实际生产中应该写入 Supabase
    // const { error } = await supabase.from('analytics_events').insert({
    //   event_name: data.event_name,
    //   event_data: data.event_data,
    //   page_url: data.page_url,
    //   referrer: data.referrer,
    //   user_fingerprint: data.user_fingerprint,
    //   ip_address: request.ip,
    //   user_agent: request.headers.get('user-agent'),
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('埋点错误:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
