import { useState, useEffect } from 'react'
import { 
  Instagram, Heart, MessageCircle, Hash, Calendar, 
  ExternalLink, RefreshCw, Search, SortAsc, SortDesc,
  User, Image, Video, Download, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function InstagramDetailPage() {
  const [instagramData, setInstagramData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('likesCount')
  const [sortOrder, setSortOrder] = useState('desc')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadInstagramData()
  }, [])

  useEffect(() => {
    filterAndSortData()
  }, [instagramData, searchQuery, sortField, sortOrder, typeFilter])

  const loadInstagramData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/instagram/posts?limit=1000`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setInstagramData(data.data)
        console.log('📸 Instagram 데이터 로드:', data.data.length, '개')
      }
    } catch (error) {
      console.error('Instagram 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortData = () => {
    let filtered = [...instagramData]

    // 타입 필터링
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => 
        typeFilter === 'image' ? (item.type === 'Image' || !item.type) : item.type === 'Video'
      )
    }

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.ownerUsername?.toLowerCase().includes(query) ||
        item.caption?.toLowerCase().includes(query) ||
        item.hashtags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'likesCount':
          aVal = a.likesCount || 0
          bVal = b.likesCount || 0
          break
        case 'commentsCount':
          aVal = a.commentsCount || 0
          bVal = b.commentsCount || 0
          break
        case 'engagement':
          aVal = (a.likesCount || 0) + (a.commentsCount || 0)
          bVal = (b.likesCount || 0) + (b.commentsCount || 0)
          break
        case 'timestamp':
          aVal = new Date(a.timestamp || 0)
          bVal = new Date(b.timestamp || 0)
          break
        case 'ownerUsername':
          aVal = (a.ownerUsername || '').toLowerCase()
          bVal = (b.ownerUsername || '').toLowerCase()
          break
        default:
          aVal = a.likesCount || 0
          bVal = b.likesCount || 0
      }

      if (sortOrder === 'desc') {
        return aVal < bVal ? 1 : -1
      } else {
        return aVal > bVal ? 1 : -1
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }

  const extractHashtags = (caption) => {
    if (!caption) return []
    const hashtags = caption.match(/#[\w가-힣]+/g) || []
    return hashtags.map(tag => tag.replace('#', '')).slice(0, 5)
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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
    return sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
  }

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">📸 Instagram 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Instagram className="w-8 h-8 text-pink-500" />
                📸 Instagram 상세 분석
              </h1>
              <p className="text-gray-600 mt-1">Instagram 포스트 전체 데이터 ({instagramData.length}개)</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/instagram-export.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              
              <button
                onClick={loadInstagramData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* 타입 필터 */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'all', name: '전체', icon: Instagram },
                { id: 'image', name: '이미지', icon: Image },
                { id: 'video', name: '비디오', icon: Video }
              ].map(filter => {
                const IconComponent = filter.icon
                return (
                  <button
                    key={filter.id}
                    onClick={() => setTypeFilter(filter.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      typeFilter === filter.id
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {filter.name}
                  </button>
                )
              })}
            </div>

            {/* 검색 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="계정명, 캡션, 해시태그로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 결과 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>총 {filteredData.length}개 포스트</span>
            <span>페이지 {currentPage} / {totalPages}</span>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-pink-50 to-purple-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">미리보기</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('ownerUsername')}
                      className="flex items-center gap-1 hover:text-pink-600"
                    >
                      계정명 {getSortIcon('ownerUsername')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">캡션</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">해시태그</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('likesCount')}
                      className="flex items-center gap-1 hover:text-pink-600"
                    >
                      ❤️ 좋아요 {getSortIcon('likesCount')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('commentsCount')}
                      className="flex items-center gap-1 hover:text-pink-600"
                    >
                      💬 댓글 {getSortIcon('commentsCount')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('engagement')}
                      className="flex items-center gap-1 hover:text-pink-600"
                    >
                      🔥 참여도 {getSortIcon('engagement')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-1 hover:text-pink-600"
                    >
                      📅 날짜 {getSortIcon('timestamp')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((post, index) => {
                  const hashtags = extractHashtags(post.caption)
                  const engagement = (post.likesCount || 0) + (post.commentsCount || 0)
                  
                  return (
                    <tr key={post.pk || post.id} className="hover:bg-pink-50 transition-colors">
                      {/* 미리보기 */}
                      <td className="px-4 py-3">
                        {post.displayUrl ? (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={post.displayUrl}
                              alt="Instagram post"
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      
                      {/* 계정명 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-pink-500" />
                          <div>
                            <div className="font-semibold text-gray-900">@{post.ownerUsername}</div>
                            <div className="text-xs text-gray-500">{post.ownerFullName}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* 캡션 */}
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {post.caption?.length > 100 
                              ? post.caption.substring(0, 100) + '...'
                              : post.caption || '-'
                            }
                          </p>
                        </div>
                      </td>
                      
                      {/* 해시태그 */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {hashtags.length > 3 && (
                            <span className="text-xs text-gray-500">+{hashtags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      
                      {/* 좋아요 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-red-600">
                          {formatNumber(post.likesCount)}
                        </div>
                      </td>
                      
                      {/* 댓글 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-blue-600">
                          {formatNumber(post.commentsCount)}
                        </div>
                      </td>
                      
                      {/* 참여도 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-bold text-purple-600">
                          {formatNumber(engagement)}
                        </div>
                      </td>
                      
                      {/* 날짜 */}
                      <td className="px-4 py-3">
                        {post.timestamp ? (
                          <div className="text-sm text-gray-600">
                            {format(new Date(post.timestamp), 'yyyy-MM-dd HH:mm', { locale: ko })}
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                      
                      {/* 액션 */}
                      <td className="px-4 py-3">
                        {post.url && (
                          <button
                            onClick={() => window.open(post.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-pink-600 transition-colors"
                            title="Instagram에서 보기"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            
            {[...Array(totalPages)].map((_, i) => i + 1).filter(page => 
              page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
            ).map((page, idx, arr) => (
              <div key={page}>
                {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'border-pink-500 bg-pink-50 text-pink-600'
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  )
}