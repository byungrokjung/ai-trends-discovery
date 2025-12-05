-- AI Trends Platform Database Schema

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 트렌드 아이템 테이블
CREATE TABLE IF NOT EXISTS trend_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_url TEXT NOT NULL,
  source TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- AI 분석 결과
  summary TEXT,
  summary_korean TEXT,
  importance INTEGER CHECK (importance >= 0 AND importance <= 10),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  
  -- 카테고리 및 태그
  category TEXT,
  tags TEXT[],
  keywords TEXT[],
  
  -- 한국 관련성
  korea_relevance_score INTEGER CHECK (korea_relevance_score >= 0 AND korea_relevance_score <= 10),
  korea_impact TEXT,
  korea_companies TEXT[],
  korea_timeline TEXT,
  
  -- 비즈니스 인사이트
  business_opportunity TEXT,
  business_risk TEXT,
  action_items TEXT[],
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- 중복 방지
  UNIQUE(original_url)
);

-- 북마크 테이블
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trend_item_id UUID REFERENCES trend_items(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, trend_item_id)
);

-- 조회수 추적 테이블
CREATE TABLE IF NOT EXISTS trend_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_item_id UUID REFERENCES trend_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RSS 소스 관리 테이블
CREATE TABLE IF NOT EXISTS rss_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  category TEXT,
  priority TEXT CHECK (priority IN ('critical', 'important', 'normal')),
  check_interval INTEGER DEFAULT 3600, -- 초 단위
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성
CREATE INDEX idx_trend_items_published_at ON trend_items(published_at DESC);
CREATE INDEX idx_trend_items_category ON trend_items(category);
CREATE INDEX idx_trend_items_importance ON trend_items(importance DESC);
CREATE INDEX idx_trend_items_korea_relevance ON trend_items(korea_relevance_score DESC);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_trend_views_trend_item_id ON trend_views(trend_item_id);

-- Row Level Security (RLS) 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_views ENABLE ROW LEVEL SECURITY;

-- 트렌드 아이템은 모든 사용자가 읽을 수 있음
CREATE POLICY "Trend items are viewable by everyone" ON trend_items
  FOR SELECT USING (true);

-- 북마크는 소유자만 관리 가능
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 뷰는 로그인한 사용자만 기록 가능
CREATE POLICY "Authenticated users can record views" ON trend_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 기본 RSS 소스 추가
INSERT INTO rss_sources (name, url, category, priority) VALUES
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'news', 'critical'),
  ('OpenAI Blog', 'https://openai.com/blog/rss.xml', 'company', 'critical'),
  ('VentureBeat AI', 'https://venturebeat.com/ai/feed/', 'news', 'important'),
  ('The Verge AI', 'https://www.theverge.com/rss/ai/index.xml', 'news', 'important')
ON CONFLICT (url) DO NOTHING;