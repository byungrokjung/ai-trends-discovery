const Parser = require('rss-parser')
const { supabaseAdmin } = require('../config/supabase')
const { analyzeWithAI } = require('./aiAnalysisService')

const parser = new Parser({
  customFields: {
    item: ['media:content', 'content:encoded', 'dc:creator']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  timeout: 10000
})

const RSS_SOURCES = {
  critical: [
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'news' },
    { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'company' },
  ],
  important: [
    // VentureBeat 제거 (429 에러)
    { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai/index.xml', category: 'news' },
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'research' },
  ],
  korean: [
    // AI타임스 제거 (403 에러)
    { name: 'Naver AI NOW', url: 'https://naver.github.io/feed.xml', category: 'korean' },
  ]
}

async function crawlRSS(source) {
  try {
    console.log(`📡 크롤링 시작: ${source.name}`)
    
    // 타임아웃과 함께 RSS 파싱
    const feed = await Promise.race([
      parser.parseURL(source.url),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      )
    ])
    
    if (!feed || !feed.items || feed.items.length === 0) {
      console.log(`⚠️ ${source.name}: 아이템이 없습니다`)
      return []
    }
    
    const items = []
    for (const item of feed.items.slice(0, 5)) { // 최근 5개만 (부하 감소)
      try {
        // 중복 체크
        const { data: existing } = await supabaseAdmin
          .from('products')
          .select('id')
          .eq('original_url', item.link)
          .single()
        
        if (existing) {
          console.log(`⏭️ 이미 존재: ${item.title}`)
          continue
        }
        
        // AI 분석
        const analysis = await analyzeWithAI({
          title: item.title,
          content: item.content || item.contentSnippet || '',
          url: item.link,
          source: source.name
        })
        
        // DB에 저장
        const trendItem = {
          title: item.title,
          original_url: item.link,
          source: source.name,
          published_at: new Date(item.pubDate || item.isoDate),
          category: source.category,
          ...analysis
        }
        
        const { error } = await supabaseAdmin
          .from('products')
          .insert([trendItem])
        
        if (error) {
          console.error(`❌ 저장 실패: ${item.title}`, error)
        } else {
          console.log(`✅ 저장 완료: ${item.title}`)
          items.push(trendItem)
        }
        
      } catch (itemError) {
        console.error(`❌ 아이템 처리 실패: ${item.title}`, itemError)
      }
    }
    
    return items
  } catch (error) {
    console.error(`❌ RSS 크롤링 실패: ${source.name}`, error)
    return []
  }
}

async function startRSSCrawler() {
  console.log('🚀 RSS 크롤러 시작...')
  
  const allSources = [
    ...RSS_SOURCES.critical,
    ...RSS_SOURCES.important,
    ...RSS_SOURCES.korean
  ]
  
  // 순차적으로 실행하여 rate limit 회피
  const results = []
  for (const source of allSources) {
    try {
      const items = await crawlRSS(source)
      results.push({ status: 'fulfilled', value: items })
      
      // 각 소스 간 2초 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      results.push({ status: 'rejected', reason: error })
    }
  }
  
  const totalItems = results
    .filter(r => r.status === 'fulfilled')
    .reduce((sum, r) => sum + r.value.length, 0)
  
  console.log(`✅ RSS 크롤링 완료: 총 ${totalItems}개 아이템 저장됨`)
}

module.exports = {
  startRSSCrawler,
  crawlRSS
}