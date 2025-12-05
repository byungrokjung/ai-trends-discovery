-- 한국 AI 뉴스 테이블
CREATE TABLE IF NOT EXISTS korean_ai_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  link TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  company TEXT,
  industry TEXT,
  category TEXT,
  tags TEXT[],
  publishedAt TIMESTAMP WITH TIME ZONE,
  originalId TEXT,
  aiRelated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_korean_ai_news_published ON korean_ai_news(publishedAt DESC);
CREATE INDEX idx_korean_ai_news_company ON korean_ai_news(company);
CREATE INDEX idx_korean_ai_news_industry ON korean_ai_news(industry);
CREATE INDEX idx_korean_ai_news_created ON korean_ai_news(created_at DESC);

-- 한국 AI 적용 사례 테이블
CREATE TABLE IF NOT EXISTS korean_ai_use_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  industry TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  aiTech TEXT[],
  results JSONB,
  implementation TEXT,
  period TEXT,
  investment TEXT,
  source TEXT,
  sourceUrl TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX idx_use_cases_industry ON korean_ai_use_cases(industry);
CREATE INDEX idx_use_cases_company ON korean_ai_use_cases(company);
CREATE INDEX idx_use_cases_created ON korean_ai_use_cases(created_at DESC);

-- 한국 AI 기업 테이블
CREATE TABLE IF NOT EXISTS korean_ai_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  logo TEXT,
  focus TEXT,
  description TEXT,
  website TEXT,
  newsroom TEXT,
  keywords TEXT[],
  founded INTEGER,
  employees TEXT,
  funding TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 샘플 기업 데이터 삽입
INSERT INTO korean_ai_companies (name, logo, focus, description, keywords, website, newsroom) VALUES
('네이버', '🟢', '하이퍼클로바X, 검색 AI', '한국 최대 포털이자 AI 기술 선도 기업', ARRAY['하이퍼클로바', 'HyperCLOVA', '클로바X', 'CLOVA Studio', '네이버 AI'], 'https://www.navercorp.com', 'https://www.navercorp.com/promotion/pressRelease'),
('카카오', '🟡', 'KoGPT, 대화형 AI', '카카오브레인을 통한 AI 연구 개발', ARRAY['KoGPT', '카카오브레인', 'B^ DISCOVER', '카카오 AI'], 'https://www.kakaocorp.com', 'https://www.kakaocorp.com/page/news/press'),
('삼성전자', '🔵', '가우스, 온디바이스 AI', '글로벌 전자기업의 AI 기술 개발', ARRAY['가우스', 'Gauss', '온디바이스AI', '삼성리서치'], 'https://www.samsung.com', 'https://news.samsung.com/kr/latest'),
('LG AI연구원', '🔴', '엑사원, 산업 AI', 'LG그룹의 AI 연구 전문 기관', ARRAY['엑사원', 'EXAONE', 'LG AI', 'LG사이언스파크'], 'https://www.lgresearch.ai', 'https://www.lgresearch.ai/news'),
('뷰노', '🟣', '의료 AI, 진단 보조', '의료 AI 전문 기업', ARRAY['VUNO Med', '의료AI', '뷰노메드'], 'https://www.vuno.co', 'https://www.vuno.co/news'),
('업스테이지', '🟠', 'Solar LLM, 문서 AI', 'AI 기반 문서 처리 전문', ARRAY['Solar', 'Document AI', 'OCR', '업스테이지'], 'https://www.upstage.ai', 'https://www.upstage.ai/newsroom')
ON CONFLICT (name) DO NOTHING;

-- 샘플 적용 사례 데이터
INSERT INTO korean_ai_use_cases (company, industry, title, description, aiTech, results, implementation, period, investment) VALUES
('신한은행', '금융', 'AI 기반 실시간 이상거래 탐지 시스템 구축', '머신러닝을 활용하여 금융 사기를 실시간으로 탐지하는 시스템을 구축했습니다. 기존 대비 사기 탐지율 85% 향상, 오탐률 60% 감소를 달성했습니다.', 
 ARRAY['이상 탐지', '머신러닝', '실시간 분석'], 
 '{"detection": "+85%", "falsePositive": "-60%", "responseTime": "0.3초"}', 
 '자체 개발 + AWS SageMaker', '6개월', '15억원'),
('삼성서울병원', '의료', 'AI 진단 보조 시스템으로 암 조기 발견율 향상', '딥러닝 기반 의료 영상 분석 시스템을 도입하여 폐암, 유방암의 조기 발견율을 크게 향상시켰습니다.', 
 ARRAY['의료 영상 분석', '딥러닝', '진단 보조'], 
 '{"accuracy": "97.5%", "earlyDetection": "+45%", "timeReduction": "-50%"}', 
 '뷰노 + VUNO Med', '12개월', '30억원');