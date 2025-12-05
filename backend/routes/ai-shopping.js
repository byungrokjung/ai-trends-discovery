const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://txonxxwdwlyrihplfibo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b254eHdkd2x5cmlocGxmaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDcwNDgsImV4cCI6MjA3NDAyMzA0OH0.5ABsPoPaoTvQtNygm0ClllfVYfOCSD56swva8V58YB4'
);

// OpenAI 클라이언트 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here'
});

// 1. 문제-상품 자동 매칭 API
router.post('/problem-to-product', async (req, res) => {
  try {
    const { problem, platform = 'all', limit = 10 } = req.body;
    
    console.log('🔍 문제 분석 요청:', problem);
    
    // 1단계: 사용자 문제를 벡터화
    const problemEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: problem
    });
    
    const queryVector = problemEmbedding.data[0].embedding;
    console.log('📊 문제 벡터화 완료');
    
    // 2단계: 벡터 유사도 검색
    let results = [];
    
    if (platform === 'all' || platform === 'instagram') {
      const { data: instagramResults } = await supabase.rpc('match_instagram_content', {
        query_embedding: queryVector,
        match_threshold: 0.7,
        match_count: Math.floor(limit / 2)
      });
      
      results = results.concat(instagramResults?.map(item => ({
        ...item,
        platform: 'instagram',
        engagement: (item.likescount || 0) + (item.commentscount || 0)
      })) || []);
    }
    
    if (platform === 'all' || platform === 'tiktok') {
      const { data: tiktokResults } = await supabase.rpc('match_tiktok_content', {
        query_embedding: queryVector,
        match_threshold: 0.7,
        match_count: Math.floor(limit / 2)
      });
      
      results = results.concat(tiktokResults?.map(item => ({
        ...item,
        platform: 'tiktok',
        engagement: item.likes_count || 0
      })) || []);
    }
    
    // 3단계: 결과 정렬 (참여도 기준)
    results.sort((a, b) => (b.engagement || 0) - (a.engagement || 0));
    results = results.slice(0, limit);
    
    // 4단계: GPT로 상품 추천 생성
    const contentSummary = results.map(item => ({
      platform: item.platform,
      content: item.caption || item.description || '',
      engagement: item.engagement
    })).slice(0, 5);
    
    const recommendation = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `당신은 AI 구매대행 전문가입니다. 사용자의 문제를 해결할 수 있는 상품을 추천해주세요.
        
규칙:
1. 실제로 도움이 될 만한 구체적인 상품명 제시
2. 해외직구 가능한 상품 위주로 추천
3. 가격대별로 다양한 옵션 제공
4. 각 상품의 장단점 간략히 설명

응답 형식:
{
  "products": [
    {
      "name": "상품명",
      "category": "카테고리", 
      "price_range": "가격대",
      "why_helpful": "도움되는 이유",
      "buy_from": "구매처 추천"
    }
  ],
  "summary": "전체 요약"
}`
      }, {
        role: 'user',
        content: `문제: "${problem}"

관련 소셜미디어 콘텐츠:
${contentSummary.map(item => `[${item.platform}] ${item.content} (참여도: ${item.engagement})`).join('\n')}

이 데이터를 바탕으로 문제를 해결할 수 있는 상품들을 추천해주세요.`
      }]
    });
    
    let productRecommendation;
    try {
      productRecommendation = JSON.parse(recommendation.choices[0].message.content);
    } catch (e) {
      productRecommendation = {
        products: [],
        summary: recommendation.choices[0].message.content
      };
    }
    
    console.log('✅ 상품 추천 완료');
    
    res.json({
      success: true,
      data: {
        problem: problem,
        matched_content: results,
        recommendations: productRecommendation,
        total_matches: results.length
      }
    });
    
  } catch (error) {
    console.error('❌ 문제-상품 매칭 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 테스트 엔드포인트
router.get('/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('instagram_posts')
      .select('caption, likesCount')
      .limit(3);
    
    res.json({
      success: true,
      test: 'AI 쇼핑 API 작동중',
      sample_data: data,
      error: error
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// 2. 트렌딩 상품 발굴 API  
router.get('/trending-products', async (req, res) => {
  try {
    const { days = 30, limit = 20 } = req.query;
    
    console.log('📈 트렌딩 상품 분석 시작');
    
    // 최근 N일간 인기 콘텐츠 가져오기 (날짜 필터 제거하고 전체 데이터 사용)
    const [instagramTrends, tiktokTrends] = await Promise.all([
      supabase
        .from('instagram_posts')
        .select('caption, hashtags, likesCount, commentsCount, timestamp')
        .order('likesCount', { ascending: false })
        .limit(100),
      
      supabase
        .from('tiktok_contents')
        .select('description, hashtags, likes_count, created_at')
        .order('likes_count', { ascending: false })
        .limit(100)
    ]);
    
    console.log('Instagram 데이터:', instagramTrends.data?.length || 0);
    console.log('TikTok 데이터:', tiktokTrends.data?.length || 0);
    
    // 키워드 추출 및 빈도 분석
    const keywordFreq = {};
    
    // Instagram 키워드 분석
    instagramTrends.data?.forEach(post => {
      const text = post.caption || '';
      const keywords = extractKeywords(text);
      const weight = (post.likesCount || 0) + (post.commentsCount || 0);
      
      keywords.forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + weight;
      });
    });
    
    // TikTok 키워드 분석
    tiktokTrends.data?.forEach(post => {
      const text = post.description || '';
      const keywords = extractKeywords(text);
      const weight = post.likes_count || 0;
      
      keywords.forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + weight;
      });
    });
    
    // 상위 트렌딩 키워드
    const trendingKeywords = Object.entries(keywordFreq)
      .filter(([keyword, score]) => score > 0 && keyword.length > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([keyword, score]) => ({ keyword, score }));
    
    console.log('✅ 트렌딩 분석 완료:', trendingKeywords.length, '개 키워드');
    
    res.json({
      success: true,
      data: {
        period: `${days}일`,
        trending_keywords: trendingKeywords,
        instagram_posts: instagramTrends.data?.length || 0,
        tiktok_posts: tiktokTrends.data?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ 트렌딩 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. 유사 상품 검색 API
router.post('/similar-products', async (req, res) => {
  try {
    const { product_name, platform = 'all', limit = 10 } = req.body;
    
    console.log('🔍 유사 상품 검색:', product_name);
    
    // 상품명 벡터화
    const productEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: product_name
    });
    
    const queryVector = productEmbedding.data[0].embedding;
    
    // 기존 상품 분석 테이블에서 유사 상품 찾기
    const { data: similarProducts } = await supabase.rpc('match_products', {
      query_embedding: queryVector,
      match_threshold: 0.8,
      match_count: limit
    });
    
    res.json({
      success: true,
      data: {
        query: product_name,
        similar_products: similarProducts || [],
        total_matches: similarProducts?.length || 0
      }
    });
    
  } catch (error) {
    console.error('❌ 유사 상품 검색 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 헬퍼 함수: 키워드 추출
function extractKeywords(text) {
  if (!text) return [];
  
  // 해시태그 추출
  const hashtags = text.match(/#[\w가-힣]+/g) || [];
  
  // 상품 관련 키워드 추출
  const productKeywords = [
    ...text.match(/[\w가-힣]{2,8}(?:템|제품|아이템)/g) || [],
    ...text.match(/[\w가-힣]{2,6}(?:용품|도구)/g) || [],
    ...text.match(/보조배터리|충전기|케이블|무선충전|급속충전/g) || [],
    ...text.match(/세탁|청소|냄새|제거|방향제/g) || [],
    ...text.match(/수납|정리|보관|가방/g) || [],
    ...text.match(/뷰티|화장품|스킨케어|메이크업/g) || [],
    ...text.match(/운동|헬스|요가|피트니스/g) || [],
    ...text.match(/요리|주방|조리|쿠킹/g) || []
  ];
  
  // 브랜드명 추출 (영어 대문자로 시작)
  const brands = text.match(/\b[A-Z][a-zA-Z]{2,10}\b/g) || [];
  
  return [
    ...hashtags.map(h => h.replace('#', '')), 
    ...productKeywords, 
    ...brands
  ]
    .filter(keyword => keyword && keyword.length > 1)
    .slice(0, 15);
}

module.exports = router;