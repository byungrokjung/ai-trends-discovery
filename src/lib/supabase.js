import { createClient } from '@supabase/supabase-js';

// Supabase 프로젝트 URL과 anon key를 환경변수로 관리
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 디버깅용 로그
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 트렌드 관련 함수들
export const trendsService = {
  // 최신 트렌드 가져오기
  async getLatestTrends(limit = 10) {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trends:', error);
      throw error;
    }

    return data;
  },

  // 오늘의 트렌드 가져오기
  async getTodayTrends() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .gte('published_at', today.toISOString())
      .order('importance', { ascending: false })
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching today trends:', error);
      throw error;
    }

    return data;
  },

  // 카테고리별 트렌드 가져오기
  async getTrendsByCategory(category) {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching trends by category:', error);
      throw error;
    }

    return data;
  },

  // 트렌드 상세 정보 가져오기
  async getTrendById(id) {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching trend:', error);
      throw error;
    }

    return data;
  },

  // 인기 트렌드 가져오기 (조회수 기반)
  async getPopularTrends(limit = 5) {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular trends:', error);
      throw error;
    }

    return data;
  },

  // 트렌드 조회수 증가
  async incrementViews(id) {
    const { data: trend } = await supabase
      .from('trends')
      .select('views')
      .eq('id', id)
      .single();

    if (trend) {
      const { error } = await supabase
        .from('trends')
        .update({ views: (trend.views || 0) + 1 })
        .eq('id', id);

      if (error) {
        console.error('Error updating views:', error);
      }
    }
  }
};

// 북마크 관련 함수들
export const bookmarksService = {
  // 북마크 추가
  async addBookmark(trendId, userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{ trend_id: trendId, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }

    return data;
  },

  // 북마크 제거
  async removeBookmark(trendId, userId) {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('trend_id', trendId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  // 사용자 북마크 목록 가져오기
  async getUserBookmarks(userId) {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        *,
        trends(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }

    return data;
  }
};