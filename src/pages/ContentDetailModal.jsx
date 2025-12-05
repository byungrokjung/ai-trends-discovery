import { useState } from 'react'
import { X, Eye, Hash, Tag, Code, Copy, ExternalLink, Calendar, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ContentDetailModal({ content, isOpen, onClose, platform }) {
  const [activeTab, setActiveTab] = useState('content')
  const [copiedVector, setCopiedVector] = useState(false)

  if (!isOpen || !content) return null

  const copyVector = () => {
    const vectorString = JSON.stringify(content.embedding || [])
    navigator.clipboard.writeText(vectorString)
    setCopiedVector(true)
    setTimeout(() => setCopiedVector(false), 2000)
  }

  const formatVector = (embedding) => {
    if (!embedding) return []
    
    // embedding이 문자열인 경우 파싱 시도
    let vectorArray = embedding
    if (typeof embedding === 'string') {
      try {
        // PostgreSQL vector 형태 "[1,2,3]"를 파싱
        vectorArray = JSON.parse(embedding.replace(/^\[|\]$/g, '').split(',').map(n => parseFloat(n.trim())))
      } catch (e) {
        try {
          vectorArray = JSON.parse(embedding)
        } catch (e2) {
          console.error('Vector parsing failed:', e2)
          return []
        }
      }
    }
    
    return vectorArray.slice(0, 50) // 처음 50개만 표시
  }

  const getVectorStats = (embedding) => {
    const vector = formatVector(embedding)
    if (vector.length === 0) return null
    
    const min = Math.min(...vector)
    const max = Math.max(...vector)
    const avg = vector.reduce((sum, val) => sum + val, 0) / vector.length
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    
    return { min, max, avg, magnitude, dimension: vector.length }
  }

  const extractHashtags = (text) => {
    if (!text) return []
    const hashtags = text.match(/#[\w가-힣]+/g) || []
    return hashtags.map(tag => tag.replace('#', ''))
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-500'
      case 'tiktok': return 'from-gray-800 to-black'
      case 'product': return 'from-blue-500 to-indigo-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return '📸'
      case 'tiktok': return '🎵'
      case 'product': return '📦'
      default: return '📄'
    }
  }

  const hashtags = extractHashtags(content.caption || content.description || '')
  const vectorStats = getVectorStats(content.embedding)
  const vector = formatVector(content.embedding)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* 배경 오버레이 */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* 모달 */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* 헤더 */}
          <div className={`bg-gradient-to-r ${getPlatformColor(platform)} p-6 -m-6 mb-6 rounded-t-2xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {platform === 'product' ? content.product_name : 
                     platform === 'instagram' ? `@${content.ownerUsername}` :
                     platform === 'tiktok' ? `@${content.author_name || content.author_nickname}` : 'Unknown'}
                  </h3>
                  <p className="text-white text-opacity-80">
                    {platform === 'product' ? content.category : 
                     `${platform.toUpperCase()} 콘텐츠 상세정보`}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: 'content', name: '📝 콘텐츠', icon: Eye },
              { id: 'tags', name: '🏷️ 태그/카테고리', icon: Tag },
              { id: 'vector', name: '🧮 벡터 데이터', icon: Code },
              { id: 'stats', name: '📊 통계', icon: BarChart3 }
            ].map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              )
            })}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="max-h-96 overflow-y-auto">
            {/* 콘텐츠 탭 */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* 이미지/썸네일 */}
                {(content.displayUrl || content.video_cover_url) && (
                  <div className="flex justify-center">
                    <img 
                      src={content.displayUrl || content.video_cover_url}
                      alt="Content preview"
                      className="max-w-sm max-h-64 rounded-lg shadow-md object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                {/* 텍스트 내용 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📝 원본 내용</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {platform === 'product' ? 
                      content.why_this_product || content.description || '내용 없음' :
                      content.caption || content.description || '내용 없음'
                    }
                  </p>
                </div>

                {/* 추가 정보 */}
                {platform === 'product' && content.sales_strategy && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 판매 전략</h4>
                    <div className="text-blue-700 space-y-1">
                      <p><strong>타겟:</strong> {content.sales_strategy.target_buyer}</p>
                      <p><strong>판매기간:</strong> {content.sales_strategy.selling_period}</p>
                      <p><strong>예상 일판매:</strong> {content.sales_strategy.expected_daily_sales}</p>
                    </div>
                  </div>
                )}

                {/* 메타데이터 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500">생성일</div>
                    <div className="font-medium">
                      {content.timestamp || content.created_at ? 
                        format(new Date(content.timestamp || content.created_at), 'yyyy-MM-dd HH:mm', { locale: ko }) : 
                        '정보 없음'
                      }
                    </div>
                  </div>
                  
                  {platform !== 'product' && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">참여도</div>
                      <div className="font-medium">
                        {platform === 'instagram' ? 
                          `❤️ ${content.likesCount || 0} 💬 ${content.commentsCount || 0}` :
                          `❤️ ${content.digg_count || 0} 💬 ${content.comment_count || 0} 🔁 ${content.share_count || 0} 👁️ ${content.play_count || 0}`
                        }
                      </div>
                    </div>
                  )}
                </div>

                {/* 외부 링크 */}
                {content.url && (
                  <button
                    onClick={() => window.open(content.url, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    원본 보기
                  </button>
                )}
              </div>
            )}

            {/* 태그/카테고리 탭 */}
            {activeTab === 'tags' && (
              <div className="space-y-4">
                {/* 해시태그 */}
                {hashtags.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      해시태그 ({hashtags.length}개)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 카테고리 */}
                {platform === 'product' && content.category && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      카테고리 정보
                    </h4>
                    <div className="space-y-2">
                      <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm block w-fit">
                        {content.category}
                      </span>
                      {content.product_type && (
                        <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm block w-fit">
                          {content.product_type}
                        </span>
                      )}
                      {content.rating && (
                        <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm block w-fit">
                          {content.rating}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 키워드 밀도 분석 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">🔍 키워드 분석</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">
                      원본 텍스트를 분석하여 추출된 키워드들이 AI 벡터화에 사용됩니다.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 벡터 데이터 탭 */}
            {activeTab === 'vector' && (
              <div className="space-y-4">
                {/* 벡터 통계 */}
                {vectorStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-600">차원</div>
                      <div className="text-xl font-bold text-blue-800">{vectorStats.dimension}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-600">평균값</div>
                      <div className="text-xl font-bold text-green-800">{vectorStats.avg.toFixed(4)}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm text-purple-600">범위</div>
                      <div className="text-sm font-bold text-purple-800">
                        {vectorStats.min.toFixed(3)} ~ {vectorStats.max.toFixed(3)}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm text-orange-600">크기</div>
                      <div className="text-xl font-bold text-orange-800">{vectorStats.magnitude.toFixed(4)}</div>
                    </div>
                  </div>
                )}

                {/* 벡터 값들 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">🧮 벡터 값 (처음 50개)</h4>
                    <button
                      onClick={copyVector}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copiedVector ? '복사됨!' : '전체 복사'}
                    </button>
                  </div>
                  
                  {vector.length > 0 ? (
                    <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <div className="grid grid-cols-10 gap-2 font-mono text-xs">
                        {vector.map((value, idx) => (
                          <div 
                            key={idx} 
                            className={`text-center p-1 rounded ${
                              value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
                            }`}
                          >
                            {value.toFixed(3)}
                          </div>
                        ))}
                      </div>
                      {vectorStats && vectorStats.dimension > 50 && (
                        <div className="text-gray-400 text-center mt-3">
                          ... 및 {vectorStats.dimension - 50}개 더
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                      벡터 데이터가 없습니다
                    </div>
                  )}
                </div>

                {/* 벡터 설명 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">💡 벡터 데이터 설명</h5>
                  <div className="text-blue-700 text-sm space-y-1">
                    <p>• 이 벡터는 OpenAI의 text-embedding-3-small 모델로 생성됨</p>
                    <p>• 1536차원의 고차원 벡터로 텍스트의 의미를 수치화</p>
                    <p>• 유사한 콘텐츠들은 벡터 공간에서 가까운 위치에 배치됨</p>
                    <p>• AI 추천, 검색, 분류 시스템에서 활용됨</p>
                  </div>
                </div>
              </div>
            )}

            {/* 통계 탭 */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {platform === 'product' ? (
                  /* 상품 통계 */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">💰 가격 정보</h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm text-green-600">판매가</div>
                        <div className="text-2xl font-bold text-green-800">₩{(content.selling_price || 0).toLocaleString()}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-600">순이익</div>
                        <div className="text-2xl font-bold text-blue-800">₩{(content.net_profit || 0).toLocaleString()}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm text-purple-600">순 마진율</div>
                        <div className="text-2xl font-bold text-purple-800">{(content.net_margin_rate || 0).toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">📊 분석 점수</h4>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-sm text-red-600">밸런스 점수</div>
                        <div className="text-2xl font-bold text-red-800">{content.balance_score || 0}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm text-yellow-600">트렌드 점수</div>
                        <div className="text-2xl font-bold text-yellow-800">{content.trend_score || 0}</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-sm text-indigo-600">마진 점수</div>
                        <div className="text-2xl font-bold text-indigo-800">{content.margin_score || 0}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 소셜미디어 통계 */
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl">❤️</div>
                      <div className="text-sm text-red-600">좋아요</div>
                      <div className="text-2xl font-bold text-red-800">
                        {(content.likesCount || content.digg_count || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl">💬</div>
                      <div className="text-sm text-blue-600">댓글</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {(content.commentsCount || content.comment_count || 0).toLocaleString()}
                      </div>
                    </div>
                    
                    {platform === 'tiktok' && (
                      <>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl">🔁</div>
                          <div className="text-sm text-green-600">공유</div>
                          <div className="text-2xl font-bold text-green-800">
                            {(content.share_count || 0).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl">👁️</div>
                          <div className="text-sm text-purple-600">조회수</div>
                          <div className="text-2xl font-bold text-purple-800">
                            {(content.play_count || 0).toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 시간 정보 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    시간 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">생성일:</span>
                      <span className="ml-2 font-medium">
                        {content.timestamp || content.created_at ? 
                          format(new Date(content.timestamp || content.created_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko }) : 
                          '정보 없음'
                        }
                      </span>
                    </div>
                    {content.updated_at && (
                      <div>
                        <span className="text-gray-600">수정일:</span>
                        <span className="ml-2 font-medium">
                          {format(new Date(content.updated_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}