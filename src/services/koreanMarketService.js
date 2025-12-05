import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const koreanMarketService = {
  // 뉴스 조회
  async getNews(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/korean-market/news`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          company: params.company,
          industry: params.industry,
          search: params.search
        }
      });
      return response.data;
    } catch (error) {
      console.error('뉴스 조회 오류:', error);
      throw error;
    }
  },

  // 적용 사례 조회
  async getUseCases(params = {}) {
    try {
      const response = await axios.get(`${API_URL}/korean-market/use-cases`, {
        params: {
          industry: params.industry,
          search: params.search
        }
      });
      return response.data;
    } catch (error) {
      console.error('사례 조회 오류:', error);
      throw error;
    }
  },

  // 기업 목록 조회
  async getCompanies() {
    try {
      const response = await axios.get(`${API_URL}/korean-market/companies`);
      return response.data;
    } catch (error) {
      console.error('기업 조회 오류:', error);
      throw error;
    }
  },

  // 트렌드 통계 조회
  async getTrends(days = 7) {
    try {
      const response = await axios.get(`${API_URL}/korean-market/trends`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('트렌드 조회 오류:', error);
      throw error;
    }
  },

  // 데이터 수집 트리거 (관리자용)
  async triggerCollection(token) {
    try {
      const response = await axios.post(
        `${API_URL}/korean-market/collect`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('수집 트리거 오류:', error);
      throw error;
    }
  }
};