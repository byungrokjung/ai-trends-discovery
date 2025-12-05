-- Supabase 벡터 검색 함수들
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. Instagram 콘텐츠 벡터 검색 함수
CREATE OR REPLACE FUNCTION match_instagram_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  pk bigint,
  caption text,
  hashtags text,
  likescount int,
  commentscount int,
  timestamp timestamptz,
  ownerusername text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    instagram_posts.pk,
    instagram_posts.caption,
    instagram_posts.hashtags,
    instagram_posts.likescount,
    instagram_posts.commentscount,
    instagram_posts.timestamp,
    instagram_posts.ownerusername,
    1 - (instagram_posts.embedding <=> query_embedding) as similarity
  FROM instagram_posts
  WHERE 1 - (instagram_posts.embedding <=> query_embedding) > match_threshold
  ORDER BY instagram_posts.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. TikTok 콘텐츠 벡터 검색 함수  
CREATE OR REPLACE FUNCTION match_tiktok_content(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  description text,
  hashtags text,
  likes_count int,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql  
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tiktok_contents.id,
    tiktok_contents.description,
    tiktok_contents.hashtags,
    tiktok_contents.likes_count,
    tiktok_contents.created_at,
    1 - (tiktok_contents.embedding <=> query_embedding) as similarity
  FROM tiktok_contents
  WHERE 1 - (tiktok_contents.embedding <=> query_embedding) > match_threshold
  ORDER BY tiktok_contents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 3. 상품 분석 벡터 검색 함수
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  product_name text,
  category text,
  price_krw numeric,
  rating numeric,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    product_analysis.id,
    product_analysis.product_name,
    product_analysis.category,
    product_analysis.price_krw,
    product_analysis.rating,
    1 - (product_analysis.embedding <=> query_embedding) as similarity
  FROM product_analysis
  WHERE 1 - (product_analysis.embedding <=> query_embedding) > match_threshold
  ORDER BY product_analysis.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. 통합 콘텐츠 검색 함수 (Instagram + TikTok)
CREATE OR REPLACE FUNCTION search_all_content(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  platform text,
  content_id bigint,
  title text,
  description text,
  engagement int,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  (
    -- Instagram 결과
    SELECT 
      'instagram'::text as platform,
      i.pk as content_id,
      i.ownerusername as title,
      i.caption as description,
      (COALESCE(i.likescount, 0) + COALESCE(i.commentscount, 0)) as engagement,
      i.timestamp as created_at,
      (1 - (i.embedding <=> query_embedding)) as similarity
    FROM instagram_posts i
    WHERE (1 - (i.embedding <=> query_embedding)) > match_threshold
    
    UNION ALL
    
    -- TikTok 결과  
    SELECT
      'tiktok'::text as platform,
      t.id as content_id,
      'TikTok'::text as title,
      t.description as description,
      COALESCE(t.likes_count, 0) as engagement,
      t.created_at,
      (1 - (t.embedding <=> query_embedding)) as similarity
    FROM tiktok_contents t
    WHERE (1 - (t.embedding <=> query_embedding)) > match_threshold
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 5. 트렌딩 키워드 분석 함수
CREATE OR REPLACE FUNCTION get_trending_keywords(
  days_back int DEFAULT 7,
  min_engagement int DEFAULT 10
)
RETURNS TABLE (
  keyword text,
  total_engagement bigint,
  post_count bigint,
  avg_engagement numeric,
  platforms text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH keyword_stats AS (
    -- Instagram 키워드 추출
    SELECT 
      regexp_split_to_table(
        regexp_replace(caption || ' ' || COALESCE(hashtags, ''), '#(\w+)', '\1', 'g'), 
        '\s+'
      ) as word,
      (COALESCE(likescount, 0) + COALESCE(commentscount, 0)) as engagement,
      'instagram' as platform,
      timestamp as post_date
    FROM instagram_posts 
    WHERE timestamp > CURRENT_DATE - INTERVAL '%s days'
    
    UNION ALL
    
    -- TikTok 키워드 추출
    SELECT
      regexp_split_to_table(
        regexp_replace(description || ' ' || COALESCE(hashtags, ''), '#(\w+)', '\1', 'g'),
        '\s+'
      ) as word,
      COALESCE(likes_count, 0) as engagement,
      'tiktok' as platform,
      created_at as post_date
    FROM tiktok_contents
    WHERE created_at > CURRENT_DATE - INTERVAL '%s days'
  ),
  filtered_keywords AS (
    SELECT 
      LOWER(TRIM(word)) as keyword,
      engagement,
      platform,
      post_date
    FROM keyword_stats
    WHERE LENGTH(TRIM(word)) > 2 
      AND word !~ '^[0-9]+$'  -- 숫자만 있는 단어 제외
      AND engagement >= min_engagement
  )
  SELECT 
    fk.keyword,
    SUM(fk.engagement) as total_engagement,
    COUNT(*) as post_count,
    AVG(fk.engagement) as avg_engagement,
    array_agg(DISTINCT fk.platform) as platforms
  FROM filtered_keywords fk
  GROUP BY fk.keyword
  HAVING COUNT(*) >= 3  -- 최소 3번 이상 언급된 키워드만
  ORDER BY total_engagement DESC
  LIMIT 50;
END;
$$;

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS instagram_posts_embedding_idx ON instagram_posts USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS tiktok_contents_embedding_idx ON tiktok_contents USING ivfflat (embedding vector_cosine_ops);  
CREATE INDEX IF NOT EXISTS product_analysis_embedding_idx ON product_analysis USING ivfflat (embedding vector_cosine_ops);

-- 벡터 확장 활성화 (아직 없다면)
CREATE EXTENSION IF NOT EXISTS vector;