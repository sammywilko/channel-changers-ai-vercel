-- Channel Changers AI - Initial Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  
  -- ICP Data
  icp_summary TEXT,
  pain_points TEXT[],
  desires TEXT[],
  
  -- Archetype
  archetype_name TEXT,
  archetype_aesthetic TEXT,
  
  -- Voice
  voice_type TEXT,
  
  -- Nano Banana Brief
  nano_banana_character_brief TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SCRIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  track TEXT DEFAULT 'organic' CHECK (track IN ('organic', 'ads')),
  length_seconds INTEGER,
  platform TEXT CHECK (platform IN ('tiktok', 'instagram', 'youtube')),
  
  full_script TEXT,
  hook TEXT,
  scenes JSONB,
  
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_check', 'passed', 'failed', 'in_production', 'complete')),
  banger_score INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id UUID REFERENCES scripts(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'generating_images', 'generating_animations', 
    'generating_voice', 'assembling', 'qa_review', 
    'human_review', 'approved', 'rejected', 'published'
  )),
  
  generated_images TEXT[],
  final_video_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  job_type TEXT NOT NULL CHECK (job_type IN ('brand_research', 'script_generation', 'production_spec')),
  related_entity_id UUID,
  related_entity_name TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  priority INTEGER DEFAULT 5,
  
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  
  report_date DATE NOT NULL,
  analyzed_count INTEGER DEFAULT 0,
  trends_spotted TEXT[],
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'complete', 'failed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Brands policies
CREATE POLICY "Users can view own brands" ON brands
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brands" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brands" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- Scripts policies
CREATE POLICY "Users can view own scripts" ON scripts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts" ON scripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts" ON scripts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts" ON scripts
  FOR DELETE USING (auth.uid() = user_id);

-- Productions policies
CREATE POLICY "Users can view own productions" ON productions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own productions" ON productions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own productions" ON productions
  FOR UPDATE USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_brand_id ON scripts(brand_id);
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_productions_script_id ON productions(script_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_brand_id ON reports(brand_id);
