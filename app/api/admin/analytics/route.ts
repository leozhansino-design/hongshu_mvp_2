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

export async function GET(request: NextRequest) {
  try {
    const db = getSupabase();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'week';

    // 计算日期范围
    const now = new Date();
    let startDate: Date;

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 获取用户统计（从 analytics_events 表）
    const { count: totalUsers } = await db
      .from('analytics_events')
      .select('user_fingerprint', { count: 'exact', head: true });

    // 今日新用户
    const { count: todayUsers } = await db
      .from('analytics_events')
      .select('user_fingerprint', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    // 获取生成任务统计
    const { count: totalGenerations } = await db
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true });

    const { count: todayGenerations } = await db
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    // 成功率
    const { count: completedJobs } = await db
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const successRate = totalGenerations && totalGenerations > 0
      ? ((completedJobs || 0) / totalGenerations) * 100
      : 0;

    // 热门称号
    const { data: titleStats } = await db
      .from('generation_jobs')
      .select('title')
      .eq('status', 'completed')
      .gte('created_at', startDateStr);

    const titleCounts: Record<string, number> = {};
    titleStats?.forEach(job => {
      if (job.title) {
        titleCounts[job.title] = (titleCounts[job.title] || 0) + 1;
      }
    });

    const topTitles = Object.entries(titleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }));

    // 最近事件
    const { data: recentEvents } = await db
      .from('analytics_events')
      .select('event_name, created_at, user_fingerprint')
      .order('created_at', { ascending: false })
      .limit(20);

    const formattedEvents = recentEvents?.map(event => ({
      event: event.event_name,
      time: new Date(event.created_at).toLocaleString('zh-CN'),
      device: event.user_fingerprint?.substring(0, 8) || '未知',
    })) || [];

    // 每日统计
    const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
    const dailyStats: { date: string; users: number; generations: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

      const { count: dayUsers } = await db
        .from('analytics_events')
        .select('user_fingerprint', { count: 'exact', head: true })
        .gte('created_at', dayStart)
        .lt('created_at', dayEnd);

      const { count: dayGenerations } = await db
        .from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart)
        .lt('created_at', dayEnd);

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users: dayUsers || 0,
        generations: dayGenerations || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        totalGenerations: totalGenerations || 0,
        todayGenerations: todayGenerations || 0,
        successRate,
        topTitles,
        recentEvents: formattedEvents,
        dailyStats,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    // 返回默认数据，避免前端崩溃
    return NextResponse.json({
      success: true,
      data: {
        totalUsers: 0,
        todayUsers: 0,
        totalGenerations: 0,
        todayGenerations: 0,
        successRate: 0,
        topTitles: [],
        recentEvents: [],
        dailyStats: [],
      },
    });
  }
}
