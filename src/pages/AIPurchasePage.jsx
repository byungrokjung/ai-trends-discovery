import { useState, useEffect } from 'react'
import { Search, Package, Clock, TrendingUp, Filter, ChevronRight, Tag, Star, Heart, Share2, RefreshCw, Bell, Zap } from 'lucide-react'
import purchaseService from '../services/purchaseService'
import useToastStore from '../store/useToastStore'

export default function AIPurchasePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [trendSignals, setTrendSignals] = useState([])
  const [isCollecting, setIsCollecting] = useState(false)
  const showToast = useToastStore(state => state.showToast)

  // 카테고리 데이터
  const categories = [
    { id: 'all', name: '전체', emoji: '✨' },
    { id: 'tech', name: '테크', emoji: '💻' },
    { id: 'fashion', name: '패션', emoji: '👗' },
    { id: 'beauty', name: '뷰티', emoji: '💄' },
    { id: 'home', name: '홈리빙', emoji: '🏠' },
    { id: 'food', name: '푸드', emoji: '🍽️' },
  ]

  // 더미 데이터 (실제로는 API에서 가져옴)
  const dummyProducts = [
    {
      id: 1,
      title: "다이슨 에어랩 멀티 스타일러 최신형",
      description: "혁신적인 코안다 효과로 열 손상 없이 스타일링이 가능한 프리미엄 헤어 스타일러",
      price: "$599",
      priceKRW: "₩780,000",
      image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800",
      category: "beauty",
      trending: true,
      discount: "-23%",
      rating: 4.8,
      reviews: 2341,
      source: "Amazon US",
      savedCount: 892,
      estimatedDelivery: "7-10일",
      tags: ["인기상품", "프리미엄", "할인중"]
    },
    {
      id: 2,
      title: "애플 비전 프로 공식 출시 버전",
      description: "공간 컴퓨팅의 새로운 시대를 여는 혁신적인 MR 헤드셋",
      price: "$3,499",
      priceKRW: "₩4,550,000",
      image: "https://images.unsplash.com/photo-1617802690658-1173a812650d?w=800",
      category: "tech",
      trending: true,
      discount: "",
      rating: 4.9,
      reviews: 521,
      source: "Apple Store",
      savedCount: 1203,
      estimatedDelivery: "14-21일",
      tags: ["신제품", "혁신", "프리미엄"]
    },
    {
      id: 3,
      title: "루이비통 2024 S/S 한정판 백팩",
      description: "파리 패션위크에서 공개된 한정판 모노그램 백팩",
      price: "$2,850",
      priceKRW: "₩3,700,000",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      category: "fashion",
      trending: false,
      discount: "",
      rating: 5.0,
      reviews: 89,
      source: "LV Official",
      savedCount: 445,
      estimatedDelivery: "10-14일",
      tags: ["한정판", "럭셔리", "컬렉션"]
    },
    {
      id: 4,
      title: "네스프레소 버츄오 넥스트 프리미엄 세트",
      description: "바리스타급 커피를 집에서 즐기는 스마트 커피머신",
      price: "$189",
      priceKRW: "₩245,000",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800",
      category: "home",
      trending: true,
      discount: "-35%",
      rating: 4.6,
      reviews: 3892,
      source: "Amazon EU",
      savedCount: 667,
      estimatedDelivery: "5-7일",
      tags: ["베스트셀러", "할인중", "인기"]
    }
  ]

  useEffect(() => {
    loadInitialData()
    
    // 실시간 알림 구독
    const unsubscribe = purchaseService.subscribeToTrendAlerts((alert) => {
      showToast(`🔥 ${alert.message}`, alert.urgency === 'high' ? 'error' : 'success')
    })
    
    return () => unsubscribe()
  }, [])

  // 초기 데이터 로드
  const loadInitialData = async () => {
    setLoading(true)
    try {
      // 실시간 시그널 가져오기
      const signalsResponse = await purchaseService.getRealtimeSignals()
      if (signalsResponse.success) {
        setTrendSignals(signalsResponse.data.signals)
      }
      
      // 더미 데이터 표시 (API 응답 시뮬레이션)
      setProducts(dummyProducts)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      setProducts(dummyProducts) // 오류 시에도 더미 데이터 표시
    } finally {
      setLoading(false)
    }
  }

  // 글로벌 트렌드 수집
  const collectGlobalTrends = async () => {
    setIsCollecting(true)
    try {
      const response = await purchaseService.collectGlobalTrends()
      if (response.success) {
        const formattedData = purchaseService.formatTrendData(response.data)
        setProducts(prevProducts => [...formattedData, ...prevProducts])
        showToast(`✅ ${response.summary.totalTrends}개의 글로벌 트렌드를 수집했습니다!`, 'success')
      }
    } catch (error) {
      console.error('트렌드 수집 실패:', error)
      showToast('트렌드 수집에 실패했습니다. 다시 시도해주세요.', 'error')
    } finally {
      setIsCollecting(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setLoading(true)
    // API 호출 시뮬레이션
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
    if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      {/* 브런치 스타일 헤더 */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-serif text-gray-900 mb-3">AI 구매대행</h1>
          <p className="text-lg text-gray-600 font-light">
            전 세계 트렌드 상품을 AI가 큐레이션하고 분석해드립니다
          </p>
        </div>
      </header>

      {/* 실시간 시그널 알림 */}
      {trendSignals.length > 0 && (
        <section className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">실시간 트렌드 시그널</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {trendSignals.map((signal, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm whitespace-nowrap">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-700">
                    <strong>{signal.source}</strong>: {signal.product || signal.hashtag} 
                    <span className="text-purple-600 font-medium ml-1">{signal.change || signal.growth}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 검색 영역 */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="찾고 싶은 상품을 검색해보세요..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              검색
            </button>
            <button
              type="button"
              onClick={collectGlobalTrends}
              disabled={isCollecting}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {isCollecting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <TrendingUp className="w-5 h-5" />
              )}
              글로벌 트렌드 수집
            </button>
          </form>

          {/* 카테고리 필터 */}
          <div className="flex items-center gap-6 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 정렬 옵션 */}
      <section className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredProducts.length}개의 상품을 찾았습니다
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="trending">인기순</option>
            <option value="price-low">낮은 가격순</option>
            <option value="price-high">높은 가격순</option>
            <option value="newest">최신순</option>
            <option value="rating">평점순</option>
          </select>
        </div>
      </section>

      {/* 상품 그리드 */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-gray-400">상품을 불러오는 중...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <article key={product.id} className="group">
                {/* 상품 이미지 */}
                <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                      {product.discount}
                    </span>
                  )}
                  {product.trending && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      트렌딩
                    </span>
                  )}
                  <button className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* 상품 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{product.source}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {product.estimatedDelivery}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-gray-900 leading-tight group-hover:text-gray-700 transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  {/* 가격 정보 */}
                  <div className="pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-gray-900">{product.priceKRW}</span>
                      <span className="text-sm text-gray-500">({product.price})</span>
                    </div>
                  </div>

                  {/* 평점 및 저장 */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                      </span>
                      <span>리뷰 {product.reviews.toLocaleString()}개</span>
                    </div>
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                      <Share2 className="w-4 h-4" />
                      공유
                    </button>
                  </div>

                  {/* 태그 */}
                  <div className="flex gap-2 pt-2">
                    {product.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-2 px-8 py-3 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors">
              더 많은 상품 보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* 하단 설명 */}
      <section className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-serif text-gray-900 mb-4">
            AI가 분석하는 글로벌 트렌드
          </h2>
          <p className="text-gray-600 leading-relaxed">
            매일 수백만 개의 상품 데이터를 AI가 분석하여 가장 트렌디하고 가치 있는 상품을 선별합니다.<br />
            실시간 환율과 배송비를 반영한 정확한 가격 정보를 제공하며, 안전한 구매대행 서비스를 지원합니다.
          </p>
        </div>
      </section>
    </div>
  )
}