import { useState } from 'react'
import { 
  X, TrendingUp, Users, MessageSquare, Heart, Hash, 
  ExternalLink, Star, AlertCircle, BarChart3, Eye,
  ChevronRight, Database, Brain, Target, Play
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ProductDetailModal({ product, isOpen, onClose, relatedContent = [] }) {
  const [activeTab, setActiveTab] = useState('analysis')
  const [hoveredContent, setHoveredContent] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  if (!isOpen || !product) return null

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handleMouseEnter = (content, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top - 50
    })
    setHoveredContent(content)
  }

  const handleMouseLeave = (event) => {
    // 모달 영역으로 이동하는지 체크
    const rect = event.currentTarget.getBoundingClientRect()
    const modalRect = {
      left: rect.right + 10,
      right: rect.right + 410, // 모달 너비 400px + 여유
      top: rect.top - 50,
      bottom: rect.top + 250 // 모달 높이 예상
    }
    
    // 짧은 딜레이 후에 마우스 위치 체크
    setTimeout(() => {
      const mouseX = event.clientX
      const mouseY = event.clientY
      
      // 마우스가 모달 영역에 없으면 모달 숨기기
      if (mouseX < modalRect.left || mouseX > modalRect.right || 
          mouseY < modalRect.top || mouseY > modalRect.bottom) {
        setHoveredContent(null)
      }
    }, 100)
  }

  const handleModalMouseEnter = () => {
    // 모달에 마우스가 들어오면 유지
  }

  const handleModalMouseLeave = () => {
    // 모달에서 마우스가 나가면 숨기기
    setHoveredContent(null)
  }

  const tabs = [
    { id: 'analysis', name: 'AI 분석 근거', icon: Brain },
    { id: 'data', name: '실제 데이터', icon: Database },
    { id: 'market', name: '시장 분석', icon: Target }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="relative p-8 pb-6 bg-gradient-to-br from-orange-50 to-amber-50">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
          
          <div className="pr-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"></div>
              <span className="text-sm text-stone-600 font-medium">{product.category}</span>
            </div>
            
            <h1 className="text-3xl font-medium text-stone-800 mb-4 leading-tight">
              {product.productName}
            </h1>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">{product.aiScore}</div>
                <div className="text-sm text-stone-500">AI 점수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-emerald-600">{product.expectedMargin}%</div>
                <div className="text-sm text-stone-500">예상 수익률</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-stone-700">₩{product.expectedPrice?.toLocaleString()}</div>
                <div className="text-sm text-stone-500">예상 판매가</div>
              </div>
            </div>

            {/* 키워드 태그들 */}
            <div className="flex flex-wrap gap-2">
              {product.keywords?.map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-stone-200">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                    : 'text-stone-600 hover:text-stone-800'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-8 overflow-y-auto max-h-96">
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  AI가 이 상품을 추천한 이유
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">벡터 유사도 분석</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        {product.relatedPosts}개의 소셜미디어 포스트에서 유사한 문제 표현을 발견했습니다. 
                        사용자들이 "{product.keywords?.[0]}" 관련 고민을 자주 언급하고 있어요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">참여도 패턴</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        관련 콘텐츠들의 평균 참여도가 {formatNumber(product.avgEngagement)}으로, 
                        이는 실제 니즈가 있음을 나타냅니다.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-800 mb-1">시장 기회</h4>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        "{product.targetCustomer}"라는 명확한 타겟이 존재하며, 
                        중국 직구로 {product.expectedMargin}% 수익률이 예상됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 근거 데이터 */}
              <div className="bg-stone-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">분석 근거 데이터</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-stone-600">트렌드 점수</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{product.trendScore}/100</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-stone-600">관심도</span>
                    </div>
                    <div className="text-2xl font-bold text-stone-800">{product.interestLevel}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* 실제 DB 콘텐츠 이미지들 */}
              {product.relatedContent && product.relatedContent.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" />
                    실제 DB 콘텐츠 & 이미지
                  </h3>
                  
                  <div className="text-sm text-stone-600 mb-6">
                    이 상품 추천의 기반이 된 실제 소셜미디어 콘텐츠들입니다.
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                    {product.relatedContent.map((content, idx) => (
                      <div 
                        key={idx} 
                        className="group bg-white/80 rounded-xl p-4 border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer relative"
                        onMouseEnter={(e) => handleMouseEnter(content, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="flex gap-4">
                          {/* 이미지 */}
                          {content.imageUrl && (
                            <div className="flex-shrink-0">
                              <img 
                                src={content.imageUrl} 
                                alt={`${content.platform} content`}
                                className="w-16 h-16 rounded-lg object-cover border border-stone-200"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          
                          {/* 콘텐츠 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${
                                content.platform === 'instagram' ? 'bg-gradient-to-r from-pink-400 to-purple-400' :
                                content.platform === 'tiktok' ? 'bg-black' :
                                'bg-blue-400'
                              }`}></div>
                              <span className="text-xs text-stone-500 font-medium capitalize">{content.platform}</span>
                              {content.timestamp && (
                                <span className="text-xs text-stone-400">
                                  {format(new Date(content.timestamp), 'MM/dd', { locale: ko })}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-sm font-medium text-stone-800 mb-1 truncate">
                              @{content.title}
                            </div>
                            
                            <div className="text-xs text-stone-600 mb-2 line-clamp-2">
                              {content.description?.substring(0, 100)}...
                            </div>
                            
                            {/* 참여도 */}
                            <div className="flex items-center gap-3 text-xs text-stone-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-red-400" />
                                {formatNumber(content.likes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-blue-400" />
                                {formatNumber(content.comments)}
                              </span>
                              {content.views && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-purple-400" />
                                  {formatNumber(content.views)}
                                </span>
                              )}
                            </div>
                            
                            {/* 해시태그들 */}
                            {content.hashtags && content.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {content.hashtags.slice(0, 3).map((tag, tagIdx) => (
                                  <span 
                                    key={tagIdx} 
                                    className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 호버 아이콘 */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {content.url ? (
                            <div className="p-1 bg-emerald-500 text-white rounded-full">
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="p-1 bg-gray-400 text-white rounded-full">
                              <Eye className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO용 해시태그 & 키워드 분석 */}
              <div className="bg-purple-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-600" />
                  SEO 키워드 & 해시태그 분석
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 추천 키워드 */}
                  <div>
                    <h4 className="font-medium text-stone-800 mb-3">추천 키워드</h4>
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {product.keywords?.map((keyword, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {product.productName.split(' ')[0]}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          중국직구
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          해외직구
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 실제 해시태그 */}
                  <div>
                    <h4 className="font-medium text-stone-800 mb-3">실제 사용된 해시태그</h4>
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        {product.relatedContent?.flatMap(content => content.hashtags || [])
                          .filter((tag, idx, arr) => arr.indexOf(tag) === idx) // 중복 제거
                          .slice(0, 10)
                          .map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              #{tag}
                            </span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 마케팅 제안 */}
                <div className="mt-4 p-4 bg-white/50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-stone-800 mb-2">마케팅 제안</h4>
                  <div className="text-sm text-stone-600 space-y-1">
                    <div>• 블로그 제목: "{product.keywords?.[0]} 해결! {product.productName} 중국직구 후기"</div>
                    <div>• 유튜브 키워드: "{product.keywords?.[0]}, 중국직구, 해외쇼핑, {product.productName}"</div>
                    <div>• 인스타그램 해시태그: #{product.keywords?.[0]} #중국직구 #해외쇼핑 #직구추천</div>
                  </div>
                </div>
              </div>

              {/* 실제 언급된 상품들 */}
              {product.actualProducts && product.actualProducts.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4">실제 언급된 상품들</h3>
                  <div className="space-y-3">
                    {product.actualProducts.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-stone-800">{item.product}</div>
                          <div className="text-sm text-stone-500">{item.category} 카테고리</div>
                        </div>
                        <div className="text-sm text-amber-600 font-medium">
                          {item.count}번 언급
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 플랫폼별 분포 */}
              <div className="bg-stone-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">플랫폼별 언급</h3>
                <div className="flex gap-4">
                  {product.platforms?.map((platform, idx) => (
                    <div key={idx} className="bg-white rounded-lg px-4 py-3 flex items-center gap-2">
                      {platform === 'instagram' && <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded"></div>}
                      {platform === 'tiktok' && <div className="w-3 h-3 bg-black rounded"></div>}
                      <span className="text-sm font-medium text-stone-700 capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  시장 분석 및 수익성
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4">
                      <h4 className="font-medium text-stone-800 mb-2">가격 분석</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-600">중국 도매가</span>
                          <span className="font-medium">₩{product.chinaPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">예상 판매가</span>
                          <span className="font-medium">₩{product.expectedPrice?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-stone-800 font-medium">예상 수익</span>
                          <span className="font-bold text-emerald-600">
                            ₩{(product.expectedPrice - product.chinaPrice)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/70 rounded-lg p-4">
                      <h4 className="font-medium text-stone-800 mb-2">리스크 평가</h4>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          product.riskLevel === '낮음' ? 'bg-green-500' :
                          product.riskLevel === '보통' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm text-stone-700">{product.riskLevel} 리스크</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4">
                      <h4 className="font-medium text-stone-800 mb-2">타겟 고객</h4>
                      <p className="text-sm text-stone-600">{product.targetCustomer}</p>
                    </div>
                    
                    <div className="bg-white/70 rounded-lg p-4">
                      <h4 className="font-medium text-stone-800 mb-2">시장 진입 전략</h4>
                      <div className="text-sm text-stone-600 space-y-1">
                        <div>• 소셜미디어 마케팅 집중</div>
                        <div>• 문제 해결형 콘텐츠 제작</div>
                        <div>• 타겟 키워드: {product.keywords?.join(', ')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="p-6 bg-stone-50 border-t border-stone-200">
          <div className="flex gap-3">
            <button
              onClick={() => {
                const searchQuery = encodeURIComponent(product.productName)
                window.open(`https://www.taobao.com/list/item-htm/${searchQuery}.htm`, '_blank')
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl transition-all duration-300 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              타오바오에서 찾기
            </button>
            <button
              onClick={() => {
                const searchQuery = encodeURIComponent(product.productName + ' wholesale')
                window.open(`https://www.alibaba.com/trade/search?SearchText=${searchQuery}`, '_blank')
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl transition-all duration-300 font-medium"
            >
              <Star className="w-4 h-4" />
              알리바바 도매
            </button>
          </div>
        </div>
      </div>

      {/* 호버 시 표시되는 링크 미리보기 모달 */}
      {hoveredContent && (
        <div 
          className="fixed z-[60]"
          style={{
            left: `${Math.min(hoverPosition.x, window.innerWidth - 500)}px`,
            top: `${Math.min(hoverPosition.y, window.innerHeight - 400)}px`,
          }}
          onMouseEnter={handleModalMouseEnter}
          onMouseLeave={handleModalMouseLeave}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 p-6 w-96 animate-in fade-in duration-200">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  hoveredContent.platform === 'instagram' ? 'bg-gradient-to-r from-pink-400 to-purple-400' :
                  hoveredContent.platform === 'tiktok' ? 'bg-black' :
                  'bg-blue-400'
                }`}></div>
                <span className="text-base font-semibold text-stone-700 capitalize">
                  {hoveredContent.platform}
                </span>
              </div>
              {hoveredContent.timestamp && (
                <span className="text-sm text-stone-500">
                  {format(new Date(hoveredContent.timestamp), 'yyyy.MM.dd HH:mm', { locale: ko })}
                </span>
              )}
            </div>

            {/* 이미지 미리보기 */}
            {hoveredContent.imageUrl && (
              <div className="mb-4">
                <img 
                  src={hoveredContent.imageUrl} 
                  alt={`${hoveredContent.platform} content`}
                  className="w-full h-32 object-cover rounded-lg border border-stone-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* 콘텐츠 정보 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-stone-800 text-base mb-2">
                  @{hoveredContent.title}
                </h4>
                <div className="text-sm text-stone-600 leading-relaxed max-h-20 overflow-y-auto">
                  {hoveredContent.description ? (
                    hoveredContent.description.length > 200 
                      ? hoveredContent.description.substring(0, 200) + '...'
                      : hoveredContent.description
                  ) : '설명이 없습니다.'}
                </div>
              </div>

              {/* 해시태그 */}
              {hoveredContent.hashtags && hoveredContent.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hoveredContent.hashtags.slice(0, 5).map((tag, tagIdx) => (
                    <span 
                      key={tagIdx} 
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 참여도 정보 */}
              <div className="flex items-center justify-between py-3 border-y border-stone-100">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2 text-sm text-stone-600">
                    <Heart className="w-4 h-4 text-red-400" />
                    {formatNumber(hoveredContent.likes)} 좋아요
                  </span>
                  <span className="flex items-center gap-2 text-sm text-stone-600">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    {formatNumber(hoveredContent.comments)} 댓글
                  </span>
                  {hoveredContent.views && (
                    <span className="flex items-center gap-2 text-sm text-stone-600">
                      <Eye className="w-4 h-4 text-purple-400" />
                      {formatNumber(hoveredContent.views)} 조회
                    </span>
                  )}
                </div>
              </div>

              {/* 링크 정보 */}
              {hoveredContent.url ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-stone-700">원본 링크</div>
                  <div 
                    className="text-sm bg-stone-50 p-3 rounded-lg border cursor-pointer hover:bg-stone-100 transition-colors group"
                    onClick={() => window.open(hoveredContent.url, '_blank')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-stone-600 break-all flex-1 mr-3">
                        {hoveredContent.url.length > 50 
                          ? hoveredContent.url.substring(0, 50) + '...'
                          : hoveredContent.url
                        }
                      </div>
                      <ExternalLink className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600" />
                    </div>
                  </div>
                  <div className="text-xs text-emerald-600 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>클릭하여 원본 콘텐츠 보기</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-stone-400 text-sm">원본 링크가 없습니다</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}