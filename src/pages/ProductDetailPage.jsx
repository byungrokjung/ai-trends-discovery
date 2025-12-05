import { useState, useEffect } from 'react'
import { 
  Package, DollarSign, TrendingUp, BarChart3, Star, Calendar, 
  ExternalLink, RefreshCw, Search, SortAsc, SortDesc,
  ShoppingCart, Target, Award, Download, Filter, Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function ProductDetailPage() {
  const [productData, setProductData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('balance_score')
  const [sortOrder, setSortOrder] = useState('desc')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)

  const API_BASE = 'http://localhost:5000'

  useEffect(() => {
    loadProductData()
  }, [])

  useEffect(() => {
    filterAndSortData()
  }, [productData, searchQuery, sortField, sortOrder, categoryFilter, ratingFilter])

  const loadProductData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/product-analysis/products`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setProductData(data.data)
        console.log('📦 상품분석 데이터 로드:', data.data.length, '개')
      }
    } catch (error) {
      console.error('상품분석 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortData = () => {
    let filtered = [...productData]

    // 카테고리 필터링
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    // 평점 필터링
    if (ratingFilter !== 'all') {
      filtered = filtered.filter(item => item.rating === ratingFilter)
    }

    // 검색 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.product_name?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.why_this_product?.toLowerCase().includes(query)
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal
      
      switch (sortField) {
        case 'balance_score':
          aVal = a.balance_score || 0
          bVal = b.balance_score || 0
          break
        case 'trend_score':
          aVal = a.trend_score || 0
          bVal = b.trend_score || 0
          break
        case 'margin_score':
          aVal = a.margin_score || 0
          bVal = b.margin_score || 0
          break
        case 'selling_price':
          aVal = a.selling_price || 0
          bVal = b.selling_price || 0
          break
        case 'net_profit':
          aVal = a.net_profit || 0
          bVal = b.net_profit || 0
          break
        case 'net_margin_rate':
          aVal = a.net_margin_rate || 0
          bVal = b.net_margin_rate || 0
          break
        case 'created_at':
          aVal = new Date(a.created_at || 0)
          bVal = new Date(b.created_at || 0)
          break
        case 'product_name':
          aVal = (a.product_name || '').toLowerCase()
          bVal = (b.product_name || '').toLowerCase()
          break
        default:
          aVal = a.balance_score || 0
          bVal = b.balance_score || 0
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

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 100000) return `${(num / 10000).toFixed(0)}만`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatKRW = (num) => {
    if (!num) return '0원'
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만원`
    return `${num.toLocaleString()}원`
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

  const getRatingColor = (rating) => {
    switch (rating) {
      case '🔥 골든템': return 'bg-red-100 text-red-800 border-red-200'
      case '💎 마진템': return 'bg-blue-100 text-blue-800 border-blue-200'
      case '📈 트렌드템': return 'bg-green-100 text-green-800 border-green-200'
      case '⚖️ 밸런스템': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-red-600 font-bold'
    if (score >= 80) return 'text-orange-600 font-semibold'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-blue-600'
    return 'text-gray-600'
  }

  // 카테고리 목록 추출
  const categories = [...new Set(productData.map(p => p.category).filter(Boolean))]
  const ratings = [...new Set(productData.map(p => p.rating).filter(Boolean))]

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">📦 상품분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                📦 상품분석 상세 데이터
              </h1>
              <p className="text-gray-600 mt-1">AI 분석 상품 전체 데이터 ({productData.length}개)</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/products-export.csv')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              
              <button
                onClick={loadProductData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>

          {/* 필터 및 검색 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 등급 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">등급</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 등급</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>

            {/* 검색 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="상품명, 카테고리, 분석 내용으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 결과 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>총 {filteredData.length}개 상품</span>
            <span>페이지 {currentPage} / {totalPages}</span>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('product_name')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      상품명 {getSortIcon('product_name')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">카테고리</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">등급</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('selling_price')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      💰 판매가 {getSortIcon('selling_price')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('net_profit')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      💵 순이익 {getSortIcon('net_profit')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('net_margin_rate')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      📊 마진율 {getSortIcon('net_margin_rate')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('balance_score')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      🏆 밸런스 {getSortIcon('balance_score')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('trend_score')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      📈 트렌드 {getSortIcon('trend_score')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('margin_score')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      💎 마진 {getSortIcon('margin_score')}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-900 text-sm">
                    <button 
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      📅 분석일 {getSortIcon('created_at')}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((product, index) => (
                  <tr key={product.id} className="hover:bg-blue-50 transition-colors">
                    {/* 상품명 */}
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <div className="font-semibold text-gray-900 line-clamp-2">
                          {product.product_name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.why_this_product?.substring(0, 80)}...
                        </div>
                      </div>
                    </td>
                    
                    {/* 카테고리 */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {product.category}
                        </span>
                        {product.product_type && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {product.product_type}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* 등급 */}
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getRatingColor(product.rating)}`}>
                        {product.rating}
                      </span>
                    </td>
                    
                    {/* 판매가 */}
                    <td className="px-4 py-4 text-center">
                      <div className="font-semibold text-green-600">
                        {formatKRW(product.selling_price)}
                      </div>
                    </td>
                    
                    {/* 순이익 */}
                    <td className="px-4 py-4 text-center">
                      <div className="font-semibold text-blue-600">
                        {formatKRW(product.net_profit)}
                      </div>
                    </td>
                    
                    {/* 마진율 */}
                    <td className="px-4 py-4 text-center">
                      <div className="font-semibold text-purple-600">
                        {product.net_margin_rate?.toFixed(1)}%
                      </div>
                    </td>
                    
                    {/* 밸런스 점수 */}
                    <td className="px-4 py-4 text-center">
                      <div className={`font-bold ${getScoreColor(product.balance_score)}`}>
                        {product.balance_score}
                      </div>
                    </td>
                    
                    {/* 트렌드 점수 */}
                    <td className="px-4 py-4 text-center">
                      <div className={`font-bold ${getScoreColor(product.trend_score)}`}>
                        {product.trend_score}
                      </div>
                    </td>
                    
                    {/* 마진 점수 */}
                    <td className="px-4 py-4 text-center">
                      <div className={`font-bold ${getScoreColor(product.margin_score)}`}>
                        {product.margin_score}
                      </div>
                    </td>
                    
                    {/* 분석일 */}
                    <td className="px-4 py-4">
                      {product.created_at ? (
                        <div className="text-sm text-gray-600">
                          {format(new Date(product.created_at), 'yyyy-MM-dd', { locale: ko })}
                        </div>
                      ) : (
                        <div className="text-gray-400">-</div>
                      )}
                    </td>
                  </tr>
                ))}
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