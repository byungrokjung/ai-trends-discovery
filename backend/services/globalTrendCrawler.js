const axios = require('axios');
const cheerio = require('cheerio');

class GlobalTrendCrawler {
  constructor() {
    this.sources = {
      // 1. Google Trends - Rising/Breakout 키워드
      googleTrends: {
        name: 'Google Trends',
        category: 'global',
        priority: 'high',
        description: '글로벌 트렌드 감지의 핵심',
        endpoints: {
          trending: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US',
          risingKR: 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=KR'
        }
      },

      // 2. TikTok Creative Center
      tiktok: {
        name: 'TikTok Creative Center',
        category: 'social',
        priority: 'critical',
        description: '숏폼 트렌드 = 즉각 구매 전환',
        endpoints: {
          trending: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc',
          products: 'https://ads.tiktok.com/business/creativecenter/top-products/pc'
        }
      },

      // 3. Pinterest Trends
      pinterest: {
        name: 'Pinterest Trends',
        category: 'lifestyle',
        priority: 'high',
        description: '감성 소비 트렌드 예측',
        endpoints: {
          trending: 'https://trends.pinterest.com/',
          weekly: 'https://www.pinterest.com/ideas/trending/'
        }
      },

      // 4. Amazon Movers & Shakers
      amazon: {
        name: 'Amazon Best Sellers',
        category: 'commerce',
        priority: 'critical',
        description: '실시간 폭발 트렌드',
        endpoints: {
          movers: 'https://www.amazon.com/gp/movers-and-shakers',
          bestsellers: 'https://www.amazon.com/Best-Sellers/zgbs',
          newReleases: 'https://www.amazon.com/gp/new-releases'
        }
      },

      // 5. AliExpress Hot
      aliexpress: {
        name: 'AliExpress Hot Items',
        category: 'commerce',
        priority: 'high',
        description: '저가 충동구매 트렌드',
        endpoints: {
          hot: 'https://www.aliexpress.com/wholesale',
          weekly: 'https://sale.aliexpress.com/weekly_deals.htm'
        }
      },

      // 6. Temu Trending
      temu: {
        name: 'Temu Trending',
        category: 'commerce',
        priority: 'medium',
        description: '초저가 트렌드 선도',
        endpoints: {
          trending: 'https://www.temu.com/trending-now',
          bestsellers: 'https://www.temu.com/best-sellers'
        }
      },

      // 7. Instagram Explore
      instagram: {
        name: 'Instagram Trends',
        category: 'social',
        priority: 'high',
        description: '감성 소비 발화점',
        note: '공식 API 필요'
      },

      // 8. YouTube Trending
      youtube: {
        name: 'YouTube Trending',
        category: 'video',
        priority: 'high',
        description: '리뷰/언박싱 → 즉각 판매 전환',
        endpoints: {
          trending: 'https://www.youtube.com/feed/trending?bp=6gQJRkVleHBsb3Jl',
          shopping: 'https://www.youtube.com/channel/UCkYQyvc_i9hXEo4xic9Hh2g'
        }
      },

      // 9. Reddit Hot
      reddit: {
        name: 'Reddit Communities',
        category: 'community',
        priority: 'medium',
        description: '실수요 기반 프리미엄 제품',
        endpoints: {
          buyItForLife: 'https://www.reddit.com/r/BuyItForLife/hot.json',
          tools: 'https://www.reddit.com/r/Tools/hot.json',
          home: 'https://www.reddit.com/r/Home/hot.json'
        }
      },

      // 10. 쿠팡 로켓프레시
      coupang: {
        name: '쿠팡 급상승',
        category: 'korean',
        priority: 'high',
        description: '한국 즉각 반응 지표',
        note: 'Apify 크롤러 연동 필요'
      },

      // 11. 번개장터
      bunjang: {
        name: '번개장터 인기',
        category: 'korean',
        priority: 'medium',
        description: '중고거래 수요 = 구매대행 기회',
        endpoints: {
          popular: 'https://m.bunjang.co.kr/popular/keywords'
        }
      }
    };
  }

  // 글로벌 트렌드 수집 메인 함수
  async collectGlobalTrends() {
    const results = {
      timestamp: new Date().toISOString(),
      trends: [],
      patterns: [],
      recommendations: []
    };

    try {
      // 1. Google Trends 수집
      const googleData = await this.crawlGoogleTrends();
      results.trends.push(...googleData);

      // 2. Amazon Movers & Shakers
      const amazonData = await this.crawlAmazonMovers();
      results.trends.push(...amazonData);

      // 3. TikTok Creative Center (시뮬레이션)
      const tiktokData = await this.simulateTikTokTrends();
      results.trends.push(...tiktokData);

      // 4. AliExpress Hot Items
      const aliData = await this.crawlAliExpressHot();
      results.trends.push(...aliData);

      // 5. 패턴 분석
      results.patterns = this.analyzePatterns(results.trends);

      // 6. 추천 생성
      results.recommendations = this.generateRecommendations(results.patterns);

      return results;
    } catch (error) {
      console.error('트렌드 수집 오류:', error);
      throw error;
    }
  }

  // Google Trends 크롤링
  async crawlGoogleTrends() {
    const trends = [];
    try {
      // RSS 피드 파싱
      const response = await axios.get(this.sources.googleTrends.endpoints.trending);
      const $ = cheerio.load(response.data, { xmlMode: true });

      $('item').each((i, elem) => {
        const title = $(elem).find('title').text();
        const traffic = $(elem).find('ht\\:approx_traffic').text();
        
        trends.push({
          source: 'Google Trends',
          keyword: title,
          traffic: traffic,
          type: 'rising',
          timestamp: new Date().toISOString(),
          potential: this.calculatePotential(traffic)
        });
      });
    } catch (error) {
      console.error('Google Trends 크롤링 오류:', error);
    }
    return trends;
  }

  // Amazon Movers & Shakers 크롤링
  async crawlAmazonMovers() {
    const products = [];
    try {
      // 실제 구현시 puppeteer 또는 playwright 사용 필요
      // 여기서는 시뮬레이션
      const dummyData = [
        {
          title: 'Portable Blender USB Rechargeable',
          category: 'Kitchen',
          rankChange: '+5,234%',
          price: '$29.99',
          reviews: 4521
        },
        {
          title: 'LED Strip Lights with App Control',
          category: 'Home',
          rankChange: '+3,122%',
          price: '$19.99',
          reviews: 8932
        },
        {
          title: 'Neck and Shoulder Massager',
          category: 'Health',
          rankChange: '+2,845%',
          price: '$45.99',
          reviews: 3201
        }
      ];

      dummyData.forEach(item => {
        products.push({
          source: 'Amazon Movers & Shakers',
          ...item,
          type: 'product',
          timestamp: new Date().toISOString(),
          koreanPotential: this.assessKoreanMarketFit(item)
        });
      });
    } catch (error) {
      console.error('Amazon 크롤링 오류:', error);
    }
    return products;
  }

  // TikTok 트렌드 시뮬레이션
  async simulateTikTokTrends() {
    // 실제 구현시 TikTok API 또는 크롤러 사용
    return [
      {
        source: 'TikTok Creative Center',
        hashtag: '#StanleyCup',
        views: '2.3B',
        products: ['Stanley Adventure Quencher', 'Tumbler Accessories'],
        type: 'hashtag',
        timestamp: new Date().toISOString(),
        viralScore: 95
      },
      {
        source: 'TikTok Creative Center',
        hashtag: '#SkinCycling',
        views: '890M',
        products: ['Retinol Serum', 'AHA/BHA Toner', 'Barrier Cream'],
        type: 'hashtag',
        timestamp: new Date().toISOString(),
        viralScore: 88
      },
      {
        source: 'TikTok Creative Center',
        hashtag: '#AirFryerRecipes',
        views: '1.2B',
        products: ['Air Fryer Accessories', 'Silicone Liners', 'Recipe Books'],
        type: 'hashtag',
        timestamp: new Date().toISOString(),
        viralScore: 92
      }
    ];
  }

  // AliExpress Hot Items 크롤링
  async crawlAliExpressHot() {
    // 시뮬레이션 데이터
    return [
      {
        source: 'AliExpress Hot',
        title: 'Mini Projector 4K Support',
        price: '$35.99',
        orders: '10,000+',
        type: 'product',
        category: 'Electronics',
        timestamp: new Date().toISOString(),
        pricePoint: 'impulse-buy'
      },
      {
        source: 'AliExpress Hot',
        title: 'Orthopedic Seat Cushion',
        price: '$12.99',
        orders: '50,000+',
        type: 'product',
        category: 'Home & Office',
        timestamp: new Date().toISOString(),
        pricePoint: 'impulse-buy'
      }
    ];
  }

  // 트렌드 패턴 분석
  analyzePatterns(trends) {
    const patterns = {
      categories: {},
      priceRanges: {
        under10: [],
        under50: [],
        under100: [],
        premium: []
      },
      viralFactors: [],
      crossPlatform: []
    };

    trends.forEach(trend => {
      // 카테고리별 분석
      if (trend.category) {
        if (!patterns.categories[trend.category]) {
          patterns.categories[trend.category] = [];
        }
        patterns.categories[trend.category].push(trend);
      }

      // 가격대별 분석
      if (trend.price) {
        const price = parseFloat(trend.price.replace(/[^0-9.]/g, ''));
        if (price < 10) patterns.priceRanges.under10.push(trend);
        else if (price < 50) patterns.priceRanges.under50.push(trend);
        else if (price < 100) patterns.priceRanges.under100.push(trend);
        else patterns.priceRanges.premium.push(trend);
      }

      // 바이럴 요소 분석
      if (trend.viralScore > 85 || trend.rankChange?.includes('+1000%')) {
        patterns.viralFactors.push({
          item: trend,
          factors: this.identifyViralFactors(trend)
        });
      }
    });

    // 크로스 플랫폼 트렌드 찾기
    patterns.crossPlatform = this.findCrossPlatformTrends(trends);

    return patterns;
  }

  // 바이럴 요소 식별
  identifyViralFactors(trend) {
    const factors = [];
    
    if (trend.views && parseInt(trend.views.replace(/[^0-9]/g, '')) > 1000000) {
      factors.push('high_views');
    }
    if (trend.rankChange && trend.rankChange.includes('+')) {
      factors.push('rapid_growth');
    }
    if (trend.price && parseFloat(trend.price.replace(/[^0-9.]/g, '')) < 50) {
      factors.push('affordable_price');
    }
    if (trend.hashtag) {
      factors.push('social_driven');
    }
    
    return factors;
  }

  // 크로스 플랫폼 트렌드 찾기
  findCrossPlatformTrends(trends) {
    const keywordMap = {};
    
    trends.forEach(trend => {
      const keywords = this.extractKeywords(trend);
      keywords.forEach(keyword => {
        if (!keywordMap[keyword]) {
          keywordMap[keyword] = {
            keyword,
            sources: [],
            count: 0
          };
        }
        keywordMap[keyword].sources.push(trend.source);
        keywordMap[keyword].count++;
      });
    });

    // 2개 이상 플랫폼에서 나타난 키워드
    return Object.values(keywordMap)
      .filter(item => item.count >= 2)
      .sort((a, b) => b.count - a.count);
  }

  // 키워드 추출
  extractKeywords(trend) {
    const text = `${trend.title || ''} ${trend.keyword || ''} ${trend.hashtag || ''}`.toLowerCase();
    const keywords = text.match(/\b\w+\b/g) || [];
    return [...new Set(keywords.filter(k => k.length > 3))];
  }

  // 한국 시장 적합도 평가
  assessKoreanMarketFit(product) {
    let score = 50; // 기본 점수

    // 카테고리별 가중치
    const categoryWeights = {
      'Beauty': 20,
      'Health': 15,
      'Kitchen': 15,
      'Fashion': 20,
      'Electronics': 10,
      'Home': 10
    };

    if (categoryWeights[product.category]) {
      score += categoryWeights[product.category];
    }

    // 가격대 평가
    const price = parseFloat(product.price?.replace(/[^0-9.]/g, '') || 0);
    if (price >= 10 && price <= 50) {
      score += 15; // 한국 구매대행 선호 가격대
    }

    // 리뷰 수 평가
    if (product.reviews > 1000) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  // 잠재력 계산
  calculatePotential(traffic) {
    const trafficNum = parseInt(traffic?.replace(/[^0-9]/g, '') || 0);
    if (trafficNum > 1000000) return 'very-high';
    if (trafficNum > 100000) return 'high';
    if (trafficNum > 10000) return 'medium';
    return 'low';
  }

  // 추천 생성
  generateRecommendations(patterns) {
    const recommendations = [];

    // 1. 즉시 진입 추천 (충동구매형)
    patterns.priceRanges.under50.forEach(item => {
      if (item.orders && parseInt(item.orders.replace(/[^0-9]/g, '')) > 10000) {
        recommendations.push({
          type: 'immediate-entry',
          product: item,
          reason: '저가 + 높은 주문량 = 충동구매 최적',
          strategy: '빠른 진입 후 가격 경쟁력으로 승부'
        });
      }
    });

    // 2. 프리미엄 포지셔닝 추천
    patterns.viralFactors.forEach(({ item, factors }) => {
      if (factors.includes('social_driven') && factors.includes('rapid_growth')) {
        recommendations.push({
          type: 'premium-positioning',
          product: item,
          reason: 'SNS 바이럴 + 급성장 = 프리미엄 수요 존재',
          strategy: '품질 강조 + 빠른 배송으로 차별화'
        });
      }
    });

    // 3. 크로스 플랫폼 기회
    patterns.crossPlatform.slice(0, 5).forEach(trend => {
      recommendations.push({
        type: 'cross-platform-opportunity',
        keyword: trend.keyword,
        platforms: trend.sources,
        reason: '다중 플랫폼 출현 = 강력한 트렌드 신호',
        strategy: '키워드 중심 상품군 구성'
      });
    });

    return recommendations;
  }

  // 실시간 모니터링 (n8n 연동용)
  async getRealtimeSignals() {
    return {
      timestamp: new Date().toISOString(),
      signals: [
        {
          source: 'Amazon',
          type: 'price-drop',
          product: 'Dyson V15',
          change: '-30%',
          urgency: 'high'
        },
        {
          source: 'TikTok',
          type: 'viral-growth',
          hashtag: '#DeskSetup',
          growth: '+500%/24h',
          urgency: 'critical'
        }
      ]
    };
  }
}

module.exports = new GlobalTrendCrawler();