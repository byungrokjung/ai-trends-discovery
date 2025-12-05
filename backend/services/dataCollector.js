const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const koreanSources = require('../config/koreanSources');

const parser = new Parser();

class DataCollector {
  constructor() {
    this.rssParser = new Parser();
  }

  // RSS 피드 수집
  async collectRSSFeeds() {
    console.log('🔄 RSS 피드 수집 시작...');
    const allArticles = [];

    for (const feed of koreanSources.rssFeeds) {
      try {
        console.log(`📡 ${feed.name} RSS 수집 중...`);
        const feedData = await this.rssParser.parseURL(feed.url);
        
        const articles = feedData.items.slice(0, 20).map(item => ({
          title: item.title,
          summary: item.contentSnippet || item.content,
          link: item.link,
          publishedAt: new Date(item.pubDate || item.isoDate),
          source: feed.name,
          category: feed.category,
          originalId: item.guid || item.link
        }));

        allArticles.push(...articles);
        console.log(`✅ ${feed.name}: ${articles.length}개 기사 수집`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${feed.name} RSS 수집 실패:`, error.message);
      }
    }

    return allArticles;
  }

  // 웹 스크래핑
  async scrapeSites() {
    console.log('🕷️ 웹 스크래핑 시작...');
    const allArticles = [];

    for (const site of koreanSources.scrapingSites) {
      try {
        console.log(`🔍 ${site.name} 스크래핑 중...`);
        const response = await axios.get(site.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const articles = [];

        $(site.selectors.article).each((index, element) => {
          if (index >= 10) return;
          
          const $elem = $(element);
          const title = $elem.find(site.selectors.title).text().trim();
          const link = $elem.find(site.selectors.link).attr('href');
          const summary = $elem.find(site.selectors.summary).text().trim();
          const date = $elem.find(site.selectors.date).text().trim();

          if (title && link) {
            articles.push({
              title,
              link: link.startsWith('http') ? link : new URL(link, site.url).href,
              summary,
              publishedAt: this.parseKoreanDate(date),
              source: site.name,
              category: 'news'
            });
          }
        });

        allArticles.push(...articles);
        console.log(`✅ ${site.name}: ${articles.length}개 기사 수집`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ ${site.name} 스크래핑 실패:`, error.message);
      }
    }

    return allArticles;
  }

  // 네이버 뉴스 API
  async collectNaverNews(query = 'AI 인공지능') {
    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      console.log('⚠️ 네이버 API 키가 설정되지 않았습니다.');
      return [];
    }

    try {
      console.log('🔍 네이버 뉴스 검색 중...');
      const response = await axios.get(koreanSources.apis.naver.searchNews, {
        params: {
          query,
          display: 30,
          sort: 'date'
        },
        headers: koreanSources.apis.naver.headers
      });

      const articles = response.data.items.map(item => ({
        title: this.cleanHTML(item.title),
        summary: this.cleanHTML(item.description),
        link: item.link,
        publishedAt: new Date(item.pubDate),
        source: '네이버 뉴스',
        category: 'news'
      }));

      console.log(`✅ 네이버 뉴스: ${articles.length}개 기사 수집`);
      return articles;
    } catch (error) {
      console.error('❌ 네이버 뉴스 API 오류:', error.message);
      return [];
    }
  }

  // AI 관련 키워드 필터링
  filterAIRelated(articles) {
    const aiKeywords = [
      'AI', '인공지능', '머신러닝', '딥러닝', 'GPT', 'LLM', 
      '자연어처리', '컴퓨터비전', '생성AI', '챗봇', '로봇',
      ...Object.values(koreanSources.koreanAICompanies).flatMap(c => c.keywords)
    ];

    return articles.filter(article => {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      return aiKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );
    });
  }

  // 기업 매칭
  matchCompany(article) {
    for (const company of koreanSources.koreanAICompanies) {
      const text = `${article.title} ${article.summary}`;
      if (company.keywords.some(keyword => text.includes(keyword))) {
        return company.name;
      }
    }
    return null;
  }

  // 산업 분류
  classifyIndustry(article) {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    
    for (const [industry, keywords] of Object.entries(koreanSources.industries)) {
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        return industry;
      }
    }
    
    return '기타';
  }

  // 중복 제거
  removeDuplicates(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = `${article.title}-${article.source}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 데이터베이스 저장
  async saveToDatabase(articles) {
    if (articles.length === 0) {
      console.log('저장할 기사가 없습니다.');
      return;
    }

    try {
      // 기존 데이터와 중복 체크를 위해 최근 데이터 조회
      const { data: existingData } = await supabaseAdmin
        .from('korean_ai_news')
        .select('originalId, link')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const existingLinks = new Set(existingData?.map(d => d.link) || []);
      
      // 중복되지 않은 기사만 필터링
      const newArticles = articles.filter(article => 
        !existingLinks.has(article.link)
      );

      if (newArticles.length === 0) {
        console.log('✅ 모든 기사가 이미 존재합니다.');
        return;
      }

      // 추가 정보 보강
      const enrichedArticles = newArticles.map(article => ({
        ...article,
        company: this.matchCompany(article),
        industry: this.classifyIndustry(article),
        aiRelated: true,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabaseAdmin
        .from('korean_ai_news')
        .insert(enrichedArticles);

      if (error) {
        console.error('❌ 데이터베이스 저장 실패:', error);
      } else {
        console.log(`✅ ${enrichedArticles.length}개 새 기사 저장 완료`);
      }
    } catch (error) {
      console.error('❌ 데이터 저장 중 오류:', error);
    }
  }

  // 전체 수집 프로세스
  async collectAll() {
    console.log('🚀 전체 데이터 수집 시작...');
    const startTime = Date.now();

    const results = await Promise.allSettled([
      this.collectRSSFeeds(),
      this.scrapeSites(),
      this.collectNaverNews()
    ]);

    const allArticles = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    console.log(`📊 총 ${allArticles.length}개 기사 수집`);

    // AI 관련 기사만 필터링
    const aiArticles = this.filterAIRelated(allArticles);
    console.log(`🤖 AI 관련 기사: ${aiArticles.length}개`);

    // 중복 제거
    const uniqueArticles = this.removeDuplicates(aiArticles);
    console.log(`📋 중복 제거 후: ${uniqueArticles.length}개`);

    // 데이터베이스 저장
    await this.saveToDatabase(uniqueArticles);

    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`✅ 데이터 수집 완료 (소요시간: ${elapsedTime}초)`);

    return uniqueArticles;
  }

  // 유틸리티 함수들
  cleanHTML(text) {
    return text
      .replace(/<[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  parseKoreanDate(dateStr) {
    if (!dateStr) return new Date();
    
    // "3시간 전", "1일 전" 등의 상대 시간 처리
    if (dateStr.includes('전')) {
      const now = new Date();
      if (dateStr.includes('분')) {
        const minutes = parseInt(dateStr);
        return new Date(now - minutes * 60 * 1000);
      } else if (dateStr.includes('시간')) {
        const hours = parseInt(dateStr);
        return new Date(now - hours * 60 * 60 * 1000);
      } else if (dateStr.includes('일')) {
        const days = parseInt(dateStr);
        return new Date(now - days * 24 * 60 * 60 * 1000);
      }
    }
    
    // "2024.03.15" 형식
    if (dateStr.includes('.')) {
      const [year, month, day] = dateStr.split('.');
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateStr);
  }

  // 스케줄링 설정
  startScheduledCollection() {
    // 매 시간마다 실행
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ 정기 데이터 수집 시작...');
      await this.collectAll();
    });

    console.log('📅 데이터 수집 스케줄러 시작됨 (매시간 실행)');
  }
}

module.exports = new DataCollector();