-- 일일 상품 추천 테이블 생성
CREATE TABLE IF NOT EXISTS daily_recommendations (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  platform VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  trend_keyword TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  thumbnail_url TEXT,
  analysis TEXT,
  confidence_score FLOAT DEFAULT 0.8,
  original_content_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 날짜별 인덱스 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_daily_rec_date 
ON daily_recommendations(date DESC);

-- 카테고리별 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_rec_category 
ON daily_recommendations(category);

-- 날짜 + 카테고리 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_rec_date_category 
ON daily_recommendations(date DESC, category);

-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM daily_recommendations WHERE date < CURRENT_DATE - INTERVAL '30 days';
