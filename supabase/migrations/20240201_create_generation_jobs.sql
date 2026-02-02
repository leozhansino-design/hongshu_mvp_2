-- 创建 generation_jobs 表用于异步图片生成
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  pet_image TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  title_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  generated_image TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  processing_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON generation_jobs(created_at);

-- 启用 RLS (行级安全)
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入和查询（因为我们使用 anon key）
CREATE POLICY "Allow insert for all" ON generation_jobs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow select for all" ON generation_jobs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow update for all" ON generation_jobs FOR UPDATE TO anon USING (true);

-- 启用 Realtime（关键！用于前端实时监听状态更新）
ALTER PUBLICATION supabase_realtime ADD TABLE generation_jobs;

-- 自动清理30天前的记录（可选）
-- 需要先启用 pg_cron 扩展
-- SELECT cron.schedule('cleanup-old-jobs', '0 0 * * *', $$DELETE FROM generation_jobs WHERE created_at < NOW() - INTERVAL '30 days'$$);
