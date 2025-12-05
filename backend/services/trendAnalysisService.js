const { supabase } = require('../config/supabase')
const OpenAI = require('openai')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

/**
 * GPT로 트렌드 카테고리 분류
 */
async function classifyCategory(trendText) {
    try {
        const prompt = `다음 트렌드를 하나의 카테고리로 분류하세요.

트렌드: "${trendText}"

반드시 다음 중 하나만 선택하세요:
- fashion (패션/의류)
- beauty (뷰티/화장품)
- home (홈/인테리어)
- tech (테크/가젯)
- lifestyle (라이프스타일/기타)

JSON 형식으로만 응답: {"category": "..."}`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "카테고리 분류 전문가입니다. JSON 형식으로만 응답하세요." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        })

        const result = JSON.parse(completion.choices[0].message.content)
        return result.category || 'lifestyle'
    } catch (error) {
        console.error('카테고리 분류 실패:', error)
        return 'lifestyle'
    }
}

/**
 * 카테고리별 + 플랫폼별 균형있게 트렌드 선택
 * A + C 혼합: 새로운 비율 + 부족 시 보충
 */
async function selectBalancedTrends() {
    try {
        const TOTAL_TARGET = 50 // 총 목표 개수

        // 새로운 카테고리별 목표 비율 (A + C 혼합)
        const targetDistribution = {
            beauty: 15,      // 뷰티 (인기 높음)
            home: 12,        // 홈/인테리어
            lifestyle: 13,   // 라이프스타일
            fashion: 5,      // 패션
            tech: 5          // 테크
        }

        // 1. Instagram과 TikTok 최근 데이터 가져오기
        const { data: instagramPosts } = await supabase
            .from('instagram_posts')
            .select('*')
            .order('likesCount', { ascending: false })
            .limit(150) // 더 많이 가져오기

        const { data: tiktokContents } = await supabase
            .from('tiktok_contents')
            .select('*')
            .order('digg_count', { ascending: false })
            .limit(150)

        // 2. 각 콘텐츠에 카테고리 부여
        const categorizedInstagram = await Promise.all(
            (instagramPosts || []).map(async post => ({
                ...post,
                platform: 'instagram',
                text: post.caption || '',
                category: await classifyCategory(post.caption || post.hashtags || '')
            }))
        )

        const categorizedTiktok = await Promise.all(
            (tiktokContents || []).map(async content => ({
                ...content,
                platform: 'tiktok',
                text: content.description || '',
                category: await classifyCategory(content.description || content.hashtags || '')
            }))
        )

        // 3. 전체 데이터 합치기
        const allCategorized = [...categorizedInstagram, ...categorizedTiktok]

        // 4. 카테고리별로 선택 (목표 비율대로)
        const categories = ['beauty', 'home', 'lifestyle', 'fashion', 'tech']
        const selected = []
        let shortage = 0 // 부족한 개수

        for (const category of categories) {
            const target = targetDistribution[category]
            const available = allCategorized.filter(item => item.category === category)

            // 목표 개수만큼 선택 (Instagram/TikTok 균형 맞추기)
            const instaItems = available.filter(i => i.platform === 'instagram').slice(0, Math.ceil(target / 2))
            const tiktokItems = available.filter(i => i.platform === 'tiktok').slice(0, Math.ceil(target / 2))
            const selectedForCategory = [...instaItems, ...tiktokItems].slice(0, target)

            selected.push(...selectedForCategory)

            // 부족하면 기록
            if (selectedForCategory.length < target) {
                shortage += target - selectedForCategory.length
            }
        }

        // 5. 부족한 만큼 다른 카테고리에서 보충
        if (shortage > 0) {
            console.log(`⚠️ ${shortage}개 부족 - 다른 카테고리에서 보충 중...`)

            // 이미 선택된 ID 목록
            const selectedIds = new Set(selected.map(s => s.id))

            // 아직 선택되지 않은 항목들 (인기순)
            const remaining = allCategorized
                .filter(item => !selectedIds.has(item.id))
                .slice(0, shortage)

            selected.push(...remaining)
        }

        // 최대 50개로 제한
        const finalSelected = selected.slice(0, TOTAL_TARGET)

        console.log(`✅ 선택된 트렌드: ${finalSelected.length}개`)
        console.log(`   - Instagram: ${finalSelected.filter(t => t.platform === 'instagram').length}개`)
        console.log(`   - TikTok: ${finalSelected.filter(t => t.platform === 'tiktok').length}개`)

        // 카테고리별 분포 로그
        categories.forEach(cat => {
            const count = finalSelected.filter(t => t.category === cat).length
            console.log(`   - ${cat}: ${count}개`)
        })

        return finalSelected
    } catch (error) {
        console.error('균형 트렌드 선택 실패:', error)
        return []
    }
}

module.exports = {
    classifyCategory,
    selectBalancedTrends
}
