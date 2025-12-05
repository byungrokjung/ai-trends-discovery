import { useState, useEffect } from 'react'
import { 
  Instagram, MessageSquare, Package, Filter, Search, Calendar, 
  Heart, MessageCircle, Eye, Hash, Users, TrendingUp, ExternalLink,
  ChevronUp, ChevronDown, RefreshCw, Download, MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import ContentDetailModal from './ContentDetailModal'

export default function ContentTablePage() {
  const [allContent, setAllContent] = useState([])
  const [filteredContent, setFilteredContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortField, setSortField] = useState('engagement')
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50)
  const [selectedContent, setSelectedContent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadAllContent()
  }, [])

  useEffect(() => {
    filterAndSortContent()
  }, [allContent, activeFilter, sortField, sortOrder, searchQuery])

  const loadAllContent = async () => {
    setLoading(true)
    try {
      const [instagramResponse, productResponse, tiktokResponse] = await Promise.all([
        fetch(`${API_BASE}/api/instagram/posts?limit=10000`),
        fetch(`${API_BASE}/api/product-analysis/products`),
        fetch(`${API_BASE}/api/tiktok/contents?limit=10000`)
      ])

      const [instagramData, productData, tiktokData] = await Promise.all([
        instagramResponse.json(),
        productResponse.json(),
        tiktokResponse.json()
      ])

      let combinedContent = []

      // Instagram 데이터 변환
      if (instagramData.success && instagramData.data) {
        const instagramContent = instagramData.data.map(item => ({
          id: `instagram_${item.pk || item.id}`,
          platform: 'instagram',
          title: item.ownerUsername || item.username || 'Unknown User',
          description: item.caption || '',
          engagement: (item.likesCount || 0) + (item.commentsCount || 0),
          likes: item.likesCount || 0,
          comments: item.commentsCount || 0,
          timestamp: item.timestamp,
          hashtags: extractHashtags(item.caption),
          url: item.url,
          imageUrl: item.displayUrl,
          type: item.type || 'Image',
          category: 'Social Media'
        }))
        combinedContent = [...combinedContent, ...instagramContent]
      }

      // 상품 분석 데이터 변환 (실제 DB 필드명 사용)
      if (productData.success && productData.data) {
        const productContent = productData.data.map(item => ({
          id: `product_${item.id}`,
          platform: 'product',
          title: item.product_name || 'Unknown Product',
          description: item.why_this_product || item.sales_strategy?.target_buyer || '',
          engagement: item.balance_score || (item.rating === '🔥 골든템' ? 90 : 50),
          likes: item.trend_score || 0,
          comments: 0, // 상품분석에는 댓글 개념이 없음
          timestamp: item.created_at,
          hashtags: [item.category, item.product_type].filter(Boolean),
          price: item.selling_price || 0,
          category: item.category,
          rating: item.rating,
          type: 'Product'
        }))
        combinedContent = [...combinedContent, ...productContent]
      }

      // TikTok 데이터 변환 (실제 DB 필드명 사용)
      if (tiktokData.success && tiktokData.data) {
        const tiktokContent = tiktokData.data.map(item => ({
          id: `tiktok_${item.id}`,
          platform: 'tiktok',
          title: item.author_name || item.author_nickname || 'Unknown User',
          description: item.description || '',
          engagement: (item.digg_count || 0) + (item.comment_count || 0) + (item.share_count || 0),
          likes: item.digg_count || 0,
          comments: item.comment_count || 0,
          shares: item.share_count || 0,
          timestamp: item.created_at,
          hashtags: extractHashtags(item.description),
          url: item.video_url,
          imageUrl: item.video_cover_url,
          type: 'Video',
          category: 'Social Media',
          views: item.play_count || 0
        }))
        combinedContent = [...combinedContent, ...tiktokContent]
      }

      setAllContent(combinedContent)
      console.log('🔥 로드된 전체 콘텐츠:', combinedContent.length, '개')
      console.log('📊 플랫폼별 분포:')
      console.log('  📸 Instagram:', instagramData.data?.length || 0, '개')
      console.log('  🎵 TikTok:', tiktokData.data?.length || 0, '개')
      console.log('  📦 상품분석:', productData.data?.length || 0, '개')
      
    } catch (error) {
      console.error('콘텐츠 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractHashtags = (text) => {
    if (!text) return []
    const hashtags = text.match(/#[\w가-힣]+/g) || []
    return hashtags.map(tag => tag.replace('#', '')).slice(0, 3)
  }

  const filterAndSortContent = () => {
    let filtered = [...allContent]

    // 플랫폼 필터링
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => item.platform === activeFilter)
    }

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.hashtags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'engagement':
          aVal = a.engagement || 0
          bVal = b.engagement || 0
          break
        case 'timestamp':
          aVal = new Date(a.timestamp || 0)
          bVal = new Date(b.timestamp || 0)
          break
        case 'likes':
          aVal = a.likes || 0
          bVal = b.likes || 0
          break
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'platform':
          aVal = a.platform
          bVal = b.platform
          break
        default:
          aVal = a.engagement || 0
          bVal = b.engagement || 0
      }

      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })

    setFilteredContent(filtered)
    setCurrentPage(1) // 필터 변경시 첫 페이지로 이동
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPlatformBadge = (platform) => {
    const configs = {
      instagram: { 
        icon: Instagram, 
        name: '📸 Instagram', 
        bgColor: 'bg-gradient-to-r from-pink-500 to-purple-500',
        textColor: 'text-white'
      },
      tiktok: { 
        icon: MessageSquare, 
        name: '🎵 TikTok', 
        bgColor: 'bg-gradient-to-r from-black to-gray-800',
        textColor: 'text-white'
      },
      product: { 
        icon: Package, 
        name: '📦 상품분석', 
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        textColor: 'text-white'
      }
    }
    
    const config = configs[platform] || configs.instagram
    const IconComponent = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <IconComponent className="w-3 h-3" />
        {config.name}
      </span>
    )
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return null
    return sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentContent = filteredContent.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 콘텐츠 데이터 관리</h1>
              <p className="text-gray-600 mt-1">Instagram, 상품분석, TikTok 통합 데이터 리스트</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 상세보기 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/instagram-detail'}
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                >
                  📸 Instagram 전체
                </button>
                <button
                  onClick={() => window.location.href = '/tiktok-detail'}
                  className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  🎵 TikTok 전체
                </button>
                <button
                  onClick={() => window.location.href = '/product-detail'}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  📦 상품 전체
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open('/instagram-export.csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                
                <button
                  onClick={loadAllContent}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="flex items-center gap-4 mb-4">
            {/* 플랫폼 필터 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'all', name: '🌐 전체', count: allContent.length },
                { id: 'instagram', name: '📸 Instagram', count: allContent.filter(c => c.platform === 'instagram').length },
                { id: 'tiktok', name: '🎵 TikTok', count: allContent.filter(c => c.platform === 'tiktok').length },
                { id: 'product', name: '📦 상품분석', count: allContent.filter(c => c.platform === 'product').length }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {filter.name} ({filter.count})
                </button>
              ))}
            </div>

            {/* 검색 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 내용, 해시태그로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 결과 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>총 {filteredContent.length}개 콘텐츠</span>
            <span>페이지 {currentPage} / {totalPages}</span>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('platform')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      플랫폼 {getSortIcon('platform')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">ID</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('title')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      제목/계정명 {getSortIcon('title')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">콘텐츠 내용</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">카테고리/태그</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('likes')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      👍 {getSortIcon('likes')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('comments')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      💬 {getSortIcon('comments')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('engagement')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      🔥 참여도 {getSortIcon('engagement')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">
                    <button 
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      📅 날짜 {getSortIcon('timestamp')}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">가격/링크</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">상태</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-900 text-xs">상세보기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {currentContent.map((item, index) => {
                  const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const contentId = item.id.replace(/^(instagram_|product_|tiktok_)/, '');
                  
                  return (
                    <tr key={item.id} className="hover:bg-blue-50 transition-colors border-b">
                      {/* 플랫폼 */}
                      <td className="px-3 py-2">
                        {getPlatformBadge(item.platform)}
                      </td>
                      
                      {/* ID */}
                      <td className="px-3 py-2">
                        <div className="font-mono text-gray-500 text-xs">
                          #{rowIndex}
                        </div>
                        <div className="font-mono text-gray-400 text-xs truncate max-w-20">
                          {contentId.slice(-8)}
                        </div>
                      </td>
                      
                      {/* 제목/계정명 */}
                      <td className="px-3 py-2">
                        <div className="font-semibold text-gray-900 max-w-32 truncate">
                          {item.title}
                        </div>
                        {item.platform === 'instagram' && (
                          <div className="text-xs text-gray-500">📸 @{item.title}</div>
                        )}
                        {item.platform === 'tiktok' && (
                          <div className="text-xs text-gray-500">🎵 @{item.title}</div>
                        )}
                        {item.platform === 'product' && item.category && (
                          <div className="text-xs text-gray-500">📦 {item.category}</div>
                        )}
                      </td>
                      
                      {/* 콘텐츠 내용 */}
                      <td className="px-3 py-2">
                        <div className="text-gray-700 max-w-64 line-clamp-2 text-xs leading-tight">
                          {item.description?.length > 100 
                            ? item.description.substring(0, 100) + '...' 
                            : item.description || '-'
                          }
                        </div>
                      </td>
                      
                      {/* 카테고리/태그 */}
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {item.hashtags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {item.category && (
                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* 좋아요 */}
                      <td className="px-3 py-2 text-center">
                        <div className="font-medium text-red-600">
                          {formatNumber(item.likes)}
                        </div>
                      </td>
                      
                      {/* 댓글 */}
                      <td className="px-3 py-2 text-center">
                        <div className="font-medium text-blue-600">
                          {formatNumber(item.comments)}
                        </div>
                        {item.platform === 'tiktok' && item.shares && (
                          <div className="text-xs text-gray-500">
                            🔁 {formatNumber(item.shares)}
                          </div>
                        )}
                      </td>
                      
                      {/* 참여도 */}
                      <td className="px-3 py-2 text-center">
                        <div className="font-bold text-purple-600">
                          {formatNumber(item.engagement)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-purple-600 h-1 rounded-full" 
                            style={{
                              width: `${Math.min((item.engagement / Math.max(...currentContent.map(c => c.engagement || 0))) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </td>
                      
                      {/* 날짜 */}
                      <td className="px-3 py-2">
                        {item.timestamp ? (
                          <div>
                            <div className="text-gray-700 font-medium">
                              {format(new Date(item.timestamp), 'MM/dd')}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(item.timestamp), 'HH:mm')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                      
                      {/* 가격/링크 */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {item.price && (
                            <div className="text-green-600 font-bold text-xs">
                              ₩{formatNumber(item.price)}
                            </div>
                          )}
                          {item.url && (
                            <button
                              onClick={() => window.open(item.url, '_blank')}
                              className="text-blue-500 hover:text-blue-700 text-xs underline"
                              title="원본 보기"
                            >
                              링크
                            </button>
                          )}
                          {!item.price && !item.url && (
                            <div className="text-gray-400">-</div>
                          )}
                        </div>
                      </td>
                      
                      {/* 상태 */}
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          {item.platform === 'instagram' && (
                            <span className="px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded text-xs">
                              📸 활성
                            </span>
                          )}
                          {item.platform === 'tiktok' && (
                            <span className="px-1.5 py-0.5 bg-black text-white rounded text-xs">
                              🎵 비디오
                            </span>
                          )}
                          {item.platform === 'product' && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              📦 분석됨
                            </span>
                          )}
                          {item.rating && (
                            <div className="text-yellow-600 text-xs">
                              ⭐ {item.rating.toFixed(1)}
                            </div>
                          )}
                          {item.platform === 'tiktok' && item.views && (
                            <div className="text-purple-600 text-xs">
                              👁️ {formatNumber(item.views)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* 상세보기 */}
                      <td className="px-3 py-2">
                        <button
                          onClick={() => {
                            setSelectedContent(item)
                            setModalOpen(true)
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="상세정보 보기"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {[...Array(totalPages)].map((_, i) => i + 1).filter(page => 
              page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
            ).map((page, idx, arr) => (
              <div key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      <ContentDetailModal
        content={selectedContent}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedContent(null)
        }}
        platform={selectedContent?.platform}
      />
    </div>
  )
}