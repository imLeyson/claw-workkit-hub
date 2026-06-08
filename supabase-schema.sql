-- PromoKit AI Database Schema
-- 复制全部内容到 Supabase SQL Editor 中执行

-- 1. 项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  campaign TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 竞品表
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  brand TEXT,
  platform TEXT,
  price TEXT,
  review_count INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  top_issues TEXT[]
);

-- 3. 资料表
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT,
  label TEXT,
  file_name TEXT,
  content TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  review_count INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  platform TEXT,
  price TEXT,
  top_issues TEXT[]
);

-- 4. 任务卡表
CREATE TABLE IF NOT EXISTS task_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  prompt_preview TEXT,
  output_format TEXT DEFAULT '',
  assigned_to TEXT,
  input_materials UUID[],
  source_tags TEXT[],
  judgment_criteria TEXT[]
);

-- 5. AI 结果表
CREATE TABLE IF NOT EXISTS ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES task_cards(id) ON DELETE CASCADE,
  title TEXT,
  sections JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT now(),
  submitted BOOLEAN DEFAULT false
);

-- 6. Work Kit 表
CREATE TABLE IF NOT EXISTS work_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  version TEXT,
  description TEXT,
  scenario TEXT,
  included_roles TEXT[],
  material_structure TEXT,
  sections JSONB DEFAULT '[]',
  tags TEXT[],
  feedback TEXT DEFAULT '',
  reuse_count INT DEFAULT 0,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  based_on_project_id UUID,
  based_on_project_name TEXT
);

-- 7. 启用 Row Level Security（可选，Phase 2 做）
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
