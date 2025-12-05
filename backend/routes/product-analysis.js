const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 직접 생성 (스키마 캐시 문제 해결)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://txonxxwdwlyrihplfibo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b254eHdkd2x5cmlocGxmaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDcwNDgsImV4cCI6MjA3NDAyMzA0OH0.5ABsPoPaoTvQtNygm0ClllfVYfOCSD56swva8V58YB4',
  {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  }
);

// 일별 상품 분석 데이터 조회
router.get('/daily', async (req, res) => {
  try {
    console.log('📊 [product-analysis] Daily route accessed');
    console.log('Query params:', req.query);
    
    const { date, limit = 20, offset = 0, type, sortBy = 'balance_score' } = req.query;
    
    // Supabase 연결 상태 확인
    console.log('Supabase URL:', process.env.SUPABASE_URL);
    
    let query = supabase
      .from('product_analysis')
      .select('*', { count: 'exact' });
    
    // 날짜 필터링을 created_at 기준으로 변경
    if (date) {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    } else {
      // 기본적으로 최근 7일 (created_at 기준)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    }
    
    // 상품 타입 필터링
    if (type && type !== 'all') {
      query = query.eq('product_type', type);
    }
    
    // 정렬
    const sortOrder = sortBy === 'created_at' ? 'desc' : 'desc';
    query = query.order(sortBy, { ascending: false });
    
    // 페이지네이션
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    console.log('Query result:', { dataLength: data?.length, error, count });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('일별 분석 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 일별 통계 요약
router.get('/daily-stats', async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = supabase.from('product_analysis').select('*');
    
    if (date) {
      // 특정 날짜의 created_at 기준
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    } else {
      // 최근 데이터 (오늘)
      const today = new Date().toISOString().split('T')[0];
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
    }
    
    const { data: dailyData, error: dailyError } = await query;
    
    if (dailyError) throw dailyError;
    
    // 통계 계산
    const stats = {
      date: targetDate,
      totalProducts: dailyData.length,
      byType: {},
      averageScores: {
        margin: 0,
        trend: 0,
        balance: 0
      },
      profitability: {
        avgNetMargin: 0,
        totalNetProfit: 0,
        topPerformers: []
      },
      categories: {},
      platforms: {}
    };
    
    // 타입별 분포
    ['골든템(🔥)', '마진템(💎)', '트렌드템(📈)', '밸런스템(⚖️)'].forEach(type => {
      stats.byType[type] = dailyData.filter(item => item.product_type === type).length;
    });
    
    // 평균 점수
    if (dailyData.length > 0) {
      stats.averageScores.margin = dailyData.reduce((sum, item) => sum + (item.margin_score || 0), 0) / dailyData.length;
      stats.averageScores.trend = dailyData.reduce((sum, item) => sum + (item.trend_score || 0), 0) / dailyData.length;
      stats.averageScores.balance = dailyData.reduce((sum, item) => sum + (item.balance_score || 0), 0) / dailyData.length;
    }
    
    // 수익성 분석
    stats.profitability.avgNetMargin = dailyData.reduce((sum, item) => sum + (item.net_margin_rate || 0), 0) / dailyData.length || 0;
    stats.profitability.totalNetProfit = dailyData.reduce((sum, item) => sum + (item.net_profit || 0), 0);
    stats.profitability.topPerformers = dailyData
      .sort((a, b) => (b.net_profit || 0) - (a.net_profit || 0))
      .slice(0, 3)
      .map(item => ({
        name: item.product_name,
        netProfit: item.net_profit,
        netMargin: item.net_margin_rate,
        type: item.product_type
      }));
    
    // 카테고리 분포
    dailyData.forEach(item => {
      const category = item.category || '기타';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    });
    
    // 플랫폼 분포
    dailyData.forEach(item => {
      const platform = item.recommended_platform || '미정';
      stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
    });
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('일별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 주간/월간 트렌드 분석
router.get('/trends', async (req, res) => {
  try {
    const { period = 'week', type } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    }
    
    let query = supabase
      .from('product_analysis')
      .select('analysis_date, product_type, balance_score, net_profit, margin_score, trend_score')
      .gte('analysis_date', startDate.toISOString().split('T')[0])
      .order('analysis_date', { ascending: true });
    
    if (type && type !== 'all') {
      query = query.eq('product_type', type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // 일별로 그룹화
    const trendData = {};
    data.forEach(item => {
      const date = item.analysis_date;
      if (!trendData[date]) {
        trendData[date] = {
          date,
          totalProducts: 0,
          avgBalance: 0,
          totalNetProfit: 0,
          avgMarginScore: 0,
          avgTrendScore: 0,
          products: []
        };
      }
      
      trendData[date].totalProducts++;
      trendData[date].products.push(item);
    });
    
    // 평균 계산
    Object.values(trendData).forEach(dayData => {
      const products = dayData.products;
      dayData.avgBalance = products.reduce((sum, p) => sum + (p.balance_score || 0), 0) / products.length;
      dayData.totalNetProfit = products.reduce((sum, p) => sum + (p.net_profit || 0), 0);
      dayData.avgMarginScore = products.reduce((sum, p) => sum + (p.margin_score || 0), 0) / products.length;
      dayData.avgTrendScore = products.reduce((sum, p) => sum + (p.trend_score || 0), 0) / products.length;
      delete dayData.products; // 응답 사이즈 줄이기
    });
    
    res.json({
      success: true,
      period,
      data: Object.values(trendData)
    });
  } catch (error) {
    console.error('트렌드 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 상품 상세 분석
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('product_analysis')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('상품 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 카테고리별 성과 분석
router.get('/category-performance', async (req, res) => {
  try {
    const { period = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    
    const { data, error } = await supabase
      .from('product_analysis')
      .select('category, net_profit, net_margin_rate, balance_score, product_type')
      .gte('analysis_date', startDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    
    // 카테고리별 집계
    const categoryStats = {};
    
    data.forEach(item => {
      const category = item.category || '기타';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          count: 0,
          totalNetProfit: 0,
          avgNetMargin: 0,
          avgBalance: 0,
          typeDistribution: {}
        };
      }
      
      const stats = categoryStats[category];
      stats.count++;
      stats.totalNetProfit += item.net_profit || 0;
      stats.avgNetMargin += item.net_margin_rate || 0;
      stats.avgBalance += item.balance_score || 0;
      
      const type = item.product_type || '기타';
      stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
    });
    
    // 평균 계산
    Object.values(categoryStats).forEach(stats => {
      if (stats.count > 0) {
        stats.avgNetMargin = stats.avgNetMargin / stats.count;
        stats.avgBalance = stats.avgBalance / stats.count;
      }
    });
    
    const sortedCategories = Object.values(categoryStats)
      .sort((a, b) => b.totalNetProfit - a.totalNetProfit);
    
    res.json({
      success: true,
      data: sortedCategories
    });
  } catch (error) {
    console.error('카테고리 성과 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 시즌별 분석
router.get('/season-analysis', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_analysis')
      .select('current_season, season_fit, product_name, category, balance_score, analysis_date')
      .gte('analysis_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('season_fit', { ascending: false });
    
    if (error) throw error;
    
    // 시즌별 그룹화
    const seasonAnalysis = {};
    
    data.forEach(item => {
      const season = item.current_season || '시즌 정보 없음';
      if (!seasonAnalysis[season]) {
        seasonAnalysis[season] = {
          season,
          totalProducts: 0,
          avgSeasonFit: 0,
          avgBalance: 0,
          topProducts: [],
          categories: {}
        };
      }
      
      const seasonData = seasonAnalysis[season];
      seasonData.totalProducts++;
      seasonData.avgSeasonFit += item.season_fit || 0;
      seasonData.avgBalance += item.balance_score || 0;
      seasonData.topProducts.push({
        name: item.product_name,
        seasonFit: item.season_fit,
        balance: item.balance_score,
        category: item.category
      });
      
      const category = item.category || '기타';
      seasonData.categories[category] = (seasonData.categories[category] || 0) + 1;
    });
    
    // 평균 계산 및 상위 상품 정렬
    Object.values(seasonAnalysis).forEach(seasonData => {
      if (seasonData.totalProducts > 0) {
        seasonData.avgSeasonFit = seasonData.avgSeasonFit / seasonData.totalProducts;
        seasonData.avgBalance = seasonData.avgBalance / seasonData.totalProducts;
        seasonData.topProducts = seasonData.topProducts
          .sort((a, b) => (b.seasonFit || 0) - (a.seasonFit || 0))
          .slice(0, 5);
      }
    });
    
    res.json({
      success: true,
      data: Object.values(seasonAnalysis)
    });
  } catch (error) {
    console.error('시즌 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 모든 상품 목록 조회 (통합 리스트용)
router.get('/products', async (req, res) => {
  try {
    console.log('📦 [product-analysis] Products list route accessed');
    
    const { 
      limit = 1000, 
      offset = 0, 
      sort_by = 'balance_score', 
      order = 'desc',
      category = '',
      search = ''
    } = req.query;

    let query = supabase
      .from('product_analysis')
      .select(`
        id, product_name, category, product_type, rating,
        balance_score, trend_score, margin_score, margin_rate,
        selling_price, net_profit, net_margin_rate,
        why_this_product, sales_strategy, created_at, updated_at
      `);

    // 카테고리 필터
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }

    // 검색 필터
    if (search) {
      query = query.or(
        `product_name.ilike.%${search}%,category.ilike.%${search}%,why_this_product.ilike.%${search}%`
      );
    }

    // 정렬
    const validSortFields = ['balance_score', 'trend_score', 'margin_score', 'selling_price', 'created_at'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'balance_score';
    const sortOrder = order === 'asc' ? { ascending: true } : { ascending: false };

    query = query
      .order(sortField, sortOrder)
      .range(offset, parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ 상품 목록 조회 오류:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log(`✅ 상품 목록 조회 성공: ${data?.length || 0}개`);

    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });

  } catch (error) {
    console.error('❌ 상품 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;