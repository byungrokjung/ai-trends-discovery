import { useState, useEffect } from 'react'
import { 
  ShoppingCart, Search, Zap, TrendingUp, Instagram, MessageCircle, 
  Heart, Star, ExternalLink, Package, Filter, ArrowRight, Sparkles,
  Clock, DollarSign, Users, Target, Brain, Bot
} from 'lucide-react'

export default function AIShoppingPage() {
  const [problemQuery, setProblemQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [trendingProducts, setTrendingProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('problem-solver')

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadTrendingProducts()
  }, [])

  const loadTrendingProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/ai-shopping/trending-products?days=7&limit=15`)
      const data = await response.json()
      
      if (data.success) {
        setTrendingProducts(data.data.trending_keywords || [])
      }
    } catch (error) {
      console.error('트렌딩 상품 로드 실패:', error)
    }
  }

  const searchProblemSolution = async () => {
    if (!problemQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/ai-shopping/problem-to-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemQuery,
          platform: 'all',
          limit: 10
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('문제 해결 검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchProblemSolution()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI 구매대행
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              당신의 문제를 AI가 분석해서 <span className="font-semibold text-blue-600">실제로 도움이 되는 상품</span>을 추천해드립니다
            </p>
          </div>

          {/* 탭 메뉴 */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-2 rounded-2xl flex">
              <button
                onClick={() => setActiveTab('problem-solver')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'problem-solver' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Brain className="w-5 h-5 inline mr-2" />
                문제 해결사
              </button>
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'trending' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                트렌딩 상품
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'problem-solver' && (
          <>
            {/* 검색 영역 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  어떤 문제로 고민하고 계신가요? 🤔
                </h2>
                <p className="text-gray-600">
                  AI가 실제 사용자 후기를 분석해서 해결책을 찾아드려요
                </p>
              </div>

              <div className="relative max-w-3xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    value={problemQuery}
                    onChange={(e) => setProblemQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="예: 자취방 냄새 때문에 고민이에요, 옷에서 쉰내가 나요..."
                    className="w-full pl-14 pr-32 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={searchProblemSolution}
                    disabled={loading || !problemQuery.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        AI 분석
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 예시 버튼들 */}
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {[
                  '세탁조 냄새 제거',
                  '옷 쉰내 해결',
                  '자취방 습도 조절',
                  '신발 냄새 제거',
                  '머리카락 관리'
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setProblemQuery(example)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* 검색 결과 */}
            {searchResults && (
              <div className="space-y-8">
                {/* AI 추천 상품 */}
                {searchResults.recommendations?.products && (
                  <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">AI 추천 상품</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.recommendations.products.map((product, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800 mb-1">{product.name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {product.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                            {product.why_helpful}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-green-600 font-semibold">{product.price_range}</span>
                            <span className="text-xs text-gray-500">{product.buy_from}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {searchResults.recommendations.summary && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-gray-700">{searchResults.recommendations.summary}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 관련 소셜 미디어 포스트 */}
                {searchResults.matched_content && searchResults.matched_content.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">실제 사용자 후기</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {searchResults.matched_content.slice(0, 4).map((content, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${content.platform === 'instagram' ? 'bg-pink-500' : 'bg-black'}`}>
                              {content.platform === 'instagram' ? 
                                <Instagram className="w-5 h-5 text-white" /> : 
                                <MessageCircle className="w-5 h-5 text-white" />
                              }
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 capitalize">{content.platform}</span>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {content.engagement || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                            {content.caption || content.description || '내용 없음'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'trending' && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">지금 핫한 키워드</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trendingProducts.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 text-center hover:shadow-lg transition-all cursor-pointer border border-orange-200">
                  <div className="font-bold text-gray-800 mb-2">#{item.keyword}</div>
                  <div className="text-sm text-gray-600 mb-1">참여도</div>
                  <div className="text-lg font-semibold text-orange-600">
                    {item.score ? Math.floor(item.score).toLocaleString() : 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 서비스 소개 */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">왜 AI 구매대행인가요?</h2>
            <p className="text-xl mb-8 opacity-90">
              트렌드를 따라가는 것이 아닌, 실제 문제를 해결하는 상품을 찾아드립니다
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">문제 중심 접근</h3>
                <p className="opacity-90 text-sm">실제 사용자들이 겪는 문제를 데이터로 분석</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">AI 기반 매칭</h3>
                <p className="opacity-90 text-sm">벡터 검색으로 정확한 상품 추천</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2">해외직구 최적화</h3>
                <p className="opacity-90 text-sm">국내보다 저렴한 해외 대안 상품 발굴</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}