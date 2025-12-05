// 한국 AI 뉴스/데이터 수집 소스 설정

module.exports = {
  // 뉴스 RSS 피드
  rssFeeds: [
    {
      name: 'AI타임스',
      url: 'https://www.aitimes.com/rss/allArticle.xml',
      category: 'news'
    },
    {
      name: 'ZDNet Korea AI',
      url: 'https://www.zdnet.co.kr/topic/ai/rss.xml', 
      category: 'news'
    },
    {
      name: '블로터 AI',
      url: 'https://www.bloter.net/feed?category=ai',
      category: 'news'
    }
  ],

  // 스크래핑 대상 사이트
  scrapingSites: [
    {
      name: '전자신문 AI섹션',
      url: 'https://www.etnews.com/news/section.html?id1=04&id2=041',
      selectors: {
        article: '.list_news li',
        title: '.tit a',
        link: '.tit a',
        summary: '.txt',
        date: '.date'
      }
    },
    {
      name: '네이버 D2',
      url: 'https://d2.naver.com/news',
      selectors: {
        article: '.post_article',
        title: '.post_title a',
        link: '.post_title a', 
        summary: '.post_txt',
        date: '.post_date'
      }
    }
  ],

  // API 엔드포인트
  apis: {
    naver: {
      searchNews: 'https://openapi.naver.com/v1/search/news.json',
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      }
    },
    kakao: {
      webSearch: 'https://dapi.kakao.com/v2/search/web',
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_API_KEY}`
      }
    },
    bigkinds: {
      // 빅카인즈 API (신청 필요)
      baseUrl: 'https://www.bigkinds.or.kr/api',
      apiKey: process.env.BIGKINDS_API_KEY
    }
  },

  // 한국 AI 기업 리스트
  koreanAICompanies: [
    {
      name: '네이버',
      keywords: ['하이퍼클로바', 'HyperCLOVA', '클로바X', 'CLOVA Studio', '네이버 AI'],
      newsroom: 'https://www.navercorp.com/promotion/pressRelease'
    },
    {
      name: '카카오',
      keywords: ['KoGPT', '카카오브레인', 'B^ DISCOVER', '카카오 AI'],
      newsroom: 'https://www.kakaocorp.com/page/news/press'
    },
    {
      name: '삼성전자',
      keywords: ['가우스', 'Gauss', '온디바이스AI', '삼성리서치'],
      newsroom: 'https://news.samsung.com/kr/latest'
    },
    {
      name: 'LG AI연구원',
      keywords: ['엑사원', 'EXAONE', 'LG AI', 'LG사이언스파크'],
      newsroom: 'https://www.lgresearch.ai/news'
    },
    {
      name: 'SK텔레콤',
      keywords: ['에이닷', 'A.', 'SKT AI', '사피온'],
      newsroom: 'https://www.sktelecom.com/view-page/press'
    },
    {
      name: 'KT',
      keywords: ['믿음', 'Mi:Dm', 'KT AI', 'AICC'],
      newsroom: 'https://corp.kt.com/html/promote/news.html'
    },
    {
      name: '뷰노',
      keywords: ['VUNO Med', '의료AI', '뷰노메드'],
      newsroom: 'https://www.vuno.co/news'
    },
    {
      name: '업스테이지',
      keywords: ['Solar', 'Document AI', 'OCR', '업스테이지'],
      newsroom: 'https://www.upstage.ai/newsroom'
    },
    {
      name: '뤼이드',
      keywords: ['산타', 'SANTA', '뤼이드AI', 'AI튜터'],
      newsroom: 'https://riiid.co/ko/newsroom'
    },
    {
      name: '마키나락스',
      keywords: ['산업AI', 'MakiPEX', '예측정비', '마키나락스'],
      newsroom: 'https://makinarocks.ai/news'
    }
  ],

  // 산업별 카테고리
  industries: {
    '금융': ['은행', '증권', '보험', '핀테크', '금융AI'],
    '의료': ['병원', '헬스케어', '진단', '의료AI', '디지털치료제'],
    '제조': ['스마트팩토리', '품질검사', '예지보전', '자동화', '로봇'],
    '유통': ['이커머스', '리테일', '물류', '배송', '재고관리'],
    '교육': ['에듀테크', '온라인교육', 'AI튜터', '학습분석'],
    '미디어': ['콘텐츠', '방송', '광고', '마케팅', '개인화'],
    '게임': ['게임AI', 'NPC', '게임봇', '밸런싱'],
    '보안': ['사이버보안', '이상탐지', '보안AI', '인증']
  },

  // 정부/공공 데이터 소스
  governmentSources: {
    // 과학기술정보통신부
    msit: {
      name: '과기정통부',
      rss: 'https://www.msit.go.kr/webzine/rssList.do',
      api: null
    },
    // 한국지능정보사회진흥원
    nia: {
      name: 'NIA',
      url: 'https://www.nia.or.kr/site/nia_kor/ex/bbs/List.do?cbIdx=67992',
      reports: 'https://www.nia.or.kr/site/nia_kor/ex/bbs/List.do?cbIdx=82618'
    },
    // 정보통신산업진흥원
    nipa: {
      name: 'NIPA',
      url: 'https://www.nipa.kr/main/selectBbsNttList.do?bbsNo=2'
    },
    // AI Hub
    aihub: {
      name: 'AI Hub',
      api: 'https://aihub.or.kr/api/v1',
      datasets: 'https://aihub.or.kr/aihubdata/data/list.do'
    }
  }
};