-- =============================================
-- 宠物真实身份 - Supabase 数据库表创建脚本
-- 在 Supabase Dashboard → SQL Editor 中运行
-- =============================================

-- 1. 卡密表
CREATE TABLE IF NOT EXISTS cdkeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'normal' CHECK (type IN ('normal', 'vip')),
  total_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cdkeys_code ON cdkeys(code);
CREATE INDEX IF NOT EXISTS idx_cdkeys_is_active ON cdkeys(is_active);

-- 2. 分析事件表
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_fingerprint VARCHAR(100),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);

-- 3. 抽卡结果表（用于统计和分享）
CREATE TABLE IF NOT EXISTS gacha_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id VARCHAR(100) UNIQUE NOT NULL,
  user_fingerprint VARCHAR(100),
  pet_type VARCHAR(10) CHECK (pet_type IN ('cat', 'dog')),
  rarity VARCHAR(10) CHECK (rarity IN ('SSR', 'SR', 'R', 'N')),
  title_id INTEGER,
  title VARCHAR(100),
  description TEXT,
  original_image TEXT,
  generated_image TEXT,
  cdkey_code VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_gacha_result_id ON gacha_results(result_id);
CREATE INDEX IF NOT EXISTS idx_gacha_rarity ON gacha_results(rarity);
CREATE INDEX IF NOT EXISTS idx_gacha_created_at ON gacha_results(created_at);

-- 4. 插入测试卡密
INSERT INTO cdkeys (code, type, total_uses, note) VALUES
  ('TEST001', 'normal', 999, '测试卡密'),
  ('DEMO123', 'normal', 999, '演示卡密'),
  ('VIP888', 'vip', 999, 'VIP测试卡密')
ON CONFLICT (code) DO NOTHING;

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE cdkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_results ENABLE ROW LEVEL SECURITY;

-- 6. 创建访问策略
-- 卡密表：允许匿名用户读取验证
CREATE POLICY "Allow public read cdkeys" ON cdkeys
  FOR SELECT USING (true);

-- 分析事件：允许匿名用户插入
CREATE POLICY "Allow public insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- 抽卡结果：允许匿名用户插入和读取
CREATE POLICY "Allow public insert gacha_results" ON gacha_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read gacha_results" ON gacha_results
  FOR SELECT USING (true);

-- 完成提示
SELECT '数据库表创建完成！' as status;
