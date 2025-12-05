const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')

// 트렌드 목록 조회
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      importance_min,
      korea_relevance_min,
      search 
    } = req.query
    
    let query = supabaseAdmin
      .from('trend_items')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
    
    // 필터 적용
    if (category) {
      query = query.eq('category', category)
    }
    
    if (importance_min) {
      query = query.gte('importance', parseInt(importance_min))
    }
    
    if (korea_relevance_min) {
      query = query.gte('korea_relevance_score', parseInt(korea_relevance_min))
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary_korean.ilike.%${search}%`)
    }
    
    // 페이지네이션
    const startIndex = (page - 1) * limit
    query = query.range(startIndex, startIndex + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      throw error
    }
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Trends fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

// 트렌드 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const { data, error } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) {
      return res.status(404).json({ error: 'Trend not found' })
    }
    
    // 조회수 증가 (인증된 사용자만)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization
      const token = authHeader.replace('Bearer ', '')
      
      try {
        const { data: { user } } = await supabase.auth.getUser(token)
        if (user) {
          await supabaseAdmin
            .from('trend_views')
            .insert([{
              trend_item_id: id,
              user_id: user.id
            }])
        }
      } catch (viewError) {
        console.error('View tracking error:', viewError)
      }
    }
    
    res.json(data)
  } catch (error) {
    console.error('Trend detail error:', error)
    res.status(500).json({ error: 'Failed to fetch trend detail' })
  }
})

// 트렌드 통계
router.get('/stats/summary', async (req, res) => {
  try {
    // 오늘의 트렌드 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { count: todayCount } = await supabaseAdmin
      .from('trend_items')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
    
    // 카테고리별 통계
    const { data: categoryStats } = await supabaseAdmin
      .from('trend_items')
      .select('category')
      .order('category')
    
    const categoryCounts = categoryStats.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {})
    
    // 중요도 높은 트렌드 (8점 이상)
    const { data: importantTrends } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .gte('importance', 8)
      .order('published_at', { ascending: false })
      .limit(5)
    
    res.json({
      todayCount,
      categoryCounts,
      importantTrends
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

module.exports = router