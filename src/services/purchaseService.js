import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class PurchaseService {
  // 글로벌 트렌드 수집
  async collectGlobalTrends() {
    try {
      const response = await axios.get(`${API_URL}/api/purchase/trends/collect`);
      return response.data;
    } catch (error) {
      console.error('트렌드 수집 오류:', error);
      throw error;
    }
  }

  // 실시간 시그널 가져오기
  async getRealtimeSignals() {
    try {
      const response = await axios.get(`${API_URL}/api/purchase/trends/signals`);
      return response.data;
    } catch (error) {
      console.error('시그널 조회 오류:', error);
      throw error;
    }
  }

  // 특정 플랫폼 트렌드 조회
  async getPlatformTrends(platform) {
    try {
      const response = await axios.get(`${API_URL}/api/purchase/trends/${platform}`);
      return response.data;
    } catch (error) {
      console.error(`${platform} 트렌드 조회 오류:`, error);
      throw error;
    }
  }

  // 상품 추천 받기
  async getProductRecommendations(filters = {}) {
    try {
      const response = await axios.post(`${API_URL}/api/purchase/products/recommend`, filters);
      return response.data;
    } catch (error) {
      console.error('상품 추천 오류:', error);
      throw error;
    }
  }

  // 트렌드 분석
  async analyzeTrends(trends) {
    try {
      const response = await axios.post(`${API_URL}/api/purchase/trends/analyze`, { trends });
      return response.data;
    } catch (error) {
      console.error('트렌드 분석 오류:', error);
      throw error;
    }
  }

  // 트렌드 데이터 포맷팅
  formatTrendData(rawData) {
    if (!rawData || !rawData.trends) return [];

    return rawData.trends.map(trend => {
      // 가격 파싱
      let price = null;
      let priceKRW = null;
      if (trend.price) {
        const priceMatch = trend.price.match(/\$?([\d.]+)/);
        if (priceMatch) {
          price = parseFloat(priceMatch[1]);
          priceKRW = Math.round(price * 1300); // 환율 적용 (실제로는 실시간 환율 API 사용)
        }
      }

      // 카테고리 매핑
      const categoryMap = {
        'Kitchen': 'home',
        'Health': 'beauty',
        'Electronics': 'tech',
        'Fashion': 'fashion',
        'Beauty': 'beauty',
        'Home': 'home'
      };

      return {
        id: trend.id || Math.random().toString(36).substr(2, 9),
        title: trend.title || trend.keyword || trend.hashtag || '제목 없음',
        description: trend.description || `${trend.source}에서 발견된 트렌딩 아이템`,
        price: price ? `$${price}` : null,
        priceKRW: priceKRW ? `₩${priceKRW.toLocaleString()}` : null,
        image: trend.image || this.generatePlaceholderImage(trend),
        category: categoryMap[trend.category] || 'all',
        trending: trend.viralScore > 80 || trend.rankChange?.includes('+1000%'),
        discount: trend.rankChange?.includes('+') ? '-HOT' : null,
        rating: trend.rating || 4.5,
        reviews: trend.reviews || Math.floor(Math.random() * 5000),
        source: trend.source,
        savedCount: Math.floor(Math.random() * 1000),
        estimatedDelivery: '7-14일',
        tags: this.generateTags(trend),
        koreanPotential: trend.koreanPotential || 75
      };
    });
  }

  // 플레이스홀더 이미지 생성
  generatePlaceholderImage(trend) {
    const imageMap = {
      'TikTok': 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800',
      'Amazon': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      'AliExpress': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
      'Google': 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800'
    };
    
    return imageMap[trend.source] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
  }

  // 태그 생성
  generateTags(trend) {
    const tags = [];
    
    if (trend.source) tags.push(trend.source);
    if (trend.viralScore > 90) tags.push('핫트렌드');
    if (trend.rankChange?.includes('+')) tags.push('급상승');
    if (trend.orders?.includes('10,000+')) tags.push('베스트셀러');
    if (trend.pricePoint === 'impulse-buy') tags.push('가성비');
    
    return tags.slice(0, 3);
  }

  // 실시간 알림 구독 (WebSocket 시뮬레이션)
  subscribeToTrendAlerts(callback) {
    // 실제로는 WebSocket 연결
    const mockAlerts = [
      {
        type: 'viral',
        message: 'TikTok에서 #StanleyCup이 2시간만에 500% 상승!',
        urgency: 'high'
      },
      {
        type: 'price-drop',
        message: 'Amazon에서 Dyson V15가 30% 할인 시작',
        urgency: 'medium'
      },
      {
        type: 'new-trend',
        message: 'Pinterest에서 "Minimalist Desk Setup" 검색 급증',
        urgency: 'low'
      }
    ];

    // 5초마다 랜덤 알림 (데모용)
    const interval = setInterval(() => {
      const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
      callback(randomAlert);
    }, 5000);

    // 구독 취소 함수 반환
    return () => clearInterval(interval);
  }

  // 트렌드 예측 (AI 기반)
  async predictTrends(currentData) {
    // 실제로는 AI API 호출
    const predictions = {
      nextWeek: [
        'AI 생성 아트 도구',
        '홈 피트니스 장비',
        '친환경 주방용품'
      ],
      nextMonth: [
        '메타버스 액세서리',
        'DIY 뷰티 디바이스',
        '스마트 가드닝 도구'
      ],
      confidence: 0.85
    };

    return predictions;
  }
}

export default new PurchaseService();