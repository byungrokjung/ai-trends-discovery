-- AI Trends 테이블 스키마

-- 트렌드 테이블
CREATE TABLE IF NOT EXISTS trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    summary_korean TEXT,
    description TEXT,
    source TEXT NOT NULL,
    category TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 추가 필드들
    original_url TEXT,
    image_url TEXT,
    reading_time INTEGER DEFAULT 5,
    importance INTEGER DEFAULT 5 CHECK (importance >= 0 AND importance <= 10),
    views INTEGER DEFAULT 0,
    
    -- 한국 관련성
    korea_relevance TEXT,
    korea_impact TEXT,
    
    -- JSON 필드들
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    entities JSONB DEFAULT '{}',
    
    -- 중복 방지를 위한 unique constraint
    CONSTRAINT unique_trend UNIQUE(title, source, published_at)
);

-- 인덱스 생성
CREATE INDEX idx_trends_published_at ON trends(published_at DESC);
CREATE INDEX idx_trends_category ON trends(category);
CREATE INDEX idx_trends_importance ON trends(importance DESC);
CREATE INDEX idx_trends_source ON trends(source);
CREATE INDEX idx_trends_created_at ON trends(created_at DESC);

-- 북마크 테이블
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_bookmark UNIQUE(user_id, trend_id)
);

-- 트렌드 통계 뷰
CREATE OR REPLACE VIEW trend_stats AS
SELECT 
    DATE(published_at) as date,
    COUNT(*) as total_trends,
    COUNT(DISTINCT source) as sources,
    AVG(importance) as avg_importance,
    SUM(views) as total_views
FROM trends
GROUP BY DATE(published_at)
ORDER BY date DESC;

-- 오늘의 트렌드 뷰
CREATE OR REPLACE VIEW today_trends AS
SELECT *
FROM trends
WHERE DATE(published_at) = CURRENT_DATE
ORDER BY importance DESC, published_at DESC;

-- Row Level Security (RLS) 설정
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 읽기 권한은 모든 사용자에게 허용
CREATE POLICY "Public trends are viewable by everyone" 
    ON trends FOR SELECT 
    USING (true);

-- 북마크는 자신의 것만 볼 수 있음
CREATE POLICY "Users can view own bookmarks" 
    ON bookmarks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" 
    ON bookmarks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
    ON bookmarks FOR DELETE 
    USING (auth.uid() = user_id);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_trends_updated_at
    BEFORE UPDATE ON trends
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();