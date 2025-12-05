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

    // 2. GPT로 트렌드 분석 및 키워드 추출 (타오바오/1688용 중국어 키워드 포함)
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
          "englishKeyword": "영어 검색 키워드 (2~3단어)",
          "chineseKeyword": "중국어 검색 키워드 (타오바오/1688 검색용, 2~3단어)",
          "searchTags": ["검색태그1", "검색태그2", "검색태그3"],
          "reason": "이 상품이 인기 있는 이유 (1문장)",
          "targetAudience": "타겟 고객층",
          "sellingPoint": "판매 소구점",
          "estimatedPrice": "예상 중국 도매가 (위안 단위, 숫자만)"
        }
      `;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "당신은 전문 MD이자 중국 소싱 전문가입니다. 타오바오/1688에서 검색 가능한 정확한 중국어 키워드를 제공해주세요. JSON 형식으로만 응답하세요." },
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

    // 3. 타오바오/1688 검색 URL 생성
    generateSearchUrls(chineseKeyword, englishKeyword) {
        const encodedChinese = encodeURIComponent(chineseKeyword || englishKeyword);
        const encodedEnglish = encodeURIComponent(englishKeyword);

        return {
            taobao: `https://s.taobao.com/search?q=${encodedChinese}`,
            alibaba1688: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodedChinese}`,
            aliexpress: `https://www.aliexpress.com/wholesale?SearchText=${encodedEnglish}`
        };
    }

    // 4. 상품 정보 생성 (타오바오/1688 링크 포함)
    async searchProducts(analysis) {
        const keyword = analysis.englishKeyword || 'product';
        const chineseKeyword = analysis.chineseKeyword || keyword;
        const searchTags = analysis.searchTags || [];

        // 검색 URL 생성
        const urls = this.generateSearchUrls(chineseKeyword, keyword);

        // Google API로 썸네일 이미지 가져오기 (있으면)
        let thumbnail = 'https://placehold.co/300x300?text=Product';

        if (this.googleApiKey && this.googleCx) {
            try {
                const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                    params: {
                        key: this.googleApiKey,
                        cx: this.googleCx,
                        q: `${keyword}`,
                        num: 1,
                        searchType: 'image'
                    }
                });
                if (response.data.items && response.data.items[0]) {
                    thumbnail = response.data.items[0].link;
                }
            } catch (error) {
                console.log('⚠️ 이미지 검색 실패, 기본 이미지 사용');
            }
        }

        return [{
            title: analysis.productName,
            thumbnail: thumbnail,
            links: {
                taobao: urls.taobao,
                alibaba1688: urls.alibaba1688,
                aliexpress: urls.aliexpress
            },
            primaryLink: urls.alibaba1688, // 1688을 기본으로
            chineseKeyword: chineseKeyword,
            englishKeyword: keyword,
            searchTags: searchTags,
            estimatedPrice: analysis.estimatedPrice || '확인필요'
        }];
    }

    getMockProducts(keyword) {
        const urls = this.generateSearchUrls(keyword, keyword);
        return [{
            title: `[Mock] ${keyword}`,
            thumbnail: 'https://placehold.co/300x300?text=Mock',
            links: urls,
            primaryLink: urls.alibaba1688,
            chineseKeyword: keyword,
            englishKeyword: keyword,
            searchTags: ['mock', 'test'],
            estimatedPrice: '10'
        }];
    }

    // 5. 전체 파이프라인 실행 (벡터 검색 활용)
    async processSourcingPipeline(options = {}) {
        const {
            useVectorSearch = true,
            searchQuery = '인기 트렌드 상품',
            limit = 5
        } = options;

        console.log('🚀 AI 소싱 파이프라인 시작...');
        console.log(`📊 벡터 검색: ${useVectorSearch ? 'ON (의미론적 유사도)' : 'OFF (좋아요 순)'}`);

        const contents = await this.getViralContents(limit, useVectorSearch, searchQuery);
        const results = [];

        console.log(`📥 수집된 콘텐츠: Instagram ${contents.instagram.length}개, TikTok ${contents.tiktok.length}개`);

        // 인스타그램 처리
        for (const post of contents.instagram) {
            console.log(`🔍 Instagram 분석 중: ${post.caption?.substring(0, 50)}...`);
            const analysis = await this.analyzeContent(post, 'instagram');
            if (analysis) {
                const products = await this.searchProducts(analysis);
                results.push({
                    type: 'instagram',
                    originalContent: post,
                    analysis,
                    sourcingProducts: products
                });
                console.log(`✅ 상품 매칭 완료: ${analysis.productName} (🇨🇳 ${analysis.chineseKeyword})`);
            }
        }

        // 틱톡 처리
        for (const content of contents.tiktok) {
            console.log(`🔍 TikTok 분석 중: ${content.description?.substring(0, 50)}...`);
            const analysis = await this.analyzeContent(content, 'tiktok');
            if (analysis) {
                const products = await this.searchProducts(analysis);
                results.push({
                    type: 'tiktok',
                    originalContent: content,
                    analysis,
                    sourcingProducts: products
                });
                console.log(`✅ 상품 매칭 완료: ${analysis.productName} (🇨🇳 ${analysis.chineseKeyword})`);
            }
        }

        console.log(`✅ 파이프라인 완료: ${results.length}개 아이템 분석됨`);
        return results;
    }
}

module.exports = new SourcingService();
