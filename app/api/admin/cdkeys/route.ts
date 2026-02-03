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

// GET - List cdkeys and stats
export async function GET() {
  try {
    const db = getSupabase();
    // Get all cdkeys
    const { data: cdkeys, error } = await db
      .from('cdkeys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats
    const total = cdkeys?.length || 0;
    const used = cdkeys?.filter(c => c.status === 'used').length || 0;
    const available = cdkeys?.filter(c => c.status === 'available').length || 0;

    const formattedCdkeys = cdkeys?.map(c => ({
      code: c.code,
      status: c.status,
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
      { success: false, error: '获取卡密列表失败' },
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

    // Generate unique cdkeys
    const cdkeys: { code: string; status: string; remaining_uses: number }[] = [];
    const existingCodes = new Set<string>();

    // Get existing codes to avoid duplicates
    const { data: existing } = await db
      .from('cdkeys')
      .select('code');

    existing?.forEach(c => existingCodes.add(c.code));

    let attempts = 0;
    while (cdkeys.length < count && attempts < count * 2) {
      const code = generateCdkey(prefix);
      if (!existingCodes.has(code)) {
        existingCodes.add(code);
        cdkeys.push({
          code,
          status: 'available',
          remaining_uses: 1,
        });
      }
      attempts++;
    }

    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < cdkeys.length; i += batchSize) {
      const batch = cdkeys.slice(i, i + batchSize);
      const { error } = await db
        .from('cdkeys')
        .insert(batch);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      data: { count: cdkeys.length },
    });
  } catch (error) {
    console.error('Failed to generate cdkeys:', error);
    return NextResponse.json(
      { success: false, error: '生成卡密失败' },
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
