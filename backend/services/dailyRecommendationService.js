const { supabase } = require('../config/supabase')
const sourcingService = require('./sourcingService')
const { selectBalancedTrends } = require('./trendAnalysisService')

/**
 * 매일 50개 상품 추천 생성 (타오바오/1688 링크 + 검색 태그 포함)
 */
async function generateDailyRecommendations() {
    try {
        console.log('🚀 일일 상품 추천 생성 시작...')

        // 1. 균형있게 50개 트렌드 선택
        const selectedTrends = await selectBalancedTrends()

        if (selectedTrends.length === 0) {
            console.log('⚠️ 선택된 트렌드가 없습니다.')
            return []
        }

        console.log(`📊 ${selectedTrends.length}개 트렌드 선택 완료`)

        // 2. 각 트렌드마다 상품 추천 생성
        const recommendations = []
        const today = new Date().toISOString().split('T')[0]

        for (const trend of selectedTrends) {
            try {
                // GPT 분석 (중국어 키워드 + 검색 태그 포함)
                const analysis = await sourcingService.analyzeContent(trend, trend.platform)

                if (analysis && analysis.productName) {
                    // 상품 정보 생성 (타오바오/1688 링크 포함)
                    const products = await sourcingService.searchProducts(analysis)

                    if (products && products.length > 0) {
                        const product = products[0]

                        recommendations.push({
                            date: today,
                            platform: trend.platform,
                            category: trend.category,
                            trend_keyword: analysis.productName,
                            product_name: product.title,
                            product_url: product.primaryLink, // 1688 기본
                            thumbnail_url: product.thumbnail,
                            analysis: JSON.stringify({
                                reason: analysis.reason,
                                targetAudience: analysis.targetAudience,
                                sellingPoint: analysis.sellingPoint,
                                // 새로 추가된 필드들
                                chineseKeyword: product.chineseKeyword,
                                englishKeyword: product.englishKeyword,
                                searchTags: product.searchTags,
                                estimatedPrice: product.estimatedPrice,
                                links: product.links // 타오바오, 1688, AliExpress
                            }),
                            confidence_score: 0.8,
                            original_content_id: String(trend.id)
                        })

                        console.log(`✅ [${trend.category}/${trend.platform}] ${analysis.productName}`)
                        console.log(`   🇨🇳 중국어: ${product.chineseKeyword}`)
                        console.log(`   🏷️ 태그: ${product.searchTags.join(', ')}`)
                    }
                }
            } catch (error) {
                console.error(`❌ 트렌드 처리 실패:`, error.message)
            }

            // API 요청 속도 제한 (0.5초 대기)
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        console.log(`✅ 총 ${recommendations.length}개 상품 추천 생성 완료`)

        return recommendations
    } catch (error) {
        console.error('일일 추천 생성 실패:', error)
        return []
    }
}

/**
 * 추천 결과를 Supabase에 저장
 */
async function saveRecommendations(recommendations) {
    try {
        if (recommendations.length === 0) {
            console.log('⚠️ 저장할 추천이 없습니다.')
            return { success: false, count: 0 }
        }

        const { data, error } = await supabase
            .from('daily_recommendations')
            .insert(recommendations)

        if (error) {
            console.error('Supabase 저장 실패:', error)
            return { success: false, error }
        }

        console.log(`💾 ${data?.length || recommendations.length}개 추천 저장 완료`)

        return { success: true, count: data?.length || recommendations.length }
    } catch (error) {
        console.error('추천 저장 실패:', error)
        return { success: false, error }
    }
}

/**
 * 오늘의 추천 조회
 */
async function getTodaysRecommendations() {
    try {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('daily_recommendations')
            .select('*')
            .eq('date', today)
            .order('confidence_score', { ascending: false })

        if (error) {
            console.error('추천 조회 실패:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('추천 조회 실패:', error)
        return []
    }
}

/**
 * 카테고리별 추천 조회
 */
async function getRecommendationsByCategory(category, date = null) {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('daily_recommendations')
            .select('*')
            .eq('date', targetDate)
            .eq('category', category)
            .order('confidence_score', { ascending: false })

        if (error) {
            console.error('카테고리별 조회 실패:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('카테고리별 조회 실패:', error)
        return []
    }
}

module.exports = {
    generateDailyRecommendations,
    saveRecommendations,
    getTodaysRecommendations,
    getRecommendationsByCategory
}
