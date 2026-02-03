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

// Generate a random cdkey
function generateCdkey(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
}

// 判断卡密状态（支持新旧两种数据库结构）
function getCdkeyStatus(cdkey: Record<string, unknown>): 'available' | 'used' | 'pending' {
  // 新结构：status 字段
  if (cdkey.status) {
    return cdkey.status as 'available' | 'used' | 'pending';
  }
  // 旧结构：is_active + used_count + total_uses
  if ('is_active' in cdkey) {
    if (!cdkey.is_active) return 'used';
    const usedCount = (cdkey.used_count as number) || 0;
    const totalUses = (cdkey.total_uses as number) || 1;
    return usedCount >= totalUses ? 'used' : 'available';
  }
  return 'available';
}

// GET - List cdkeys and stats
export async function GET() {
  try {
    const db = getSupabase();

    // 获取真实总数统计
    const { count: totalCount, error: countError } = await db
      .from('cdkeys')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    }

    // 获取展示用的卡密列表（只取最新100条用于展示）
    const { data: cdkeys, error } = await db
      .from('cdkeys')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // 检测使用哪种 schema
    const sample = cdkeys && cdkeys.length > 0 ? cdkeys[0] : null;
    const useNewSchema = sample ? 'status' in sample : false;

    let used = 0;
    let available = 0;

    if (useNewSchema) {
      // 新 schema: 用 status 字段统计
      const { count: usedCount } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'used');

      const { count: pendingCount } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: availableCount } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      used = (usedCount || 0) + (pendingCount || 0);
      available = availableCount || 0;
    } else {
      // 旧 schema: 用 is_active 和 used_count/total_uses 统计
      // 可用: is_active = true 且 used_count < total_uses
      const { count: activeCount } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 获取所有数据来计算真正的可用数（因为旧schema需要比较 used_count 和 total_uses）
      const { data: allCdkeys } = await db
        .from('cdkeys')
        .select('is_active, used_count, total_uses');

      if (allCdkeys) {
        available = allCdkeys.filter(c => {
          if (!c.is_active) return false;
          const usedCount = c.used_count || 0;
          const totalUses = c.total_uses || 1;
          return usedCount < totalUses;
        }).length;

        used = allCdkeys.filter(c => {
          if (!c.is_active) return true;
          const usedCount = c.used_count || 0;
          const totalUses = c.total_uses || 1;
          return usedCount >= totalUses;
        }).length;
      }
    }

    const total = totalCount || 0;

    const formattedCdkeys = cdkeys?.map(c => ({
      code: c.code,
      status: getCdkeyStatus(c),
      createdAt: c.created_at,
      usedAt: c.used_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        cdkeys: formattedCdkeys,
        stats: { total, used, available },
      },
    });
  } catch (error) {
    console.error('Failed to fetch cdkeys:', error);
    return NextResponse.json(
      { success: false, error: `获取卡密列表失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

// POST - Generate new cdkeys
export async function POST(request: NextRequest) {
  try {
    const db = getSupabase();
    const body = await request.json();
    const { count = 100, prefix = 'PET' } = body;

    // Validate count
    if (count < 1 || count > 10000) {
      return NextResponse.json(
        { success: false, error: '数量必须在 1-10000 之间' },
        { status: 400 }
      );
    }

    // 检测表结构，决定使用哪种格式
    const { data: sample } = await db
      .from('cdkeys')
      .select('*')
      .limit(1);

    // 判断使用新结构还是旧结构
    const useNewSchema = sample && sample.length > 0
      ? 'status' in sample[0]
      : true; // 默认使用新结构

    // Generate unique cdkeys
    const existingCodes = new Set<string>();

    // Get existing codes to avoid duplicates
    const { data: existing } = await db
      .from('cdkeys')
      .select('code');

    existing?.forEach(c => existingCodes.add(c.code));

    const cdkeysToInsert: Record<string, unknown>[] = [];
    let attempts = 0;

    while (cdkeysToInsert.length < count && attempts < count * 2) {
      const code = generateCdkey(prefix);
      if (!existingCodes.has(code)) {
        existingCodes.add(code);

        if (useNewSchema) {
          // 新结构
          cdkeysToInsert.push({
            code,
            status: 'available',
            remaining_uses: 1,
          });
        } else {
          // 旧结构
          cdkeysToInsert.push({
            code,
            is_active: true,
            total_uses: 1,
            used_count: 0,
          });
        }
      }
      attempts++;
    }

    // Insert in batches of 500 (smaller batch for stability)
    const batchSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < cdkeysToInsert.length; i += batchSize) {
      const batch = cdkeysToInsert.slice(i, i + batchSize);
      const { error } = await db
        .from('cdkeys')
        .insert(batch);

      if (error) {
        console.error('Batch insert error:', error);
        // 如果是列不存在的错误，尝试使用另一种结构
        if (error.message?.includes('column') || error.code === '42703') {
          // 尝试另一种结构
          const altBatch = batch.map(item => {
            if ('status' in item) {
              return {
                code: item.code,
                is_active: true,
                total_uses: 1,
                used_count: 0,
              };
            } else {
              return {
                code: item.code,
                status: 'available',
                remaining_uses: 1,
              };
            }
          });

          const { error: altError } = await db
            .from('cdkeys')
            .insert(altBatch);

          if (altError) {
            throw altError;
          }
        } else {
          throw error;
        }
      }

      insertedCount += batch.length;
    }

    return NextResponse.json({
      success: true,
      data: { count: insertedCount },
    });
  } catch (error) {
    console.error('Failed to generate cdkeys:', error);
    return NextResponse.json(
      { success: false, error: `生成卡密失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

// DELETE - Clear used cdkeys
export async function DELETE(request: NextRequest) {
  try {
    const db = getSupabase();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'clearAll') {
      // 清空所有卡密
      const { count } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true });

      const { error } = await db
        .from('cdkeys')
        .delete()
        .neq('code', ''); // 删除所有

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { deleted: count || 0 },
      });
    }

    if (action === 'clearUsed') {
      // 检测 schema 类型
      const { data: sample } = await db
        .from('cdkeys')
        .select('*')
        .limit(1);

      const useNewSchema = sample && sample.length > 0 && 'status' in sample[0];

      let deletedCount = 0;

      if (useNewSchema) {
        // 新 schema: 删除 status = 'used'
        const { count } = await db
          .from('cdkeys')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'used');

        const { error } = await db
          .from('cdkeys')
          .delete()
          .eq('status', 'used');

        if (error) throw error;
        deletedCount = count || 0;
      } else {
        // 旧 schema: 删除 is_active = false 或 used_count >= total_uses
        // 先获取所有需要删除的记录
        const { data: allCdkeys } = await db
          .from('cdkeys')
          .select('id, is_active, used_count, total_uses');

        const idsToDelete = allCdkeys?.filter(c => {
          if (!c.is_active) return true;
          const usedCount = c.used_count || 0;
          const totalUses = c.total_uses || 1;
          return usedCount >= totalUses;
        }).map(c => c.id) || [];

        if (idsToDelete.length > 0) {
          const { error } = await db
            .from('cdkeys')
            .delete()
            .in('id', idsToDelete);

          if (error) throw error;
        }

        deletedCount = idsToDelete.length;
      }

      return NextResponse.json({
        success: true,
        data: { deleted: deletedCount },
      });
    }

    return NextResponse.json(
      { success: false, error: '无效的操作' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to delete cdkeys:', error);
    return NextResponse.json(
      { success: false, error: '删除卡密失败' },
      { status: 500 }
    );
  }
}
