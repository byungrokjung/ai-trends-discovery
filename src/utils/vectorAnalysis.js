// 벡터 분석 유틸리티 함수들

export const cosineSimilarity = (vectorA, vectorB) => {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
    return 0
  }

  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0)
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0))

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }

  return dotProduct / (magnitudeA * magnitudeB)
}

// 벡터 파싱 (PostgreSQL 벡터 형태 처리)
export const parseVector = (embedding) => {
  if (!embedding) return []
  
  if (Array.isArray(embedding)) {
    return embedding
  }

  if (typeof embedding === 'string') {
    try {
      // PostgreSQL vector 형태 "[1,2,3]"를 파싱
      let cleanStr = embedding.replace(/^\[|\]$/g, '')
      return cleanStr.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n))
    } catch (e) {
      console.error('Vector parsing failed:', e)
      return []
    }
  }

  return []
}

// 문제 키워드 감지 (대폭 확장된 패턴)
export const detectProblemKeywords = (text) => {
  const lowerText = text.toLowerCase()
  
  const problemPatterns = [
    // 직접적 문제 표현
    '아파', '아픈', '힘들어', '힘든', '불편', '답답', '피곤', '스트레스', '스트레스받',
    '고민', '문제', '해결', '도움', '필요', '어려워', '어렵다', '곤란', '골치',
    
    // 감정적 표현
    '짜증', '화나', '우울', '슬퍼', '외로워', '걱정', '불안', '초조', '답답',
    
    // 신체적 불편 (대폭 확장)
    '목아파', '목이아파', '목이', '허리아파', '허리가', '어깨아파', '어깨가',
    '눈아파', '눈이', '두통', '머리아파', '불면', '잠못자', '잠이안와',
    '건조', '트러블', '탈모', '살찌', '다이어트', '살빼', '몸무거워',
    '거북목', '일자목', '굽은어깨', '자세', '뻐근', '결림', '쑤셔', '묵직',
    '숨막혀', '호흡곤란', '가슴답답', '소화안돼', '체해', '속쓰려',
    '두드러기', '가려워', '따가워', '뜨거워', '시려', '차가워',
    
    // 생활 패턴 문제
    '정리안돼', '정리가안돼', '지저분', '더러워', '깔끔하지못해', '어수선',
    '시간없어', '시간이없어', '바빠', '바쁘다', '돈없어', '돈이없어',
    '귀찮아', '귀찮다', '복잡해', '복잡하다', '번거로워', '성가셔',
    
    // 환경 문제
    '냄새', '소음', '시끄러워', '더워', '덥다', '추워', '춥다',
    '습해', '건조해', '끈적해', '미끄러워', '좁아', '비좁아',
    '어두워', '밝아', '눈부셔', '흔들려', '불안정',
    
    // 업무/학습 문제
    '집중안돼', '집중이안돼', '능률안올라', '효율떨어져',
    '졸려', '졸림', '멍때려', '딴생각', '기억안나', '깜빡',
    '헷갈려', '헷갈리다', '복잡해', '어려워',
    
    // 건강/체력 문제
    '아프다', '컨디션안좋아', '몸이안좋아', '기운없어', '무기력',
    '열나', '오한', '현기증', '어지러워', '메스꺼워', '토할거같아',
    '피로해', '지쳐', '탈진', '번아웃', '스트레스받아',
    
    // 운동/다이어트 관련
    '살쪘어', '찌는거같아', '빠지지않아', '운동안돼', '운동부족',
    '근육없어', '근력부족', '체력떨어져', '유연성없어',
    
    // 수면 문제
    '못자', '안잠져', '뒤척여', '꿈많아', '악몽', '깨어',
    '일찍깨', '늦게자', '수면패턴', '불면증', '잠버릇',
    
    // 뷰티/외모 고민  
    '늙어보여', '칙칙해', '트러블나', '모공커져', '기미생겨',
    '다크서클', '붓기', '각질', '땡기는', '유분기',
    
    // 요리/음식 문제
    '요리못해', '레시피모르겠', '맛없어', '짜', '달아', '싱거워',
    '태워먹어', '익지않아', '상해', '냄새나', '시원하지않아',
    
    // 펫/반려동물 문제
    '펫냄새', '털날려', '짖어', '물어', '말안들어', '아파보여',
    '스트레스받는거같아', '외로워하는거같아',
    
    // 자동차 관련
    '정체', '교통체증', '주차어려워', '기름값비싸', '수리비',
    '냄새나', '덥다', '춥다', '소음', '진동'
  ]

  // 부정적 표현 패턴 확장
  const negativePatterns = [
    '안좋아', '별로', '실망', '후회', '짜증나', '화나', '최악',
    '문제있어', '고장', '말썽', '트러블', '버그', '오류',
    '비싸', '부담스러워', '아까워', '손해', '낭비',
    '실패', '망쳤어', '엉망', '개판', '난리'
  ]

  // 욕구/필요성 표현
  const needPatterns = [
    '필요해', '사고싶어', '갖고싶어', '있었으면좋겠어', '생겼으면',
    '구하고싶어', '찾고있어', '알아보고있어', '고민중', '선택장애',
    '뭘사지', '뭘할지', '어떤걸', '추천해줘', '도움이될만한',
    '효과있는', '좋은거', '괜찮은거', '쓸만한거'
  ]

  const allPatterns = [...problemPatterns, ...negativePatterns, ...needPatterns]

  const foundProblems = allPatterns.filter(pattern => 
    lowerText.includes(pattern)
  )

  // 추가: 문맥적 분석 (확장)
  let contextualScore = 0
  if (lowerText.includes('때문에') || lowerText.includes('해서')) contextualScore += 0.1
  if (lowerText.includes('?') || lowerText.includes('어떡하')) contextualScore += 0.1  
  if (lowerText.includes('ㅠㅠ') || lowerText.includes('ㅜㅜ') || lowerText.includes('😭')) contextualScore += 0.2
  if (lowerText.includes('도움') || lowerText.includes('해결') || lowerText.includes('개선')) contextualScore += 0.15
  if (lowerText.includes('추천') || lowerText.includes('괜찮은') || lowerText.includes('좋은')) contextualScore += 0.1

  return {
    hasProblems: foundProblems.length > 0,
    problems: foundProblems,
    problemScore: (foundProblems.length / allPatterns.length) + contextualScore
  }
}

// 실제 상품명 추출 함수 (고도화)
export const extractActualProducts = (text) => {
  const lowerText = text.toLowerCase()
  
  // 실제 상품 브랜드/모델명 패턴
  const productPatterns = {
    // 스마트폰 관련
    mobile: [
      '아이폰', 'iphone', '갤럭시', 'galaxy', '에어팟', 'airpods', 
      '맥북', 'macbook', '아이패드', 'ipad', '갤럭시버즈', 'galaxy buds'
    ],
    // 뷰티/화장품
    beauty: [
      '더페이스샵', '토니앤가이', '이니스프리', 'innisfree', '랑콤', 'lancome',
      '에스티로더', 'estee lauder', '클리오', 'clio', '3ce', '롬앤', 'romand'
    ],
    // 패션
    fashion: [
      '유니클로', 'uniqlo', '자라', 'zara', '에이치앤엠', 'h&m', 'gu', '지유',
      '무지', 'muji', '올리브영', 'olive young', 'mlb', '컨버스', 'converse'
    ],
    // 가전제품
    electronics: [
      '다이슨', 'dyson', '샤오미', 'xiaomi', '필립스', 'philips', 
      '브라운', 'braun', 'lg전자', '삼성전자', 'apple', '애플'
    ],
    // 생활용품
    lifestyle: [
      '이케아', 'ikea', '다이소', 'daiso', '무인양품', '락앤락', 'lock&lock',
      '써모스', 'thermos', '스타벅스', 'starbucks', '투명용기', '밀폐용기'
    ]
  }
  
  const foundProducts = []
  
  for (const [category, products] of Object.entries(productPatterns)) {
    for (const product of products) {
      if (lowerText.includes(product)) {
        foundProducts.push({ product, category, confidence: 0.9 })
      }
    }
  }
  
  // 일반적인 상품 키워드도 감지
  const generalPatterns = [
    '마사지기', '가습기', '공기청정기', '선풍기', '헤어드라이기',
    '블렌더', '전자레인지', '에어프라이어', '믹서기', '토스터',
    '베개', '매트리스', '이불', '담요', '쿠션',
    '케이스', '충전기', '이어폰', '스피커', '마우스',
    '화분', '식물', '조명', '거울', '시계'
  ]
  
  for (const pattern of generalPatterns) {
    if (lowerText.includes(pattern)) {
      foundProducts.push({ product: pattern, category: 'general', confidence: 0.7 })
    }
  }
  
  return foundProducts.sort((a, b) => b.confidence - a.confidence)
}

// 상품 관련 키워드 감지 (기존 + 강화)
export const detectProductKeywords = (text) => {
  const productPatterns = [
    // 구매 관련
    '샀어', '구매', '주문', '배송', '택배', '포장', '개봉',
    '사용', '써보', '후기', '리뷰', '추천', '비추', '언박싱',
    
    // 상품 관련
    '제품', '상품', '아이템', '브랜드', '가격', '할인',
    '세일', '특가', '무료배송', '쿠폰', '새로산', '신제품',
    
    // 만족도 관련
    '좋아', '만족', '대박', '최고', '별로', '실망',
    '가성비', '품질', '디자인', '기능', '완전좋아', '강추'
  ]

  const foundKeywords = productPatterns.filter(pattern => 
    text.toLowerCase().includes(pattern)
  )
  
  // 실제 상품 추출
  const actualProducts = extractActualProducts(text)

  return {
    isProductRelated: foundKeywords.length > 0 || actualProducts.length > 0,
    keywords: foundKeywords,
    actualProducts: actualProducts,
    productScore: (foundKeywords.length / productPatterns.length) + (actualProducts.length * 0.1)
  }
}

// 클러스터링을 위한 벡터 그룹화
export const clusterVectorsByKMeans = (vectors, k = 5) => {
  // 간단한 K-means 구현 (실제로는 더 정교한 라이브러리 사용 권장)
  const centroids = []
  const assignments = new Array(vectors.length)
  
  // 초기 중심점 랜덤 선택
  for (let i = 0; i < k; i++) {
    centroids.push(vectors[Math.floor(Math.random() * vectors.length)])
  }
  
  let changed = true
  let iterations = 0
  const maxIterations = 100
  
  while (changed && iterations < maxIterations) {
    changed = false
    
    // 각 벡터를 가장 가까운 중심점에 할당
    for (let i = 0; i < vectors.length; i++) {
      let bestCluster = 0
      let bestDistance = Infinity
      
      for (let j = 0; j < k; j++) {
        const similarity = cosineSimilarity(vectors[i], centroids[j])
        const distance = 1 - similarity // 유사도를 거리로 변환
        
        if (distance < bestDistance) {
          bestDistance = distance
          bestCluster = j
        }
      }
      
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster
        changed = true
      }
    }
    
    // 중심점 업데이트 (각 클러스터의 평균)
    for (let j = 0; j < k; j++) {
      const clusterVectors = vectors.filter((_, i) => assignments[i] === j)
      if (clusterVectors.length > 0) {
        const newCentroid = new Array(vectors[0].length).fill(0)
        for (const vector of clusterVectors) {
          for (let dim = 0; dim < vector.length; dim++) {
            newCentroid[dim] += vector[dim]
          }
        }
        for (let dim = 0; dim < newCentroid.length; dim++) {
          newCentroid[dim] /= clusterVectors.length
        }
        centroids[j] = newCentroid
      }
    }
    
    iterations++
  }
  
  // 클러스터별로 그룹화
  const clusters = []
  for (let j = 0; j < k; j++) {
    clusters.push({
      id: j,
      centroid: centroids[j],
      items: vectors
        .map((vector, index) => ({ vector, index }))
        .filter((item, index) => assignments[index] === j)
    })
  }
  
  return clusters.filter(cluster => cluster.items.length > 0)
}

// 벡터에서 관련 콘텐츠 찾기
export const findSimilarContent = (targetVector, contentList, threshold = 0.7) => {
  return contentList
    .map(content => {
      const contentVector = parseVector(content.embedding)
      return {
        ...content,
        similarity: cosineSimilarity(targetVector, contentVector)
      }
    })
    .filter(content => content.similarity > threshold)
    .sort((a, b) => b.similarity - a.similarity)
}

// 트렌드 점수 계산
export const calculateTrendScore = (content, allContent) => {
  const baseScore = 50
  const platform = content.platform
  
  // 참여도 점수 (0-40점)
  const platformContent = allContent.filter(c => c.platform === platform)
  const avgEngagement = platformContent.reduce((sum, c) => sum + (c.engagement || 0), 0) / platformContent.length
  const engagementScore = Math.min(40, (content.engagement / avgEngagement) * 20)
  
  // 최신성 점수 (0-20점)
  const now = new Date()
  const contentDate = new Date(content.timestamp || content.created_at)
  const daysDiff = (now - contentDate) / (1000 * 60 * 60 * 24)
  const recencyScore = Math.max(0, 20 - daysDiff * 2) // 10일 후 0점
  
  // 해시태그 인기도 (0-20점)
  const hashtagScore = (content.hashtags?.length || 0) * 4
  
  return Math.min(100, baseScore + engagementScore + recencyScore + hashtagScore)
}

// 상품 기회 평가 (실제 언급 상품 포함)
export const evaluateProductOpportunity = (cluster, allContent) => {
  const clusterTexts = cluster.items.map(item => {
    const content = allContent[item.index]
    return content.caption || content.description || content.why_this_product || ''
  })
  
  const combinedText = clusterTexts.join(' ')
  const problemAnalysis = detectProblemKeywords(combinedText)
  const productAnalysis = detectProductKeywords(combinedText)
  
  // 관련 콘텐츠들 (실제 게시물 정보 포함)
  const relatedContent = cluster.items.map(item => {
    const content = allContent[item.index]
    const actualProducts = extractActualProducts(content.caption || content.description || '')
    return {
      ...content,
      mentionedProducts: actualProducts,
      hasActualProducts: actualProducts.length > 0
    }
  })
  
  // 실제 언급된 상품들 수집
  const allMentionedProducts = []
  relatedContent.forEach(content => {
    if (content.mentionedProducts) {
      allMentionedProducts.push(...content.mentionedProducts)
    }
  })
  
  // 가장 많이 언급된 상품 TOP 5
  const productFreq = {}
  allMentionedProducts.forEach(item => {
    const key = item.product
    productFreq[key] = (productFreq[key] || 0) + 1
  })
  
  const topProducts = Object.entries(productFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([product, count]) => ({ product, count }))
  
  // 평균 참여도 계산
  const avgEngagement = relatedContent.reduce((sum, content) => {
    return sum + (content.engagement || content.likes + content.comments || 0)
  }, 0) / relatedContent.length
  
  // 트렌드 점수 계산
  const trendScore = relatedContent.reduce((sum, content) => {
    return sum + calculateTrendScore(content, allContent)
  }, 0) / relatedContent.length
  
  // 사업성 점수 계산 (실제 상품 언급도 반영)
  let viabilityScore = 50
  
  if (problemAnalysis.hasProblems) viabilityScore += 20
  if (productAnalysis.isProductRelated) viabilityScore += 15
  if (allMentionedProducts.length > 0) viabilityScore += 25 // 실제 상품 언급 시 높은 점수
  if (avgEngagement > 1000) viabilityScore += 10
  if (trendScore > 70) viabilityScore += 15
  
  return {
    clusterSize: cluster.items.length,
    avgEngagement: Math.round(avgEngagement),
    trendScore: Math.round(trendScore),
    viabilityScore: Math.min(100, Math.round(viabilityScore)),
    problemKeywords: problemAnalysis.problems,
    productKeywords: productAnalysis.keywords,
    mentionedProducts: topProducts,
    actualProductsCount: allMentionedProducts.length,
    relatedContent,
    textSample: combinedText.substring(0, 200)
  }
}