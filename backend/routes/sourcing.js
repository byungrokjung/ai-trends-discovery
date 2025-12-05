const express = require('express');
const router = express.Router();
const sourcingService = require('../services/sourcingService');

// AI 소싱 파이프라인 실행 및 결과 조회
router.get('/recommendations', async (req, res) => {
    try {
        console.log('🛍️ [Sourcing] AI 추천 요청 받음');

        // 실시간으로 파이프라인 실행 (향후에는 DB에 저장된 결과 조회로 변경 권장)
        const results = await sourcingService.processSourcingPipeline();

        res.json({
            success: true,
            count: results.length,
            data: results
        });
    } catch (error) {
        console.error('❌ 소싱 추천 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
