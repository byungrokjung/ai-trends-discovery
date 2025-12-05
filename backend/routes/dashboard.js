const express = require('express')
const router = express.Router()
const { supabaseAdmin } = require('../config/supabase')

// 대시보드 요약 데이터
router.get('/summary', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // 오늘의 트렌드
    const { data: todayTrends, count: todayCount } = await supabaseAdmin
      .from('trend_items')
      .select('*', { count: 'exact' })
      .gte('published_at', today.toISOString())
      .order('importance', { ascending: false })
      .limit(5)
    
    // 어제 대비 증감
    const { count: yesterdayCount } = await supabaseAdmin
      .from('trend_items')
      .select('*', { count: 'exact', head: true })
      .gte('published_at', yesterday.toISOString())
      .lt('published_at', today.toISOString())
    
    // 핫 키워드 (최근 24시간)
    const { data: recentTrends } = await supabaseAdmin
      .from('trend_items')
      .select('keywords')
      .gte('published_at', yesterday.toISOString())
    
    const keywordCount = {}
    recentTrends?.forEach(trend => {
      trend.keywords?.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1
      })
    })
    
    const hotKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword)
    
    // 주요 소스별 통계
    const { data: sourceStats } = await supabaseAdmin
      .from('trend_items')
      .select('source')
      .gte('published_at', yesterday.toISOString())
    
    const sourceCounts = sourceStats?.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1
      return acc
    }, {})
    
    res.json({
      today: {
        count: todayCount || 0,
        change: todayCount - yesterdayCount,
        changePercent: yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount * 100).toFixed(1) : 0,
        topTrends: todayTrends || []
      },
      hotKeywords,
      sourceCounts: sourceCounts || {},
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Dashboard summary error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard summary' })
  }
})

// 실시간 트렌드
router.get('/realtime', async (req, res) => {
  try {
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)
    
    const { data: realtimeTrends, error } = await supabaseAdmin
      .from('trend_items')
      .select('*')
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    res.json({
      trends: realtimeTrends || [],
      count: realtimeTrends?.length || 0,
      timeframe: '1h'
    })
  } catch (error) {
    console.error('Realtime trends error:', error)
    res.status(500).json({ error: 'Failed to fetch realtime trends' })
  }
})

// 트렌드 차트 데이터
router.get('/charts/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    
    const { data: trends, error } = await supabaseAdmin
      .from('trend_items')
      .select('published_at, importance, category')
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: true })
    
    if (error) throw error
    
    // 일별 데이터 집계
    const dailyData = {}
    trends?.forEach(trend => {
      const date = new Date(trend.published_at).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          total: 0,
          avgImportance: 0,
          categories: {}
        }
      }
      
      dailyData[date].total++
      dailyData[date].avgImportance += trend.importance
      dailyData[date].categories[trend.category] = (dailyData[date].categories[trend.category] || 0) + 1
    })
    
    // 평균 중요도 계산
    Object.values(dailyData).forEach(day => {
      day.avgImportance = day.total > 0 ? (day.avgImportance / day.total).toFixed(1) : 0
    })
    
    res.json({
      chartData: Object.values(dailyData),
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: parseInt(days)
      }
    })
  } catch (error) {
    console.error('Chart data error:', error)
    res.status(500).json({ error: 'Failed to fetch chart data' })
  }
})

module.exports = router