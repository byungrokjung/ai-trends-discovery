const OpenAI = require('openai')
const { createClient } = require('@supabase/supabase-js')

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// Supabase 클라이언트 초기화
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        db: { schema: 'public' },
        auth: { persistSession: false }
    }
)

/**
 * 텍스트를 벡터 임베딩으로 변환
 * @param {string} text - 임베딩할 텍스트
 * @returns {Promise<number[]>} 임베딩 벡터
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        })
        return response.data[0].embedding
    } catch (error) {
        console.error('임베딩 생성 실패:', error)
        throw error
    }
}

/**
 * 인스타그램 콘텐츠에서 유사한 게시물 찾기
 * @param {string} query - 검색 쿼리 (텍스트 또는 ID)
 * @param {number} limit - 반환할 결과 수
 * @returns {Promise<Array>} 유사한 콘텐츠 배열
 */
async function findSimilarInstagramPosts(query, limit = 10) {
    try {
        // 1. 쿼리를 임베딩으로 변환
        const queryEmbedding = await generateEmbedding(query)

        // 2. Supabase 벡터 함수 호출
        const { data, error } = await supabase.rpc('search_instagram', {
            query_embedding: queryEmbedding,
            match_count: limit
        })

        if (error) {
            console.error('Supabase 벡터 검색 실패:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('인스타그램 유사 콘텐츠 검색 실패:', error)
        return []
    }
}

/**
 * 틱톡 콘텐츠에서 유사한 영상 찾기
 * @param {string} query - 검색 쿼리
 * @param {number} limit - 반환할 결과 수
 * @returns {Promise<Array>} 유사한 콘텐츠 배열
 */
async function findSimilarTikTokContents(query, limit = 10) {
    try {
        const queryEmbedding = await generateEmbedding(query)

        const { data, error } = await supabase.rpc('search_tiktok', {
            query_embedding: queryEmbedding,
            match_count: limit
        })

        if (error) {
            console.error('Supabase 벡터 검색 실패:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('틱톡 유사 콘텐츠 검색 실패:', error)
        return []
    }
}

/**
 * ID로 콘텐츠를 조회하고 유사한 콘텐츠 찾기
 * @param {string} contentId - 콘텐츠 ID
 * @param {string} type - 'instagram' 또는 'tiktok'
 * @param {number} limit - 반환할 결과 수
 * @returns {Promise<Object>} 원본 콘텐츠와 유사 콘텐츠
 */
async function findSimilarByContentId(contentId, type, limit = 10) {
    try {
        let originalContent = null
        let similarContents = []

        if (type === 'instagram') {
            // 원본 콘텐츠 조회
            const { data: original } = await supabase
                .from('instagram_posts')
                .select('*')
                .eq('id', contentId)
                .single()

            if (!original) {
                return { original: null, similar: [] }
            }

            originalContent = original

            // 캡션 기반 유사 콘텐츠 찾기
            const searchText = original.caption || original.ownerUsername
            similarContents = await findSimilarInstagramPosts(searchText, limit)

        } else if (type === 'tiktok') {
            const { data: original } = await supabase
                .from('tiktok_contents')
                .select('*')
                .eq('id', contentId)
                .single()

            if (!original) {
                return { original: null, similar: [] }
            }

            originalContent = original

            const searchText = original.description || original.author_name
            similarContents = await findSimilarTikTokContents(searchText, limit)
        }

        // 자기 자신은 제외
        similarContents = similarContents.filter(item => item.id !== contentId)

        return {
            original: originalContent,
            similar: similarContents
        }

    } catch (error) {
        console.error('ID 기반 유사 콘텐츠 검색 실패:', error)
        return { original: null, similar: [] }
    }
}

/**
 * 통합 검색 - 인스타그램과 틱톡 모두 검색
 * @param {string} query - 검색 쿼리
 * @param {number} limit - 각 플랫폼별 반환할 결과 수
 * @returns {Promise<Object>} 인스타그램과 틱톡 결과
 */
async function searchAllPlatforms(query, limit = 5) {
    try {
        const [instagramResults, tiktokResults] = await Promise.all([
            findSimilarInstagramPosts(query, limit),
            findSimilarTikTokContents(query, limit)
        ])

        return {
            instagram: instagramResults,
            tiktok: tiktokResults,
            total: instagramResults.length + tiktokResults.length
        }
    } catch (error) {
        console.error('통합 검색 실패:', error)
        return { instagram: [], tiktok: [], total: 0 }
    }
}

module.exports = {
    generateEmbedding,
    findSimilarInstagramPosts,
    findSimilarTikTokContents,
    findSimilarByContentId,
    searchAllPlatforms
}
