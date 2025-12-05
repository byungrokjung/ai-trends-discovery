import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, DollarSign, Target, Package, Filter, ChevronRight, BarChart3, PieChart, Activity, AlertCircle, Star, ArrowUpRight, ArrowDownRight, Sparkles, Award, Clock, Eye, Heart, Coffee, Bookmark, Share2, MoreHorizontal, Zap, ExternalLink, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ProductAnalysisPage() {
  const [selectedDate, setSelectedDate] = useState('2025-11-23') // 오늘 날짜 (created_at 기준)
  const [selectedType, setSelectedType] = useState('all')
  const [dailyStats, setDailyStats] = useState(null)
  const [products, setProducts] = useState([])
  const [trendData, setTrendData] = useState([])
  const [categoryPerformance, setCategoryPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDropdowns, setOpenDropdowns] = useState({})

  // 구매대행 사이트 목록
  const purchaseSites = [
    {
      id: 'taobao',
      name: '타오바오 직접검색',
      icon: '🛒',
      url: (keyword) => `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}&imgfile=&commend=all&ssid=s5-e&search_type=item&sourceId=tb.index&spm=a21bo.2017.201856-taobao-item.1&ie=utf8&initiative_id=tbindexz_20170306`,
      color: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      id: 'pandamart',
      name: '판다마트',
      icon: '🐼',
      url: (keyword) => `https://www.pandamart.co.kr/search?keyword=${encodeURIComponent(keyword)}`,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      id: 'taobao_korea',
      name: '타오바오코리아',
      icon: '🇰🇷',
      url: (keyword) => `https://world.taobao.com/search/search.htm?search=${encodeURIComponent(keyword)}&from=sea_1_searchbutton&spm=a21bp.7806943.20151106.1`,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'chinatour',
      name: '차이나투어',
      icon: '✈️',
      url: (keyword) => `https://www.chinatour.co.kr/search?q=${encodeURIComponent(keyword)}`,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: '1688',
      name: '1688 도매',
      icon: '📦',
      url: (keyword) => `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keyword)}&n=y&netType=1&D=n`,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  ]

  const toggleDropdown = (productId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const handlePurchaseSiteClick = (siteInfo, keyword) => {
    if (keyword) {
      window.open(siteInfo.url(keyword), '_blank')
    }
  }

  // 상품 타입 정의
  const productTypes = [
    { id: 'all', name: '전체', emoji: '📊', color: 'bg-gray-100 text-gray-800' },
    { id: '골든템(🔥)', name: '골든템', emoji: '🔥', color: 'bg-red-100 text-red-800' },
    { id: '마진템(💎)', name: '마진템', emoji: '💎', color: 'bg-blue-100 text-blue-800' },
    { id: '트렌드템(📈)', name: '트렌드템', emoji: '📈', color: 'bg-green-100 text-green-800' },
    { id: '밸런스템(⚖️)', name: '밸런스템', emoji: '⚖️', color: 'bg-purple-100 text-purple-800' },
  ]

  useEffect(() => {
    loadAnalysisData()
  }, [selectedDate, selectedType])

  // 드롭다운 외부 클릭시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdowns({})
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAnalysisData = async () => {
    setLoading(true)
    try {
      const API_BASE = 'http://localhost:5000'
      
      // 일별 통계 (날짜 없으면 최근 데이터)
      const statsURL = selectedDate === '2025-11-23' ? 
        `${API_BASE}/api/product-analysis/daily-stats` :
        `${API_BASE}/api/product-analysis/daily-stats?date=${selectedDate}`;
      
      const statsResponse = await fetch(statsURL)
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setDailyStats(statsData.stats)
      }

      // 상품 목록 (날짜 없으면 최근 7일 데이터)
      const productsURL = selectedDate === '2025-11-23' ? 
        `${API_BASE}/api/product-analysis/daily?type=${selectedType}&limit=20` :
        `${API_BASE}/api/product-analysis/daily?date=${selectedDate}&type=${selectedType}&limit=20`;
      
      const productsResponse = await fetch(productsURL)
      const productsData = await productsResponse.json()
      if (productsData.success) {
        setProducts(productsData.data)
      }

      // 트렌드 데이터
      const trendResponse = await fetch(`${API_BASE}/api/product-analysis/trends?period=week&type=${selectedType}`)
      const trendResponseData = await trendResponse.json()
      if (trendResponseData.success) {
        setTrendData(trendResponseData.data)
      }

      // 카테고리 성과
      const categoryResponse = await fetch(`${API_BASE}/api/product-analysis/category-performance?period=7`)
      const categoryData = await categoryResponse.json()
      if (categoryData.success) {
        setCategoryPerformance(categoryData.data)
      }
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error)
      // 에러 발생시에도 빈 데이터로 설정
      setDailyStats(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₩0'
    return `₩${Number(amount).toLocaleString()}`
  }

  const formatPercentage = (value) => {
    if (!value) return '0%'
    return `${Number(value).toFixed(1)}%`
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50'
    if (score >= 60) return 'text-blue-600 bg-blue-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getRatingBadge = (rating) => {
    const badges = {
      'S': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'A': 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      'B': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
      'C': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      'D': 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
    }
    return badges[rating] || 'bg-gray-500 text-white'
  }

  const StatCard = ({ icon: Icon, label, value, change, color = "blue" }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${
              change > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  if (loading && !dailyStats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50/50 via-neutral-50 to-amber-50/30" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      {/* 브런치 감성 헤더 */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-stone-50/40 to-neutral-100/30"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-orange-200/10 to-amber-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-gradient-to-br from-stone-200/10 to-neutral-200/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-md rounded-full border border-stone-200/50 shadow-lg shadow-stone-200/20">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-stone-700 tracking-wide">Daily Intelligence Report</span>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-extralight text-stone-800 leading-[0.9] tracking-tight">
                Product
              </h1>
              <h2 className="text-5xl lg:text-6xl font-light italic text-amber-700 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Analytics
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-2xl font-light text-stone-600 leading-relaxed tracking-wide">
                Every great decision starts with understanding
              </p>
              <p className="text-xl font-light text-stone-500 leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                the story behind the numbers
              </p>
              <p className="text-lg text-stone-500 font-light leading-relaxed mt-4">
                우리가 선별한 상품들의 깊은 인사이트를 만나보세요
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-12 pt-12">
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-ultralight text-stone-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">{dailyStats?.totalProducts || 0}</div>
                <div className="text-sm font-medium text-stone-500 uppercase tracking-[0.2em]">Products</div>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-stone-300 to-transparent"></div>
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-ultralight text-stone-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">{dailyStats?.averageScores?.balance?.toFixed(0) || 0}</div>
                <div className="text-sm font-medium text-stone-500 uppercase tracking-[0.2em]">Balance</div>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-stone-300 to-transparent"></div>
              <div className="text-center group cursor-pointer">
                <div className="text-4xl font-ultralight text-stone-800 mb-2 group-hover:text-amber-600 transition-colors duration-300">{formatCurrency(dailyStats?.profitability?.totalNetProfit)}</div>
                <div className="text-sm font-medium text-stone-500 uppercase tracking-[0.2em]">Profit</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 우아한 필터 섹션 */}
      <section className="relative py-16 bg-white/80 backdrop-blur-xl border-t border-stone-200/50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
            {/* 날짜 선택 - 미니멀 브런치 스타일 */}
            <div className="flex items-center gap-6 group">
              <div className="p-4 rounded-full bg-gradient-to-br from-amber-50 to-stone-50 border border-stone-200/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                <Calendar className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-stone-500 uppercase tracking-[0.15em]">Analysis Date</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xl font-light bg-transparent border-none outline-none text-stone-800 cursor-pointer hover:text-amber-700 transition-colors"
                />
              </div>
            </div>

            <div className="h-12 w-px bg-gradient-to-b from-transparent via-stone-300 to-transparent hidden lg:block"></div>

            {/* 상품 타입 필터 - 세련된 태그 스타일 */}
            <div className="flex flex-wrap gap-4">
              {productTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`group relative flex items-center gap-3 px-6 py-3.5 rounded-full border border-stone-200/60 transition-all duration-500 hover:scale-105 ${
                    selectedType === type.id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-transparent shadow-xl shadow-amber-600/25'
                      : 'bg-white/80 text-stone-700 hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-800'
                  }`}
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span className="font-medium text-sm tracking-wide">{type.name}</span>
                  {selectedType === type.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm">
                      <div className="w-2 h-2 bg-amber-600 rounded-full m-0.5"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 우아한 통계 섹션 */}
      {dailyStats && (
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {format(new Date(selectedDate), 'M월 d일 (eeee)', { locale: ko })}
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-4"></div>
            <p className="text-lg text-stone-600 font-light">
              총 <span className="font-medium text-amber-700">{dailyStats.totalProducts}개</span> 상품 분석 완료
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <Bookmark className="w-5 h-5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-amber-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-[0.1em]">분석 상품 수</p>
                <p className="text-3xl font-light text-stone-800">{dailyStats.totalProducts}</p>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-emerald-600" />
                </div>
                <Share2 className="w-5 h-5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-amber-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-[0.1em]">평균 순이익</p>
                <p className="text-3xl font-light text-stone-800">{formatCurrency(dailyStats.profitability.totalNetProfit / dailyStats.totalProducts)}</p>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <MoreHorizontal className="w-5 h-5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-amber-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-[0.1em]">평균 밸런스</p>
                <p className="text-3xl font-light text-stone-800">{dailyStats.averageScores.balance.toFixed(1)}<span className="text-xl text-stone-500">점</span></p>
              </div>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-stone-200/50 hover:shadow-xl hover:shadow-stone-200/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <Zap className="w-5 h-5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-amber-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-500 uppercase tracking-[0.1em]">평균 트렌드</p>
                <p className="text-3xl font-light text-stone-800">{dailyStats.averageScores.trend.toFixed(1)}<span className="text-xl text-stone-500">점</span></p>
              </div>
            </div>
          </div>

          {/* 상품 타입별 분포 - 미니멀하고 우아하게 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.entries(dailyStats.byType).map(([type, count]) => {
              const typeInfo = productTypes.find(t => t.id === type)
              if (!typeInfo || count === 0) return null
              
              return (
                <div key={type} className="group bg-gradient-to-br from-white/80 to-stone-50/80 backdrop-blur-sm rounded-xl p-6 border border-stone-200/40 hover:border-amber-300/60 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{typeInfo.emoji}</span>
                    <span className="text-3xl font-light text-stone-800 group-hover:text-amber-700 transition-colors">{count}</span>
                  </div>
                  <p className="text-sm font-medium text-stone-600 uppercase tracking-[0.1em]">{typeInfo.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 상위 수익 상품 */}
      {dailyStats?.profitability?.topPerformers?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">🏆 수익성 Top 3</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dailyStats.profitability.topPerformers.map((product, index) => (
              <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-yellow-600">#{index + 1}</span>
                  <span className="text-lg">{productTypes.find(t => t.id === product.type)?.emoji}</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">순이익</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(product.netProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">순마진율</span>
                    <span className="font-medium">{formatPercentage(product.netMargin)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 브런치 감성 상품 갤러리 */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full mb-6">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 uppercase tracking-[0.1em]">Curated Selection</span>
          </div>
          <h2 className="text-5xl font-light text-stone-800 mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Featured Products
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
          <p className="text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            <span className="font-medium text-amber-700">{products.length}</span> carefully analyzed products, 
            <br className="hidden md:block" />
            each telling its own story of potential and opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {products.map((product, index) => (
            <article key={product.id} className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-700">
              {/* 우아한 메인 카드 */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 border border-stone-200/60 hover:border-amber-200">
                {/* 감성적 이미지 영역 */}
                <div className="relative h-80 bg-gradient-to-br from-stone-100 via-amber-50/50 to-orange-50/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-transparent"></div>
                  
                  {/* 우상단 타입 배지 */}
                  <div className="absolute top-6 left-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-full text-sm font-medium text-stone-800 shadow-lg shadow-stone-200/20 border border-stone-200/50">
                      <span className="text-lg">{productTypes.find(t => t.id === product.product_type)?.emoji}</span>
                      <span className="tracking-wide">{productTypes.find(t => t.id === product.product_type)?.name.replace('템', '')}</span>
                    </span>
                  </div>
                  
                  {/* 하트 아이콘 */}
                  <div className="absolute top-6 right-6">
                    <button className="p-3 bg-white/95 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 shadow-lg shadow-stone-200/20 border border-stone-200/50 group/heart">
                      <Heart className="w-5 h-5 text-stone-600 group-hover/heart:text-rose-500 group-hover/heart:fill-rose-500 transition-all duration-300" />
                    </button>
                  </div>
                  
                  {/* 등급 배지 */}
                  <div className="absolute bottom-6 right-6">
                    {product.rating && (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full text-sm font-bold shadow-xl shadow-amber-600/30">
                        <Award className="w-4 h-4" />
                        {product.rating}
                      </span>
                    )}
                  </div>
                  
                  {/* 인덱스 번호 */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/95 backdrop-blur-md rounded-full shadow-lg shadow-stone-200/20 border border-stone-200/50">
                      <span className="text-lg font-light text-stone-700">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                {/* 우아한 카드 내용 */}
                <div className="p-10">
                  <div className="mb-8">
                    <h3 className="text-3xl font-light text-stone-800 mb-4 group-hover:text-amber-700 transition-colors duration-300 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {product.product_name}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-stone-500 mb-6">
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full border border-stone-200/50">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">{product.category}</span>
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full border border-stone-200/50">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">{product.recommended_platform}</span>
                      </span>
                    </div>
                    {product.why_this_product && (
                      <div className="bg-stone-50/80 rounded-xl p-6 border border-stone-200/30">
                        <p className="text-stone-700 leading-relaxed font-light text-lg italic" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          "{product.why_this_product}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 감성적 수익성 섹션 */}
                  <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-green-50/40 rounded-2xl p-8 mb-8 border border-emerald-200/30">
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-medium text-emerald-800 mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Financial Highlights
                      </h4>
                      <div className="w-16 h-px bg-emerald-400 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-xs font-medium text-stone-600 uppercase tracking-[0.1em] mb-2">Investment</div>
                        <div className="text-2xl font-light text-stone-800">{formatCurrency(product.total_cost)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-stone-600 uppercase tracking-[0.1em] mb-2">Revenue</div>
                        <div className="text-2xl font-light text-stone-800">{formatCurrency(product.selling_price)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-emerald-700 uppercase tracking-[0.1em] mb-2">Net Profit</div>
                        <div className="text-3xl font-light text-emerald-800">{formatCurrency(product.net_profit)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-emerald-700 uppercase tracking-[0.1em] mb-2">Margin</div>
                        <div className="text-3xl font-light text-emerald-800">{formatPercentage(product.net_margin_rate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* 우아한 스코어 링 */}
                  <div className="flex items-center justify-between mb-8 bg-stone-50/50 rounded-xl p-6">
                    {[
                      { label: 'Margin', score: product.margin_score, color: 'emerald-500', bg: 'emerald-50' },
                      { label: 'Trend', score: product.trend_score, color: 'blue-500', bg: 'blue-50' },
                      { label: 'Season', score: product.season_fit, color: 'amber-500', bg: 'amber-50' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center group/score">
                        <div className={`relative w-20 h-20 mx-auto mb-3 group-hover/score:scale-110 transition-transform duration-300`}>
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              className="text-stone-200"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="34"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="6"
                              strokeDasharray={`${2 * Math.PI * 34}`}
                              strokeDashoffset={`${2 * Math.PI * 34 * (1 - (item.score || 0) / 100)}`}
                              className={`text-${item.color} transition-all duration-1000`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`text-center bg-${item.bg} rounded-full w-12 h-12 flex items-center justify-center`}>
                              <span className="text-lg font-light text-stone-800">{item.score || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-medium text-stone-600 uppercase tracking-[0.15em]">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 세련된 메타 정보 */}
                  <div className="border-t border-stone-200/50 pt-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-stone-500">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{format(new Date(product.analysis_date), 'MMM d', { locale: ko })}</span>
                        </span>
                        {product.china_search_keyword && (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200/50">
                            {product.china_search_keyword}
                          </span>
                        )}
                      </div>
                      <div className="relative dropdown-container">
                        <button 
                          onClick={() => toggleDropdown(product.id)}
                          disabled={!product.china_search_keyword}
                          className={`group/btn flex items-center gap-2 px-4 py-2 font-medium rounded-full transition-all duration-300 border ${
                            product.china_search_keyword 
                              ? 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200/50 hover:border-amber-300 cursor-pointer' 
                              : 'text-stone-400 bg-stone-50 border-stone-200 cursor-not-allowed'
                          }`}
                        >
                          {product.china_search_keyword ? (
                            <>
                              <span>구매하기</span>
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                                openDropdowns[product.id] ? 'rotate-180' : ''
                              }`} />
                            </>
                          ) : (
                            <>
                              <span>검색어 없음</span>
                              <AlertCircle className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        {/* 드롭다운 메뉴 */}
                        {openDropdowns[product.id] && product.china_search_keyword && (
                          <>
                            {/* 오버레이 */}
                            <div 
                              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
                              onClick={() => toggleDropdown(product.id)}
                            ></div>
                            
                            {/* 드롭다운 */}
                            <div className="absolute right-0 bottom-full mb-2 w-64 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200/50 p-3 z-50">
                              <div className="text-xs text-stone-500 px-3 py-2 border-b border-stone-200/30 mb-2">
                                검색어: <span className="font-semibold text-stone-700">{product.china_search_keyword}</span>
                              </div>
                              <div className="space-y-1">
                                {purchaseSites.map((site) => (
                                  <button
                                    key={site.id}
                                    onClick={() => {
                                      handlePurchaseSiteClick(site, product.china_search_keyword)
                                      toggleDropdown(product.id)
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] border hover:shadow-lg ${site.color}`}
                                  >
                                    <span className="text-lg">{site.icon}</span>
                                    <span className="font-medium text-sm flex-1 text-left">{site.name}</span>
                                    <ExternalLink className="w-4 h-4 opacity-60" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 감성적 빈 상태 */}
        {products.length === 0 && !loading && (
          <div className="text-center py-32">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-100/50 via-stone-100 to-orange-100/30 flex items-center justify-center shadow-lg shadow-stone-200/20 border border-stone-200/50">
              <Eye className="w-16 h-16 text-amber-500/70" />
            </div>
            <h3 className="text-4xl font-light text-stone-800 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              No Products Found
            </h3>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6"></div>
            <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto leading-relaxed">
              We're currently analyzing new products and discovering fresh opportunities.
              <span className="block mt-2 text-lg text-stone-500">Check back soon for insights that matter.</span>
            </p>
            <div className="mt-8">
              <button className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-full font-medium hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-600/25">
                Refresh Analysis
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 감성적 브런치 스타일 푸터 */}
      <footer className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900/80 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-8 py-24 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-12 shadow-lg shadow-black/10">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium tracking-wide">Powered by AI & Workflow Automation</span>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-5xl font-light mb-6" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Intelligence Meets
            <span className="block text-4xl italic text-amber-400 mt-2">Opportunity</span>
          </h2>
          
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
          
          <p className="text-xl text-stone-300 leading-relaxed font-light max-w-3xl mx-auto mb-12">
            Every product tells a story. Our AI-powered analysis transforms complex market data 
            into clear, actionable insights that drive smart business decisions.
            <span className="block mt-4 text-lg text-stone-400 italic">
              "The future belongs to those who understand the data today."
            </span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-2xl font-light text-white mb-2">AI-Driven</div>
              <div className="text-sm text-stone-400 uppercase tracking-[0.1em]">Analysis</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-2xl font-light text-white mb-2">Real-Time</div>
              <div className="text-sm text-stone-400 uppercase tracking-[0.1em]">Insights</div>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
              <div className="text-2xl font-light text-white mb-2">Data-Driven</div>
              <div className="text-sm text-stone-400 uppercase tracking-[0.1em]">Decisions</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}