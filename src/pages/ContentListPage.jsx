import { useState, useEffect } from 'react'
import { 
  Instagram, MessageSquare, Package, Filter, Search, Calendar, 
  Heart, MessageCircle, Eye, Hash, Users, TrendingUp, ExternalLink,
  PlayCircle, Image, MoreHorizontal, Star, Clock, Target, Grid3X3,
  List, ChevronDown, SortAsc, SortDesc, RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ContentListPage() {
  const [allContent, setAllContent] = useState([])
  const [filteredContent, setFilteredContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [sortBy, setSortBy] = useState('engagement')
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadAllContent()
  }, [])

  useEffect(() => {
    filterAndSortContent()
  }, [allContent, activeFilter, sortBy, sortOrder, searchQuery])

  const loadAllContent = async () => {
    setLoading(true)
    try {
      const [instagramResponse, productResponse] = await Promise.all([
        fetch(`${API_BASE}/api/instagram/posts?limit=50`),
        fetch(`${API_BASE}/api/product-analysis/products`)
      ])

      const [instagramData, productData] = await Promise.all([
        instagramResponse.json(),
        productResponse.json()
      ])

      console.log('Instagram 데이터:', instagramData)
      console.log('상품 데이터:', productData)

      let combinedContent = []

      // Instagram 데이터 변환
      if (instagramData.success && instagramData.data) {
        const instagramContent = instagramData.data.map(item => ({
          id: `instagram_${item.pk || item.id}`,
          platform: 'instagram',
          title: item.ownerUsername || item.username || 'Unknown User',
          description: item.caption || '',
          engagement: (item.likesCount || item.like_count || 0) + (item.commentsCount || item.comment_count || 0),
          likes: item.likesCount || item.like_count || 0,
          comments: item.commentsCount || item.comment_count || 0,
          timestamp: item.timestamp || item.created_at,
          imageUrl: item.displayUrl,
          type: item.type || 'Image',
          hashtags: extractHashtags(item.caption),
          url: item.url
        }))
        combinedContent = [...combinedContent, ...instagramContent]
      }

      // 상품 분석 데이터 변환
      if (productData.success && productData.data) {
        const productContent = productData.data.map(item => ({
          id: `product_${item.id}`,
          platform: 'product',
          title: item.product_name || item.name,
          description: item.description || item.category || '',
          engagement: Math.floor((item.rating || 0) * 100), // 평점을 참여도로 변환
          likes: item.rating ? Math.floor(item.rating * 20) : 0,
          comments: item.review_count || 0,
          timestamp: item.created_at,
          imageUrl: item.image_url,
          type: 'Product',
          hashtags: [item.category].filter(Boolean),
          price: item.price_krw,
          category: item.category
        }))
        combinedContent = [...combinedContent, ...productContent]
      }

      // TikTok 데이터도 추가 가능하다면
      try {
        const { data: tiktokData } = await fetch(`${API_BASE}/api/instagram/posts`).then(res => res.json())
        // TikTok 데이터 처리 로직 (필요시 추가)
      } catch (e) {
        console.log('TikTok 데이터 로드 실패 (선택사항)')
      }

      setAllContent(combinedContent)
      console.log('통합된 콘텐츠:', combinedContent.length, '개')
      
    } catch (error) {
      console.error('콘텐츠 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractHashtags = (text) => {
    if (!text) return []
    const hashtags = text.match(/#[\w가-힣]+/g) || []
    return hashtags.map(tag => tag.replace('#', '')).slice(0, 5)
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
      
      switch (sortBy) {
        case 'engagement':
          aVal = a.engagement || 0
          bVal = b.engagement || 0
          break
        case 'date':
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
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />
      case 'tiktok':
        return <MessageSquare className="w-5 h-5 text-black" />
      case 'product':
        return <Package className="w-5 h-5 text-blue-500" />
      default:
        return <Hash className="w-5 h-5 text-gray-500" />
    }
  }

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'instagram': return 'Instagram'
      case 'tiktok': return 'TikTok'
      case 'product': return '상품분석'
      default: return 'Unknown'
    }
  }

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-800'
      case 'tiktok': return 'bg-gray-100 text-gray-800'
      case 'product': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">콘텐츠 통합 리스트</h1>
              <p className="text-gray-600 mt-1">상품분석, Instagram, TikTok 데이터를 한 번에</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
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

          {/* 필터 및 검색 */}
          <div className="flex flex-wrap items-center gap-4">
            {/* 플랫폼 필터 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'all', name: '전체', count: allContent.length },
                { id: 'instagram', name: 'Instagram', count: allContent.filter(c => c.platform === 'instagram').length },
                { id: 'product', name: '상품분석', count: allContent.filter(c => c.platform === 'product').length },
                { id: 'tiktok', name: 'TikTok', count: allContent.filter(c => c.platform === 'tiktok').length }
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

            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="engagement">참여도순</option>
                <option value="date">날짜순</option>
                <option value="likes">좋아요순</option>
                <option value="title">제목순</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
              </button>
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

          {/* 결과 수 */}
          <div className="mt-4 text-sm text-gray-600">
            총 {filteredContent.length}개 콘텐츠
          </div>
        </div>
      </div>

      {/* 콘텐츠 목록 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 키워드로 검색하거나 필터를 변경해보세요.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredContent.map((item, index) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border ${
                viewMode === 'list' ? 'p-4' : 'overflow-hidden'
              }`}>
                {viewMode === 'grid' ? (
                  // 그리드 뷰
                  <>
                    {/* 이미지 영역 */}
                    {item.imageUrl && (
                      <div className="relative h-48 bg-gray-100">
                        <img 
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPlatformColor(item.platform)}`}>
                            {getPlatformIcon(item.platform)}
                            {getPlatformName(item.platform)}
                          </span>
                        </div>
                        {item.type && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full">
                              {item.type}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          #{index + 1}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {item.description}
                      </p>

                      {/* 해시태그 */}
                      {item.hashtags && item.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                              <Hash className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 참여도 정보 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            {formatNumber(item.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            {formatNumber(item.comments)}
                          </span>
                          {item.price && (
                            <span className="text-green-600 font-semibold">
                              ₩{formatNumber(item.price)}
                            </span>
                          )}
                        </div>
                        
                        {item.timestamp && (
                          <span className="text-xs text-gray-500">
                            {format(new Date(item.timestamp), 'MMM d', { locale: ko })}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  // 리스트 뷰  
                  <div className="flex items-center gap-4">
                    {/* 플랫폼 아이콘 */}
                    <div className="flex-shrink-0">
                      {getPlatformIcon(item.platform)}
                    </div>

                    {/* 썸네일 */}
                    {item.imageUrl && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}

                    {/* 콘텐츠 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getPlatformColor(item.platform)}`}>
                          {getPlatformName(item.platform)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(item.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {formatNumber(item.comments)}
                        </span>
                        {item.timestamp && (
                          <span>
                            {format(new Date(item.timestamp), 'MMM d', { locale: ko })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 참여도 점수 */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-blue-600">
                        {formatNumber(item.engagement)}
                      </div>
                      <div className="text-xs text-gray-500">
                        참여도
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}