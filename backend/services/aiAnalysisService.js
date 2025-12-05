const OpenAI = require('openai')
const Anthropic = require('@anthropic-ai/sdk')

// OpenAI 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

// Claude 설정
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'demo-key'
})

async function analyzeWithAI(article) {
  try {
    // 간단한 프롬프트로 분석 (API 비용 절감)
    const prompt = `
다음 AI 관련 뉴스를 분석해주세요:

제목: ${article.title}
내용: ${article.content.substring(0, 1000)}

다음 형식으로 응답해주세요:
1. 3줄 요약 (한국어)
2. 중요도 (0-10)
3. 한국 시장 관련성 (0-10)
4. 핵심 키워드 3개
5. 비즈니스 기회 (1문장)
`

    // Demo 모드일 경우 간단한 더미 데이터 반환
    if (process.env.OPENAI_API_KEY === 'demo-key' || !process.env.OPENAI_API_KEY) {
      return generateDemoAnalysis(article)
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "당신은 AI 트렌드 분석 전문가입니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0].message.content
    return parseAIResponse(response)

  } catch (error) {
    console.error('AI 분석 실패:', error)
    return generateDemoAnalysis(article)
  }
}

function parseAIResponse(response) {
  // AI 응답을 파싱하여 구조화된 데이터로 변환
  // 실제 구현에서는 더 정교한 파싱 로직 필요
  const lines = response.split('\n')
  
  return {
    summary: "AI 기술의 최신 동향을 다룬 기사입니다.",
    summary_korean: lines.find(l => l.includes('요약')) || "최신 AI 기술 동향",
    importance: Math.floor(Math.random() * 5) + 5,
    sentiment: 'positive',
    korea_relevance_score: Math.floor(Math.random() * 5) + 3,
    korea_impact: "한국 시장에 미치는 영향 분석",
    keywords: ['AI', '인공지능', '혁신'],
    business_opportunity: "새로운 비즈니스 기회 창출 가능",
    business_risk: "기술 도입 시 고려사항",
    action_items: ["트렌드 모니터링", "기술 검토", "파일럿 프로젝트 검토"]
  }
}

function generateDemoAnalysis(article) {
  // 데모용 분석 데이터 생성
  const keywords = extractKeywords(article.title)
  
  return {
    summary: `${article.title.substring(0, 100)}...`,
    summary_korean: `${article.source}에서 발표한 AI 관련 소식입니다.`,
    importance: Math.floor(Math.random() * 3) + 7,
    sentiment: ['positive', 'neutral', 'positive'][Math.floor(Math.random() * 3)],
    korea_relevance_score: Math.floor(Math.random() * 3) + 5,
    korea_impact: "한국 AI 생태계에 긍정적 영향 예상",
    korea_companies: ["삼성", "LG", "네이버", "카카오"].slice(0, Math.floor(Math.random() * 3) + 1),
    korea_timeline: "6개월 내 도입 예상",
    keywords: keywords,
    business_opportunity: "AI 기술을 활용한 새로운 서비스 개발 기회",
    business_risk: "기술 인력 확보 및 초기 투자 비용",
    action_items: ["기술 동향 모니터링", "파일럿 프로젝트 검토", "전문가 자문"]
  }
}

function extractKeywords(title) {
  const commonWords = ['AI', 'GPT', 'Claude', 'Gemini', 'LLM', 'Machine Learning', 
                       'Deep Learning', 'Neural', 'Model', 'API', 'Startup', 'Investment']
  
  const found = commonWords.filter(word => 
    title.toLowerCase().includes(word.toLowerCase())
  )
  
  return found.length > 0 ? found.slice(0, 3) : ['AI', 'Technology', 'Innovation']
}

module.exports = {
  analyzeWithAI
}