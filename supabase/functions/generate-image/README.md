# Supabase Edge Function: generate-image

这个 Edge Function 处理 AI 图片生成，支持最长 150 秒的执行时间（解决 Vercel 30 秒限制问题）。

## 部署步骤

### 1. 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (使用 scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 或使用 npm
npm install -g supabase
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 链接项目

```bash
cd /path/to/hongshu_mvp_2
supabase link --project-ref YOUR_PROJECT_REF
```

项目 ref 可以在 Supabase Dashboard > Settings > General 中找到。

### 4. 设置环境变量

在 Supabase Dashboard > Settings > Edge Functions 中添加以下环境变量：

- `AI_API_BASE_URL`: `https://api.bltcy.ai`
- `AI_API_KEY`: 你的 AI API 密钥

### 5. 部署函数

```bash
supabase functions deploy generate-image
```

### 6. 验证部署

部署成功后，可以在 Supabase Dashboard > Edge Functions 中看到 `generate-image` 函数。

## 工作原理

1. 用户上传图片 → Vercel API 创建任务记录到数据库 → 调用此 Edge Function
2. Edge Function 调用 AI API（可运行最长 150 秒）
3. 生成完成后更新数据库
4. 前端轮询状态 API 获取结果

## 故障排除

如果遇到问题，检查：

1. Edge Function 日志（Dashboard > Edge Functions > Logs）
2. 确保环境变量已正确设置
3. 确保数据库表 `generation_jobs` 存在
