const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const dataCollector = require('../services/dataCollector');

// 한국 AI 뉴스 조회
router.get('/news', async (req, res) => {
  try {
    const { page = 1, limit = 20, company, industry, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('korean_ai_news')
      .select('*', { count: 'exact' })
      .order('publishedAt', { ascending: false })
      .range(offset, offset + limit - 1);

    // 필터 적용
    if (company) {
      query = query.eq('company', company);
    }
    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('뉴스 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// AI 적용 사례 조회
router.get('/use-cases', async (req, res) => {
  try {
    const { industry, search } = req.query;

    let query = supabaseAdmin
      .from('korean_ai_use_cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (industry && industry !== 'all') {
      query = query.eq('industry', industry);
    }
    if (search) {
      query = query.or(`company.ilike.%${search}%,title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('사례 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 한국 AI 기업 목록 조회
router.get('/companies', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('korean_ai_companies')
      .select('*')
      .order('name');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('기업 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 실시간 데이터 수집 트리거 (관리자용)
router.post('/collect', async (req, res) => {
  try {
    // 인증 체크 (실제로는 관리자 권한 확인 필요)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    // 백그라운드에서 데이터 수집 시작
    res.json({ 
      success: true, 
      message: '데이터 수집이 시작되었습니다. 완료까지 몇 분이 소요될 수 있습니다.' 
    });

    // 비동기로 수집 실행
    dataCollector.collectAll()
      .then(results => {
        console.log(`✅ 데이터 수집 완료: ${results.length}개 기사`);
      })
      .catch(error => {
        console.error('❌ 데이터 수집 실패:', error);
      });

  } catch (error) {
    console.error('수집 트리거 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 트렌드 통계 조회
router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 기업별 뉴스 수
    const { data: companyStats } = await supabaseAdmin
      .from('korean_ai_news')
      .select('company, created_at')
      .gte('created_at', startDate.toISOString())
      .not('company', 'is', null);

    // 산업별 사례 수
    const { data: industryStats } = await supabaseAdmin
      .from('korean_ai_use_cases')
      .select('industry, created_at')
      .gte('created_at', startDate.toISOString());

    // 일별 뉴스 수
    const { data: dailyNews } = await supabaseAdmin
      .from('korean_ai_news')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    // 통계 집계
    const companyCount = {};
    companyStats?.forEach(item => {
      companyCount[item.company] = (companyCount[item.company] || 0) + 1;
    });

    const industryCount = {};
    industryStats?.forEach(item => {
      industryCount[item.industry] = (industryCount[item.industry] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        topCompanies: Object.entries(companyCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
        topIndustries: Object.entries(industryCount)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count })),
        totalNews: dailyNews?.length || 0,
        period: `${days}일`
      }
    });
  } catch (error) {
    console.error('트렌드 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;