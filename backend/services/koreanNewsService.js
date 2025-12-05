const axios = require('axios');
const cheerio = require('cheerio');
const { supabaseAdmin } = require('../config/supabase');

// 한국 AI 뉴스 소스
const koreanNewsSources = [
  {
    name: 'AI타임스',
    url: 'https://www.aitimes.com/news/articleList.html?sc_section_code=S1N1',
    selector: '.list-titles',
    parseArticle: ($, element) => ({
      title: $(element).find('a').text().trim(),
      link: 'https://www.aitimes.com' + $(element).find('a').attr('href'),
      summary: $(element).find('.list-summary').text().trim(),
      date: $(element).find('.list-dated').text().trim()
    })
  },
  {
    name: '전자신문 AI',
    url: 'https://www.etnews.com/news/section.html?id1=04&id2=041',
    selector: '.list_news li',
    parseArticle: ($, element) => ({
      title: $(element).find('.tit a').text().trim(),
      link: $(element).find('.tit a').attr('href'),
      summary: $(element).find('.txt').text().trim(),
      date: $(element).find('.date').text().trim()
    })
  }
];

// 한국 기업별 AI 뉴스 키워드
const koreanCompanyKeywords = {
  '네이버': ['하이퍼클로바', 'HyperCLOVA', '클로바X', 'CLOVA Studio'],
  '카카오': ['KoGPT', '카카오브레인', 'B^ DISCOVER'],
  '삼성': ['가우스', 'Gauss', '온디바이스AI'],
  'LG': ['엑사원', 'EXAONE', 'LG AI연구원'],
  'SK': ['에이닷', 'A.', 'SK C&C'],
  'KT': ['믿음', 'Mi:Dm', 'KT AI'],
  '현대': ['현대자동차', '42dot', '현대모비스'],
  '뷰노': ['VUNO Med', '의료AI'],
  '업스테이지': ['Solar', 'Document AI'],
  '마키나락스': ['산업AI', 'MakiPEX']
};

// 뉴스 스크래핑 함수
async function scrapeKoreanNews(source) {
  try {
    console.log(`🇰🇷 한국 뉴스 수집 중: ${source.name}`);
    
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const articles = [];
    
    $(source.selector).each((index, element) => {
      if (index >= 10) return; // 최신 10개만
      
      try {
        const article = source.parseArticle($, element);
        
        // AI 관련 뉴스만 필터링
        const isAIRelated = article.title.match(/AI|인공지능|머신러닝|딥러닝|LLM|GPT/i) ||
                           article.summary?.match(/AI|인공지능|머신러닝|딥러닝|LLM|GPT/i);
        
        if (isAIRelated && article.title && article.link) {
          // 관련 기업 찾기
          let relatedCompany = null;
          for (const [company, keywords] of Object.entries(koreanCompanyKeywords)) {
            if (keywords.some(keyword => 
              article.title.includes(keyword) || 
              article.summary?.includes(keyword)
            )) {
              relatedCompany = company;
              break;
            }
          }
          
          articles.push({
            ...article,
            source: source.name,
            company: relatedCompany,
            category: categorizeNews(article.title),
            isKorean: true
          });
        }
      } catch (error) {
        console.error('기사 파싱 오류:', error);
      }
    });
    
    return articles;
  } catch (error) {
    console.error(`❌ ${source.name} 스크래핑 실패:`, error.message);
    return [];
  }
}

// 뉴스 카테고리 분류
function categorizeNews(title) {
  const categories = {
    '서비스 출시': ['출시', '런칭', '공개', '오픈'],
    '투자': ['투자', '펀딩', '시리즈', '억원'],
    '기술 발표': ['개발', '기술', '성능', '업그레이드'],
    '파트너십': ['협력', '제휴', 'MOU', '계약'],
    '인수합병': ['인수', '합병', 'M&A'],
    '연구 성과': ['연구', '논문', '특허'],
    '정책': ['정부', '규제', '지원', '정책']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => title.includes(keyword))) {
      return category;
    }
  }
  
  return '일반';
}

// 산업별 AI 적용 사례 수집
async function collectUseCases() {
  // 실제로는 여러 소스에서 수집하거나 API를 사용
  // 여기서는 예시 데이터 반환
  return [
    {
      company: '신한은행',
      industry: '금융',
      title: 'AI 기반 이상거래 탐지 시스템',
      description: 'ML 활용 실시간 금융사기 탐지',
      aiTech: ['이상탐지', 'ML'],
      results: {
        accuracy: '95%',
        improvement: '+85%'
      },
      source: 'press_release',
      date: new Date()
    }
  ];
}

// 한국 AI 시장 데이터 저장
async function saveKoreanMarketData(data) {
  try {
    const { error } = await supabaseAdmin
      .from('korean_ai_market')
      .insert(data);
    
    if (error) {
      console.error('데이터 저장 실패:', error);
      return false;
    }
    
    console.log(`✅ ${data.length}개 한국 시장 데이터 저장 완료`);
    return true;
  } catch (error) {
    console.error('저장 중 오류:', error);
    return false;
  }
}

// 전체 한국 뉴스 수집 실행
async function collectAllKoreanNews() {
  console.log('🇰🇷 한국 AI 뉴스 수집 시작...');
  
  const allArticles = [];
  
  // 각 소스에서 뉴스 수집
  for (const source of koreanNewsSources) {
    const articles = await scrapeKoreanNews(source);
    allArticles.push(...articles);
    
    // API 제한 회피를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 중복 제거
  const uniqueArticles = allArticles.filter((article, index, self) =>
    index === self.findIndex(a => a.title === article.title)
  );
  
  console.log(`📰 총 ${uniqueArticles.length}개의 한국 AI 뉴스 수집 완료`);
  
  // DB 저장
  if (uniqueArticles.length > 0) {
    await saveKoreanMarketData(uniqueArticles);
  }
  
  return uniqueArticles;
}

module.exports = {
  collectAllKoreanNews,
  collectUseCases,
  scrapeKoreanNews
};