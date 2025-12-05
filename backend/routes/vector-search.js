const express = require('express')
const router = express.Router()
const vectorSearchService = require('../services/vectorSearchService')

/**
 * GET /api/vector-search/similar
 * 유사 콘텐츠 검색
 */
router.get('/similar', async (req, res) => {
    try {
        const { query, type, contentId, limit = 10 } = req.query

        if (!query && !contentId) {
            return res.status(400).json({
                success: false,
                error: 'query 또는 contentId가 필요합니다.'
            })
        }

        let results

        // ID로 검색하는 경우
        if (contentId && type) {
            const searchResult = await vectorSearchService.findSimilarByContentId(contentId, type, limit)
            results = searchResult.similar
        } else if (type === 'instagram') {
            // 텍스트로 검색하는 경우
            results = await vectorSearchService.findSimilarInstagramPosts(query, limit)
        } else if (type === 'tiktok') {
            results = await vectorSearchService.findSimilarTikTokContents(query, limit)
        } else {
            // 전체 검색 (결과 병합)
            const searchResult = await vectorSearchService.searchAllPlatforms(query, Math.ceil(limit / 2))

            // 인스타그램 결과에 플랫폼 태그 추가
            const insta = searchResult.instagram.map(item => ({
                ...item,
                platform: 'instagram',
                content: item.caption,
                displayUrl: item.displayUrl || item.thumbnailUrl
            }))

            // 틱톡 결과에 플랫폼 태그 추가
            const tiktok = searchResult.tiktok.map(item => ({
                ...item,
                platform: 'tiktok',
                content: item.description,
                displayUrl: item.cover_image_url
            }))

            // 병합 및 유사도순 정렬
            results = [...insta, ...tiktok].sort((a, b) => b.similarity - a.similarity)
        }

        res.json({
            success: true,
            data: results
        })

    } catch (error) {
        console.error('벡터 검색 API 오류:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

/**
 * GET /api/vector-search/test
 * 벡터 검색 기능 테스트
 */
router.get('/test', async (req, res) => {
    try {
        const testQuery = '패션 트렌드'
        const results = await vectorSearchService.searchAllPlatforms(testQuery, 3)

        res.json({
            success: true,
            message: '벡터 검색 테스트 완료',
            testQuery,
            data: results
        })
    } catch (error) {
        console.error('벡터 검색 테스트 실패:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

module.exports = router
