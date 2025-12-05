const cron = require('node-cron')
const { generateDailyRecommendations, saveRecommendations } = require('../services/dailyRecommendationService')

/**
 * 매일 아침 7시에 일일 추천 생성
 * 크론 표현식: '0 7 * * *' = 매일 7시 0분
 */
function startDailyCronJob() {
    console.log('🕐 일일 추천 크론잡 설정 완료: 매일 아침 7시 실행')

    cron.schedule('0 7 * * *', async () => {
        console.log('========================================')
        console.log(`🚀 [${new Date().toLocaleString('ko-KR')}] 일일 추천 크론잡 시작`)
        console.log('========================================')

        try {
            const recommendations = await generateDailyRecommendations()

            if (recommendations.length > 0) {
                const result = await saveRecommendations(recommendations)
                console.log(`✅ 크론잡 완료: ${recommendations.length}개 상품 저장됨`)
            } else {
                console.log('⚠️ 크론잡: 생성된 추천이 없습니다.')
            }
        } catch (error) {
            console.error('❌ 크론잡 실패:', error)
        }

        console.log('========================================')
        console.log(`🏁 [${new Date().toLocaleString('ko-KR')}] 일일 추천 크론잡 종료`)
        console.log('========================================')
    }, {
        scheduled: true,
        timezone: 'Asia/Seoul' // 한국 시간대
    })
}

module.exports = { startDailyCronJob }
