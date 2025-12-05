import { useState, useEffect } from 'react'
import { Instagram, TrendingUp, Heart, MessageCircle, Eye, Hash, Users, Filter, Search, Calendar, Download, ExternalLink, PlayCircle, Image, MoreHorizontal, Sparkles, BarChart3, Coffee, Star, ChevronRight, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function InstagramScrapingPage() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [trendingHashtags, setTrendingHashtags] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFilters, setSelectedFilters] = useState({
    username: '',
    media_type: 'all',
    min_likes: '',
    hashtag: '',
    dateRange: 7,
    sortBy: 'scraped_at'
  })

  const mediaTypes = [
    { id: 'all', name: '전체', emoji: '📱', color: 'bg-gray-100 text-gray-800' },
    { id: 'image', name: '이미지', emoji: '📸', color: 'bg-blue-100 text-blue-800' },
    { id: 'video', name: '비디오', emoji: '🎥', color: 'bg-red-100 text-red-800' },
    { id: 'carousel', name: '캐러셀', emoji: '🎠', color: 'bg-purple-100 text-purple-800' }
  ]

  const sortOptions = [
    { id: 'scraped_at', name: '최신순', icon: Calendar },
    { id: 'like_count', name: '좋아요순', icon: Heart },
    { id: 'comment_count', name: '댓글순', icon: MessageCircle },
    { id: 'ai_relevance_score', name: 'AI 관련도', icon: Sparkles }
  ]

  useEffect(() => {
    loadInstagramData()
  }, [selectedFilters])

  const loadInstagramData = async () => {
    setLoading(true)
    try {
      const API_BASE = 'http://localhost:5000'
      
      // 포스트 데이터 로드
      const postsParams = new URLSearchParams()
      Object.entries(selectedFilters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'all') {
          postsParams.append(key, value)
        }
      })
      
      const [postsResponse, statsResponse, hashtagsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/instagram/posts?${postsParams.toString()}`),
        fetch(`${API_BASE}/api/instagram/stats?dateRange=${selectedFilters.dateRange}`),
        fetch(`${API_BASE}/api/instagram/trending-hashtags?dateRange=${selectedFilters.dateRange}&limit=15`)
      ])

      const [postsData, statsData, hashtagsData] = await Promise.all([
        postsResponse.json(),
        statsResponse.json(),
        hashtagsResponse.json()
      ])

      console.log('Posts Response:', postsData)
      console.log('Stats Response:', statsData)
      console.log('Hashtags Response:', hashtagsData)

      if (postsData.success) setPosts(postsData.data || [])
      if (statsData.success) setStats(statsData.stats)
      if (hashtagsData.success) setTrendingHashtags(hashtagsData.hashtags || [])

      // 데이터가 없을 때 더미 데이터 표시
      // 데이터가 있으면 실제 데이터 사용, 없으면 빈 배열
      if (!postsData.success || !postsData.data || postsData.data.length === 0) {
        console.log('No real data found')
        setPosts([])
        setStats(null)
        setTrendingHashtags([])
      }

    } catch (error) {
      console.error('인스타그램 데이터 로드 실패:', error)
      setPosts([])
      setStats(null)
      setTrendingHashtags([])
    } finally {
      setLoading(false)
    }
  }

  // 실제 데이터만 사용 - 더미 데이터 제거 완료

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatEngagement = (likes, comments) => {
    const total = (likes || 0) + (comments || 0)
    return formatNumber(total)
  }

  const getSentimentColor = (sentiment) => {
    const colors = {
      positive: 'bg-green-100 text-green-700 border-green-200',
      neutral: 'bg-gray-100 text-gray-700 border-gray-200',
      negative: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[sentiment] || colors.neutral
  }

  const getSentimentEmoji = (sentiment) => {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😞'
    }
    return emojis[sentiment] || '😐'
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">인스타그램 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-purple-50/40">
      {/* 모던 인스타그램 스타일 헤더 */}
      <header className="relative overflow-hidden bg-gradient-to-br from-white via-rose-50/30 to-purple-50/30">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center space-y-10">
            {/* 상태 배지 */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-rose-500/90 to-purple-600/90 backdrop-blur-md rounded-full text-white shadow-xl shadow-rose-500/25">
              <Instagram className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-wide">Live Social Intelligence</span>
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            
            {/* 메인 타이틀 */}
            <div className="space-y-6">
              <h1 className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none tracking-tighter">
                Instagram
              </h1>
              <h2 className="text-3xl lg:text-4xl font-light text-gray-700 tracking-wide">
                트렌드 인텔리전스 플랫폼
              </h2>
            </div>
            
            {/* 설명 */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 leading-relaxed">
                실시간 인스타그램 데이터를 AI로 분석하여
                <br className="hidden md:block" />
                <span className="font-semibold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                  트렌드와 인사이트를 제공합니다
                </span>
              </p>
            </div>
            
            {/* 실시간 통계 */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-rose-600 mb-2">{formatNumber(stats.totalPosts)}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">총 포스트</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{formatNumber(stats.totalLikes)}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">총 좋아요</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-pink-600 mb-2">{formatNumber(stats.totalComments)}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">총 댓글</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{formatNumber(stats.avgEngagement)}</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">평균 참여도</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 스마트 필터 섹션 */}
      <section className="relative py-12 bg-gradient-to-r from-white via-rose-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-200/50">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
              🔍 스마트 필터링
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 검색 입력 */}
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="계정명으로 검색..."
                    value={selectedFilters.username}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, username: e.target.value }))}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="해시태그 검색..."
                    value={selectedFilters.hashtag}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, hashtag: e.target.value }))}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>

              {/* 미디어 타입 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">콘텐츠 타입</label>
                <div className="grid grid-cols-2 gap-3">
                  {mediaTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedFilters(prev => ({ ...prev, media_type: type.id }))}
                      className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 font-medium ${
                        selectedFilters.media_type === type.id
                          ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white border-transparent shadow-lg shadow-rose-500/30 scale-105'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-rose-300 hover:bg-rose-50 hover:scale-102'
                      }`}
                    >
                      <span className="text-lg">{type.emoji}</span>
                      <span className="text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 정렬 및 추가 필터 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">정렬 기준</label>
                  <div className="relative">
                    <select
                      value={selectedFilters.sortBy}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full py-4 px-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 font-medium appearance-none cursor-pointer"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">최소 좋아요 수</label>
                  <input
                    type="number"
                    placeholder="예: 1000"
                    value={selectedFilters.min_likes}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, min_likes: e.target.value }))}
                    className="w-full py-4 px-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 대시보드 */}
      {stats && (
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Analytics Overview
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.1em]">Total Posts</p>
                <p className="text-2xl font-light text-gray-800">{formatNumber(stats.totalPosts)}</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-pink-50">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.1em]">Total Likes</p>
                <p className="text-2xl font-light text-gray-800">{formatNumber(stats.totalLikes)}</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.1em]">Total Comments</p>
                <p className="text-2xl font-light text-gray-800">{formatNumber(stats.totalComments)}</p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.1em]">Avg Engagement</p>
                <p className="text-2xl font-light text-gray-800">{formatNumber(stats.avgEngagement)}</p>
              </div>
            </div>
          </div>

          {/* 트렌딩 해시태그 */}
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 rounded-3xl p-8 border border-gray-200/40">
            <h3 className="text-2xl font-light text-gray-800 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Trending Hashtags
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingHashtags.slice(0, 9).map((hashtag, index) => (
                <div key={hashtag.tag} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-gray-200/30 hover:border-pink-300 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-pink-700">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">#{hashtag.tag}</p>
                      <p className="text-sm text-gray-500">{hashtag.count} posts</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-pink-600">{formatNumber(hashtag.avgEngagement)}</p>
                    <p className="text-xs text-gray-500">avg engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 트렌딩 콘텐츠 갤러리 */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-rose-100 to-purple-100 rounded-full mb-8">
            <Star className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Trending Content</span>
          </div>
          <h2 className="text-5xl font-black text-gray-800 mb-6">
            실시간 <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">인기 포스트</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AI가 분석한 <span className="font-bold text-rose-600">{posts.length}개</span>의 트렌딩 포스트를 확인해보세요
          </p>
        </div>

        {/* 포스트 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article key={post.id} className="group relative">
              {/* 메인 카드 */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100 hover:border-rose-200 transform hover:scale-[1.02]">
                
                {/* 이미지/비디오 영역 */}
                <div className="relative h-80 bg-gradient-to-br from-rose-100 via-purple-100 to-pink-100 overflow-hidden">
                  {/* 실제 이미지 표시 */}
                  {(() => {
                    let imageUrl = null;
                    
                    // displayUrl 우선 사용
                    if (post.displayUrl) {
                      imageUrl = post.displayUrl;
                    }
                    // images 배열에서 첫 번째 이미지 사용
                    else if (post.images) {
                      try {
                        const imagesArray = Array.isArray(post.images) ? post.images : JSON.parse(post.images);
                        if (imagesArray && imagesArray.length > 0) {
                          imageUrl = imagesArray[0];
                        }
                      } catch (e) {
                        console.log('Failed to parse images:', e);
                      }
                    }
                    
                    return imageUrl ? (
                      <img 
                        src={imageUrl}
                        alt={post.caption ? post.caption.substring(0, 100) : 'Instagram post'}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null;
                  })()}
                  
                  {/* 그라데이션 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  {/* 순위 배지 */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full text-white font-black text-lg shadow-lg">
                      #{index + 1}
                    </div>
                  </div>

                  {/* 미디어 타입 아이콘 */}
                  <div className="absolute top-4 right-4 z-10">
                    {post.media_type === 'video' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <PlayCircle className="w-4 h-4" />
                        VIDEO
                      </div>
                    )}
                    {post.media_type === 'carousel' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <MoreHorizontal className="w-4 h-4" />
                        GALLERY
                      </div>
                    )}
                    {post.media_type === 'image' && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/90 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <Image className="w-4 h-4" />
                        PHOTO
                      </div>
                    )}
                  </div>

                  {/* AI 점수 배지 */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      AI {post.ai_relevance_score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>

                  {/* 참여도 오버레이 */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <Heart className="w-4 h-4 text-red-400" />
                        {formatNumber(post.likesCount || post.like_count)}
                      </div>
                      <div className="flex items-center gap-1 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        {formatNumber(post.commentsCount || post.comment_count)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="p-6">
                  {/* 헤더 정보 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* 프로필 아이콘 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {post.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">@{post.username}</h3>
                        <p className="text-sm text-gray-500">{post.timestamp ? format(new Date(post.timestamp), 'MMM d, HH:mm', { locale: ko }) : '날짜 없음'}</p>
                      </div>
                    </div>
                    
                    {/* 감정 분석 배지 */}
                    {post.sentiment && (
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getSentimentColor(post.sentiment)}`}>
                        {getSentimentEmoji(post.sentiment)} {post.sentiment.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* 캡션 */}
                  {post.caption && (
                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed line-clamp-3 font-medium">
                        {post.caption.length > 150 ? `${post.caption.substring(0, 150)}...` : post.caption}
                      </p>
                    </div>
                  )}

                  {/* AI 분석 요약 */}
                  {post.ai_summary_korean && (
                    <div className="bg-gradient-to-r from-gray-50 to-rose-50/50 rounded-2xl p-4 mb-4 border border-gray-200/50">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-2">AI 인사이트</h4>
                          <p className="text-sm text-gray-600 leading-relaxed italic">
                            "{post.ai_summary_korean}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 해시태그 */}
                  {(() => {
                    // caption에서 해시태그 추출
                    const extractedHashtags = post.caption ? 
                      (post.caption.match(/#[\w가-힣]+/g) || []).map(tag => tag.replace('#', '')) : [];
                    
                    // 기존 hashtags 배열이 있다면 파싱 시도
                    let hashtagsArray = [];
                    if (post.hashtags) {
                      try {
                        if (Array.isArray(post.hashtags)) {
                          hashtagsArray = post.hashtags;
                        } else if (typeof post.hashtags === 'string') {
                          hashtagsArray = JSON.parse(post.hashtags);
                        }
                      } catch (e) {
                        hashtagsArray = [];
                      }
                    }
                    
                    // 추출된 해시태그와 기존 해시태그 합치기
                    const allHashtags = [...new Set([...hashtagsArray, ...extractedHashtags])].slice(0, 4);
                    
                    return allHashtags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {allHashtags.map((hashtag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">
                            <Hash className="w-3 h-3" />
                            {hashtag}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {/* 액션 버튼 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-500 font-medium">
                        참여도: <span className="font-bold text-rose-600">{formatEngagement(post.likesCount || post.like_count, post.commentsCount || post.comment_count)}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                      <ExternalLink className="w-4 h-4" />
                      View Post
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 빈 상태 */}
        {posts.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-100/50 via-gray-100 to-purple-100/30 flex items-center justify-center shadow-lg shadow-gray-200/20 border border-gray-200/50">
              <Instagram className="w-16 h-16 text-pink-500/70" />
            </div>
            <h3 className="text-3xl font-light text-gray-800 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              No Posts Found
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              No Instagram posts match your current filters.
              <span className="block mt-2 text-lg text-gray-500">Try adjusting your search criteria.</span>
            </p>
          </div>
        )}
      </section>

      {/* 감성적 푸터 */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900/80 to-pink-900/80 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-8 py-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 shadow-lg shadow-black/10">
            <Coffee className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-medium tracking-wide">Powered by AI & Social Intelligence</span>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-4xl font-light mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Social Media Meets
            <span className="block text-3xl italic text-pink-400 mt-2">Data Science</span>
          </h2>
          
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mb-8"></div>
          
          <p className="text-lg text-gray-300 leading-relaxed font-light max-w-3xl mx-auto mb-8">
            Transform social media chaos into actionable insights. Our AI analyzes millions of posts 
            to uncover trends, sentiment, and opportunities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                <Instagram className="w-8 h-8 text-pink-400" />
              </div>
              <div className="text-xl font-light text-white mb-2">Real-Time</div>
              <div className="text-sm text-gray-400 uppercase tracking-[0.1em]">Monitoring</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 text-pink-400" />
              </div>
              <div className="text-xl font-light text-white mb-2">Smart</div>
              <div className="text-sm text-gray-400 uppercase tracking-[0.1em]">Analytics</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-pink-400" />
              </div>
              <div className="text-xl font-light text-white mb-2">Trend</div>
              <div className="text-sm text-gray-400 uppercase tracking-[0.1em]">Prediction</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}