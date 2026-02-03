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

    // 获取真实总数统计（不限制数量）
    const { count: totalCount, error: countError } = await db
      .from('cdkeys')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    }

    // 获取各状态统计 - 新schema
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

    // 如果新schema统计有结果，使用新schema统计
    const total = totalCount || 0;
    const used = (usedCount || 0) + (pendingCount || 0); // pending也算已用
    const available = availableCount || 0;

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

    if (action === 'clearUsed') {
      // Count used cdkeys first
      const { count: usedCount } = await db
        .from('cdkeys')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'used');

      // Delete used cdkeys
      const { error } = await db
        .from('cdkeys')
        .delete()
        .eq('status', 'used');

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: { deleted: usedCount || 0 },
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
