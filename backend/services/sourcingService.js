const axios = require('axios');
const { supabase } = require('../config/supabase');
const OpenAI = require('openai');
const vectorSearchService = require('./vectorSearchService');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class SourcingService {
    constructor() {
        this.googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.googleCx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    }

    // 1. 바이럴 콘텐츠 가져오기 (벡터 검색 활용)
    async getViralContents(limit = 5, useVectorSearch = false, query = null) {
        try {
            // 벡터 검색을 사용하는 경우
            if (useVectorSearch && query) {
                console.log(`🔍 벡터 검색 사용: "${query}"`);
                const results = await vectorSearchService.searchAllPlatforms(query, limit);
                return {
                    instagram: results.instagram || [],
                    tiktok: results.tiktok || []
                };
            }

            // 기본: 좋아요/조회수 순 정렬
            const { data: instaPosts } = await supabase
                .from('instagram_posts')
                .select('*')
                .order('likesCount', { ascending: false })
                .limit(limit);

            const { data: tiktokPosts } = await supabase
                .from('tiktok_contents')
                .select('*')
                .order('digg_count', { ascending: false })
                .limit(limit);

            return {
                instagram: instaPosts || [],
                tiktok: tiktokPosts || []
            };
        } catch (error) {
            console.error('❌ 바이럴 콘텐츠 조회 실패:', error);
            return { instagram: [], tiktok: [] };
        }
    }

    // 2. GPT로 트렌드 분석 및 키워드 추출
    async analyzeContent(content, platform) {
        try {
            const text = platform === 'instagram'
                ? `${content.caption || ''} ${content.hashtags || ''}`
                : `${content.description || ''} ${content.hashtags || ''}`;

            const prompt = `
        다음 소셜 미디어 콘텐츠를 분석하여 소싱할 만한 상품을 찾아주세요.
        
        [콘텐츠 내용]
        ${text.substring(0, 500)}

        다음 형식의 JSON으로만 응답해주세요:
        {
          "productName": "핵심 상품명 (한국어)",
          "englishKeyword": "Aliexpress 검색용 영어 키워드 (2~3단어)",
          "reason": "이 상품이 인기 있는 이유 (1문장)",
          "targetAudience": "타겟 고객층",
          "sellingPoint": "판매 소구점"
        }
      `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // 가성비 모델 사용
                messages: [
                    { role: "system", content: "당신은 전문 MD이자 소싱 전문가입니다. JSON 형식으로만 응답하세요." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('❌ GPT 분석 실패:', error);
            return null;
        }
    }

    // 3. 상품 검색 (Google Custom Search API -> AliExpress)
    async searchProducts(keyword) {
        // API 키가 없으면 모의 데이터 반환
        if (!this.googleApiKey || !this.googleCx) {
            console.log('⚠️ Google Search API 키가 없습니다. 모의 데이터를 반환합니다.');
            return this.getMockProducts(keyword);
        }

        try {
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: this.googleApiKey,
                    cx: this.googleCx,
                    q: `${keyword} site:aliexpress.com`,
                    num: 3,
                    searchType: 'image' // 이미지 검색 결과가 상품 매칭에 유리
                }
            });

            if (!response.data.items) return [];

            return response.data.items.map(item => ({
                title: item.title,
                link: item.link, // 이미지 링크
                contextLink: item.image.contextLink, // 실제 상품 페이지
                thumbnail: item.image.thumbnailLink,
                price: '가격 정보 확인 필요' // Google Image Search는 가격을 직접 주지 않음
            }));

        } catch (error) {
            console.error('❌ Google 검색 실패:', error.message);
            return this.getMockProducts(keyword);
        }
    }

    getMockProducts(keyword) {
        return [
            {
                title: `[Mock] ${keyword} - High Quality`,
                link: 'https://via.placeholder.com/300',
                contextLink: 'https://aliexpress.com',
                thumbnail: 'https://via.placeholder.com/150',
                price: '$12.99'
            },
            {
                title: `[Mock] Best ${keyword} 2024`,
                link: 'https://via.placeholder.com/300',
                contextLink: 'https://aliexpress.com',
                thumbnail: 'https://via.placeholder.com/150',
                price: '$9.50'
            }
        ];
    }

    // 4. 전체 파이프라인 실행 (벡터 검색 활용)
    async processSourcingPipeline(options = {}) {
        const {
            useVectorSearch = true,  // 벡터 검색 다시 활성화 ✅
            searchQuery = '인기 트렌드 상품',  // 벡터 검색 쿼리
            limit = 5  // 플랫폼별 상위 N개
        } = options;

        console.log('🚀 AI 소싱 파이프라인 시작...');
        console.log(`📊 벡터 검색: ${useVectorSearch ? 'ON (의미론적 유사도)' : 'OFF (좋아요 순)'}`);

        // 벡터 검색 또는 기본 방식으로 콘텐츠 가져오기
        const contents = await this.getViralContents(limit, useVectorSearch, searchQuery);
        const results = [];

        console.log(`📥 수집된 콘텐츠: Instagram ${contents.instagram.length}개, TikTok ${contents.tiktok.length}개`);

        // 인스타그램 처리
        for (const post of contents.instagram) {
            console.log(`🔍 Instagram 분석 중: ${post.caption?.substring(0, 50)}...`);
            const analysis = await this.analyzeContent(post, 'instagram');
            if (analysis) {
                const products = await this.searchProducts(analysis.englishKeyword);
                results.push({
                    type: 'instagram',
                    originalContent: post,
                    analysis,
                    sourcingProducts: products
                });
                console.log(`✅ 상품 매칭 완료: ${analysis.productName} → ${products.length}개 상품`);
            }
        }

        // 틱톡 처리
        for (const content of contents.tiktok) {
            console.log(`🔍 TikTok 분석 중: ${content.description?.substring(0, 50)}...`);
            const analysis = await this.analyzeContent(content, 'tiktok');
            if (analysis) {
                const products = await this.searchProducts(analysis.englishKeyword);
                results.push({
                    type: 'tiktok',
                    originalContent: content,
                    analysis,
                    sourcingProducts: products
                });
                console.log(`✅ 상품 매칭 완료: ${analysis.productName} → ${products.length}개 상품`);
            }
        }

        console.log(`✅ 파이프라인 완료: ${results.length}개 아이템 분석됨`);
        console.log(`📊 벡터 검색 사용: ${useVectorSearch ? 'YES' : 'NO'}`);

        return results;
    }
}

module.exports = new SourcingService();
