const express = require('express');
const router = express.Router();
const globalTrendCrawler = require('../services/globalTrendCrawler');
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 글로벌 트렌드 수집 엔드포인트
router.get('/trends/collect', async (req, res) => {
  try {
    console.log('🌍 글로벌 트렌드 수집 시작...');
    
    // 트렌드 수집
    const trendData = await globalTrendCrawler.collectGlobalTrends();
    
    // Supabase에 저장 (옵션)
    if (process.env.SUPABASE_URL) {
      await saveTrendsToDatabase(trendData);
    }
    
    res.json({
      success: true,
      data: trendData,
      summary: {
        totalTrends: trendData.trends.length,
        patterns: Object.keys(trendData.patterns),
        recommendations: trendData.recommendations.length
      }
    });
  } catch (error) {
    console.error('트렌드 수집 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 실시간 신호 모니터링
router.get('/trends/signals', async (req, res) => {
  try {
    const signals = await globalTrendCrawler.getRealtimeSignals();
    res.json({
      success: true,
      data: signals
    });
  } catch (error) {
    console.error('신호 모니터링 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 트렌드 기반 상품 추천
router.post('/products/recommend', async (req, res) => {
  try {
    const { category, priceRange, market } = req.body;
    
    // 트렌드 데이터 가져오기
    const trendData = await globalTrendCrawler.collectGlobalTrends();
    
    // AI 분석 및 추천 생성
    const recommendations = await analyzeAndRecommend(trendData, {
      category,
      priceRange,
      market: market || 'KR'
    });
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('상품 추천 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 특정 플랫폼 트렌드 조회
router.get('/trends/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['amazon', 'tiktok', 'aliexpress', 'pinterest', 'google'];
    
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform'
      });
    }
    
    // 플랫폼별 데이터 수집
    let platformData;
    switch(platform) {
      case 'amazon':
        platformData = await globalTrendCrawler.crawlAmazonMovers();
        break;
      case 'tiktok':
        platformData = await globalTrendCrawler.simulateTikTokTrends();
        break;
      case 'aliexpress':
        platformData = await globalTrendCrawler.crawlAliExpressHot();
        break;
      case 'google':
        platformData = await globalTrendCrawler.crawlGoogleTrends();
        break;
      default:
        platformData = [];
    }
    
    res.json({
      success: true,
      platform,
      data: platformData
    });
  } catch (error) {
    console.error(`${req.params.platform} 트렌드 조회 오류:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 트렌드 분석 리포트 생성
router.post('/trends/analyze', async (req, res) => {
  try {
    const { trends } = req.body;
    
    if (!trends || !Array.isArray(trends)) {
      return res.status(400).json({
        success: false,
        error: 'Trends data is required'
      });
    }
    
    // 패턴 분석
    const patterns = globalTrendCrawler.analyzePatterns(trends);
    
    // 한국 시장 인사이트 생성
    const koreanInsights = generateKoreanMarketInsights(patterns);
    
    res.json({
      success: true,
      analysis: {
        patterns,
        koreanInsights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('트렌드 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 헬퍼 함수들

// 트렌드 데이터베이스 저장
async function saveTrendsToDatabase(trendData) {
  try {
    // trends 테이블에 저장
    const { data, error } = await supabase
      .from('global_trends')
      .insert(
        trendData.trends.map(trend => ({
          source: trend.source,
          type: trend.type,
          title: trend.title || trend.keyword || trend.hashtag,
          metadata: trend,
          collected_at: new Date().toISOString()
        }))
      );
    
    if (error) throw error;
    
    console.log(`✅ ${trendData.trends.length}개 트렌드 저장 완료`);
  } catch (error) {
    console.error('DB 저장 오류:', error);
  }
}

// AI 기반 상품 추천
async function analyzeAndRecommend(trendData, filters) {
  const recommendations = [];
  
  // 카테고리 필터링
  let filteredTrends = trendData.trends;
  if (filters.category) {
    filteredTrends = filteredTrends.filter(t => 
      t.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // 가격대 필터링
  if (filters.priceRange) {
    filteredTrends = filteredTrends.filter(t => {
      if (!t.price) return true;
      const price = parseFloat(t.price.replace(/[^0-9.]/g, ''));
      const [min, max] = filters.priceRange.split('-').map(Number);
      return price >= min && price <= max;
    });
  }
  
  // 상위 10개 추천
  filteredTrends.slice(0, 10).forEach(trend => {
    recommendations.push({
      product: trend,
      score: calculateRecommendationScore(trend, filters),
      reasoning: generateRecommendationReason(trend, filters)
    });
  });
  
  return recommendations.sort((a, b) => b.score - a.score);
}

// 추천 점수 계산
function calculateRecommendationScore(trend, filters) {
  let score = 50;
  
  // 바이럴 점수
  if (trend.viralScore) {
    score += trend.viralScore / 2;
  }
  
  // 주문량
  if (trend.orders) {
    const orders = parseInt(trend.orders.replace(/[^0-9]/g, ''));
    if (orders > 50000) score += 30;
    else if (orders > 10000) score += 20;
    else if (orders > 1000) score += 10;
  }
  
  // 한국 시장 적합도
  if (trend.koreanPotential) {
    score += trend.koreanPotential / 2;
  }
  
  return Math.min(score, 100);
}

// 추천 이유 생성
function generateRecommendationReason(trend, filters) {
  const reasons = [];
  
  if (trend.rankChange?.includes('+')) {
    reasons.push('급성장 중인 상품');
  }
  
  if (trend.viralScore > 80) {
    reasons.push('SNS 바이럴 진행중');
  }
  
  if (trend.price && parseFloat(trend.price.replace(/[^0-9.]/g, '')) < 50) {
    reasons.push('충동구매 유발 가격대');
  }
  
  if (trend.source === 'TikTok Creative Center') {
    reasons.push('틱톡 트렌드 선도');
  }
  
  if (filters.market === 'KR' && trend.koreanPotential > 70) {
    reasons.push('한국 시장 적합도 높음');
  }
  
  return reasons.join(', ');
}

// 한국 시장 인사이트 생성
function generateKoreanMarketInsights(patterns) {
  const insights = {
    hotCategories: [],
    priceStrategy: '',
    timing: '',
    competition: '',
    recommendations: []
  };
  
  // 인기 카테고리 분석
  const categoryScores = {};
  Object.entries(patterns.categories).forEach(([category, items]) => {
    categoryScores[category] = items.length;
  });
  
  insights.hotCategories = Object.entries(categoryScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
  
  // 가격 전략
  const priceDistribution = {
    impulse: patterns.priceRanges.under10.length + patterns.priceRanges.under50.length,
    standard: patterns.priceRanges.under100.length,
    premium: patterns.priceRanges.premium.length
  };
  
  if (priceDistribution.impulse > priceDistribution.standard + priceDistribution.premium) {
    insights.priceStrategy = '저가 충동구매 전략 추천';
  } else if (priceDistribution.premium > priceDistribution.impulse) {
    insights.priceStrategy = '프리미엄 포지셔닝 전략 추천';
  } else {
    insights.priceStrategy = '중간 가격대 안정적 진입 추천';
  }
  
  // 진입 시기
  const currentMonth = new Date().getMonth();
  const seasonalFactors = {
    0: '새해 건강/다이어트 제품',
    2: '봄 패션/뷰티',
    5: '여름 휴가용품',
    8: '가을 인테리어',
    11: '연말 선물/파티용품'
  };
  
  insights.timing = seasonalFactors[currentMonth] || '일반 시즌';
  
  // 경쟁 상황
  if (patterns.crossPlatform.length > 10) {
    insights.competition = '높음 - 차별화 전략 필수';
  } else if (patterns.crossPlatform.length > 5) {
    insights.competition = '중간 - 빠른 진입 유리';
  } else {
    insights.competition = '낮음 - 선점 효과 기대';
  }
  
  return insights;
}

module.exports = router;