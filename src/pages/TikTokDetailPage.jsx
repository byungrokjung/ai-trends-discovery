import { useState, useEffect } from 'react'
import { 
  Play, Heart, MessageCircle, Share, Eye, Hash, Calendar, 
  ExternalLink, RefreshCw, Search, SortAsc, SortDesc,
  User, Music, Download, Filter, Video
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function TikTokDetailPage() {
  const [tiktokData, setTikTokData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('digg_count')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadTikTokData()
  }, [])

  useEffect(() => {
    filterAndSortData()
  }, [tiktokData, searchQuery, sortField, sortOrder])

  const loadTikTokData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/tiktok/contents?limit=1000`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setTikTokData(data.data)
        console.log('🎵 TikTok 데이터 로드:', data.data.length, '개')
      }
    } catch (error) {
      console.error('TikTok 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortData = () => {
    let filtered = [...tiktokData]

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.author_name?.toLowerCase().includes(query) ||
        item.author_nickname?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'digg_count':
          aVal = a.digg_count || 0
          bVal = b.digg_count || 0
          break
        case 'comment_count':
          aVal = a.comment_count || 0
          bVal = b.comment_count || 0
          break
        case 'share_count':
          aVal = a.share_count || 0
          bVal = b.share_count || 0
          break
        case 'play_count':
          aVal = a.play_count || 0
          bVal = b.play_count || 0
          break
        case 'engagement':
          aVal = (a.digg_count || 0) + (a.comment_count || 0) + (a.share_count || 0)
          bVal = (b.digg_count || 0) + (b.comment_count || 0) + (b.share_count || 0)
          break
        case 'created_at':
          aVal = new Date(a.created_at || 0)
          bVal = new Date(b.created_at || 0)
          break
        case 'author_name':
          aVal = (a.author_name || a.author_nickname || '').toLowerCase()
          bVal = (b.author_name || b.author_nickname || '').toLowerCase()
          break
        default:
          aVal = a.digg_count || 0
          bVal = b.digg_count || 0
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

  const extractHashtags = (description) => {
    if (!description) return []
    const hashtags = description.match(/#[\w가-힣]+/g) || []
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
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">🎵 TikTok 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* 헤더 */}
      <div className="bg-black shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Play className="w-8 h-8 text-white" />
                🎵 TikTok 상세 분석
              </h1>
              <p className="text-gray-300 mt-1">TikTok 비디오 전체 데이터 ({tiktokData.length}개)</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/tiktok-export.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              
              <button
                onClick={loadTikTokData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>

          {/* 검색 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작성자명, 설명으로 검색..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* 결과 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>총 {filteredData.length}개 비디오</span>
            <span>페이지 {currentPage} / {totalPages}</span>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">썸네일</th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('author_name')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      작성자 {getSortIcon('author_name')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">설명</th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">해시태그</th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('digg_count')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      ❤️ 좋아요 {getSortIcon('digg_count')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('comment_count')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      💬 댓글 {getSortIcon('comment_count')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('share_count')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      🔁 공유 {getSortIcon('share_count')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('play_count')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      👁️ 조회 {getSortIcon('play_count')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">
                    <button 
                      onClick={() => handleSort('engagement')}
                      className="flex items-center gap-1 hover:text-gray-300"
                    >
                      🔥 참여도 {getSortIcon('engagement')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-white text-sm">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentData.map((video, index) => {
                  const hashtags = extractHashtags(video.description)
                  const engagement = (video.digg_count || 0) + (video.comment_count || 0) + (video.share_count || 0)
                  
                  return (
                    <tr key={video.id} className="hover:bg-gray-700 transition-colors">
                      {/* 썸네일 */}
                      <td className="px-4 py-3">
                        {video.video_cover_url ? (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden relative">
                            <img 
                              src={video.video_cover_url}
                              alt="TikTok video"
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-6 h-6 text-white drop-shadow-lg" fill="white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <Video className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      
                      {/* 작성자 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-white" />
                          <div>
                            <div className="font-semibold text-white">
                              {video.author_nickname || video.author_name || 'Unknown'}
                            </div>
                            {video.author_followers && (
                              <div className="text-xs text-gray-400">
                                팔로워 {formatNumber(video.author_followers)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* 설명 */}
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {video.description?.length > 80 
                              ? video.description.substring(0, 80) + '...'
                              : video.description || '-'
                            }
                          </p>
                        </div>
                      </td>
                      
                      {/* 해시태그 */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-600 text-white rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                          {hashtags.length > 3 && (
                            <span className="text-xs text-gray-400">+{hashtags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      
                      {/* 좋아요 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-red-400">
                          {formatNumber(video.digg_count)}
                        </div>
                      </td>
                      
                      {/* 댓글 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-blue-400">
                          {formatNumber(video.comment_count)}
                        </div>
                      </td>
                      
                      {/* 공유 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-green-400">
                          {formatNumber(video.share_count)}
                        </div>
                      </td>
                      
                      {/* 조회수 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-medium text-yellow-400">
                          {formatNumber(video.play_count)}
                        </div>
                      </td>
                      
                      {/* 참여도 */}
                      <td className="px-4 py-3 text-center">
                        <div className="font-bold text-purple-400">
                          {formatNumber(engagement)}
                        </div>
                      </td>
                      
                      {/* 액션 */}
                      <td className="px-4 py-3">
                        {video.video_url && (
                          <button
                            onClick={() => window.open(video.video_url, '_blank')}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="TikTok에서 보기"
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
              className="px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? 'border-white bg-white text-black'
                      : 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-600 bg-gray-800 rounded-lg text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  )
}