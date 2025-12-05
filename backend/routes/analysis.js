const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')

// 주간 트렌드 분석
router.get('/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { data: weeklyTrends, error } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .gte('published_at', oneWeekAgo.toISOString())
      .order('importance', { ascending: false })
    
    if (error) throw error
    
    // 키워드 빈도 분석
    const keywordFrequency = {}
    weeklyTrends.forEach(trend => {
      trend.keywords?.forEach(keyword => {
        keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1
      })
    })
    
    // 상위 키워드 추출
    const topKeywords = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))
    
    // 카테고리별 트렌드
    const categoryTrends = weeklyTrends.reduce((acc, trend) => {
      if (!acc[trend.category]) {
        acc[trend.category] = []
      }
      acc[trend.category].push(trend)
      return acc
    }, {})
    
    res.json({
      period: {
        start: oneWeekAgo.toISOString(),
        end: new Date().toISOString()
      },
      totalTrends: weeklyTrends.length,
      topKeywords,
      categoryBreakdown: Object.keys(categoryTrends).map(category => ({
        category,
        count: categoryTrends[category].length,
        avgImportance: categoryTrends[category].reduce((sum, t) => sum + t.importance, 0) / categoryTrends[category].length
      })),
      topTrends: weeklyTrends.slice(0, 10)
    })
  } catch (error) {
    console.error('Weekly analysis error:', error)
    res.status(500).json({ error: 'Failed to generate weekly analysis' })
  }
})

// 한국 시장 분석
router.get('/korea-impact', async (req, res) => {
  try {
    const { data: koreaRelevantTrends, error } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .gte('korea_relevance_score', 7)
      .order('korea_relevance_score', { ascending: false })
      .limit(20)
    
    if (error) throw error
    
    // 한국 기업별 언급 횟수
    const companyMentions = {}
    koreaRelevantTrends.forEach(trend => {
      trend.korea_companies?.forEach(company => {
        companyMentions[company] = (companyMentions[company] || 0) + 1
      })
    })
    
    res.json({
      highImpactTrends: koreaRelevantTrends,
      companyMentions: Object.entries(companyMentions)
        .sort((a, b) => b[1] - a[1])
        .map(([company, mentions]) => ({ company, mentions })),
      avgRelevanceScore: koreaRelevantTrends.reduce((sum, t) => sum + t.korea_relevance_score, 0) / koreaRelevantTrends.length
    })
  } catch (error) {
    console.error('Korea impact analysis error:', error)
    res.status(500).json({ error: 'Failed to generate Korea impact analysis' })
  }
})

// 카테고리별 트렌드 분석
router.get('/by-category/:category', async (req, res) => {
  try {
    const { category } = req.params
    const { timeframe = '7d' } = req.query
    
    // 시간 범위 계산
    const startDate = new Date()
    const daysMap = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }
    startDate.setDate(startDate.getDate() - (daysMap[timeframe] || 7))
    
    const { data: categoryTrends, error } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .eq('category', category)
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: false })
    
    if (error) throw error
    
    // 일별 트렌드 수 계산
    const dailyCount = {}
    categoryTrends.forEach(trend => {
      const date = new Date(trend.published_at).toISOString().split('T')[0]
      dailyCount[date] = (dailyCount[date] || 0) + 1
    })
    
    res.json({
      category,
      timeframe,
      totalTrends: categoryTrends.length,
      dailyDistribution: Object.entries(dailyCount)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count })),
      topTrends: categoryTrends.slice(0, 10),
      avgImportance: categoryTrends.reduce((sum, t) => sum + t.importance, 0) / categoryTrends.length || 0
    })
  } catch (error) {
    console.error('Category analysis error:', error)
    res.status(500).json({ error: 'Failed to generate category analysis' })
  }
})

module.exports = router