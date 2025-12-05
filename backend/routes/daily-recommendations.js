const express = require('express')
const router = express.Router()
const {
    generateDailyRecommendations,
    saveRecommendations,
    getTodaysRecommendations,
    getRecommendationsByCategory
} = require('../services/dailyRecommendationService')

/**
 * GET /api/daily-recommendations
 * 오늘의 추천 조회
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query

        let recommendations
        if (category) {
            recommendations = await getRecommendationsByCategory(category)
        } else {
            recommendations = await getTodaysRecommendations()
        }

        // 카테고리별 통계
        const stats = {
            total: recommendations.length,
            byCategory: {}
        }

        const categories = ['fashion', 'beauty', 'home', 'tech', 'lifestyle']
        categories.forEach(cat => {
            stats.byCategory[cat] = recommendations.filter(r => r.category === cat).length
        })

        res.json({
            success: true,
            data: recommendations,
            stats
        })
    } catch (error) {
        console.error('추천 조회 실패:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

/**
 * POST /api/daily-recommendations/generate
 * 수동으로 추천 생성 (테스트용)
 */
router.post('/generate', async (req, res) => {
    try {
        console.log('🛍️ [Daily Rec] 수동 생성 요청')

        const recommendations = await generateDailyRecommendations()

        if (recommendations.length > 0) {
            const result = await saveRecommendations(recommendations)

            res.json({
                success: true,
                count: recommendations.length,
                message: `${recommendations.length}개 추천 생성 및 저장 완료`,
                stats: {
                    fashion: recommendations.filter(r => r.category === 'fashion').length,
                    beauty: recommendations.filter(r => r.category === 'beauty').length,
                    home: recommendations.filter(r => r.category === 'home').length,
                    tech: recommendations.filter(r => r.category === 'tech').length,
                    lifestyle: recommendations.filter(r => r.category === 'lifestyle').length
                }
            })
        } else {
            res.json({
                success: false,
                message: '추천 생성 실패'
            })
        }
    } catch (error) {
        console.error('추천 생성 실패:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

module.exports = router
