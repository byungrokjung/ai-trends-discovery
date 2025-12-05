import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Package, Filter } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function DailyRecommendations() {
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({})
    const [selectedCategory, setSelectedCategory] = useState('all')

    // 유사 상품 검색 관련 상태
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [similarProducts, setSimilarProducts] = useState([])
    const [searchingSimilar, setSearchingSimilar] = useState(false)

    const categories = [
        { id: 'all', name: '전체', icon: Package },
        { id: 'fashion', name: '패션', icon: TrendingUp },
        { id: 'beauty', name: '뷰티', icon: TrendingUp },
        { id: 'home', name: '홈/인테리어', icon: TrendingUp },
        { id: 'tech', name: '테크/가젯', icon: TrendingUp },
        { id: 'lifestyle', name: '라이프스타일', icon: TrendingUp }
    ]

    useEffect(() => {
        fetchRecommendations()
    }, [selectedCategory])

    const fetchRecommendations = async () => {
        setLoading(true)
        try {
            const url = selectedCategory === 'all'
                ? `${API_BASE}/api/daily-recommendations`
                : `${API_BASE}/api/daily-recommendations?category=${selectedCategory}`

            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setRecommendations(result.data)
                setStats(result.stats)
            }
        } catch (error) {
            console.error('추천 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFindSimilar = async (product) => {
        setSelectedProduct(product)
        setSearchingSimilar(true)
        setSimilarProducts([])

        try {
            // 벡터 검색 API 호출
            const response = await fetch(`${API_BASE}/api/vector-search/similar?query=${encodeURIComponent(product.trend_keyword)}`)
            const result = await response.json()

            if (result.success) {
                setSimilarProducts(result.data)
            }
        } catch (error) {
            console.error('유사 상품 검색 실패:', error)
        } finally {
            setSearchingSimilar(false)
        }
    }

    const filteredRecommendations = recommendations

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">오늘의 AI 상품 추천</h1>
                    </div>
                    <p className="text-gray-600">
                        벡터 DB 기반으로 분석한 트렌드 상품 {stats.total || 0}개
                    </p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">전체</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">패션</div>
                        <div className="text-2xl font-bold text-pink-600">{stats.byCategory?.fashion || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">뷰티</div>
                        <div className="text-2xl font-bold text-purple-600">{stats.byCategory?.beauty || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">홈</div>
                        <div className="text-2xl font-bold text-green-600">{stats.byCategory?.home || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">테크</div>
                        <div className="text-2xl font-bold text-indigo-600">{stats.byCategory?.tech || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-sm text-gray-600 mb-1">라이프</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.byCategory?.lifestyle || 0}</div>
                    </div>
                </div>

                {/* 카테고리 필터 */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* 상품 그리드 */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-600">로딩 중...</div>
                    </div>
                ) : filteredRecommendations.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">추천 상품이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRecommendations.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
                                {/* 이미지 */}
                                <div className="aspect-square bg-gray-100 relative group">
                                    <img
                                        src={item.thumbnail_url || 'https://placehold.co/300x300?text=No+Image'}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null; // 무한 루프 방지
                                            e.target.src = 'https://placehold.co/300x300?text=Error';
                                        }}
                                    />
                                    {/* 카테고리 뱃지 */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.category === 'fashion' ? 'bg-pink-100 text-pink-800' :
                                            item.category === 'beauty' ? 'bg-purple-100 text-purple-800' :
                                                item.category === 'home' ? 'bg-green-100 text-green-800' :
                                                    item.category === 'tech' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-orange-100 text-orange-800'
                                            }`}>
                                            {item.category}
                                        </span>
                                    </div>
                                    {/* 플랫폼 뱃지 */}
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                                            {item.platform === 'instagram' ? 'IG' : 'TT'}
                                        </span>
                                    </div>

                                    {/* 호버 오버레이 */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
                                </div>

                                {/* 정보 */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                                        {item.product_name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                        #{item.trend_keyword}
                                    </p>

                                    {/* 분석 정보 */}
                                    <div className="flex-1 mb-4">
                                        {item.analysis && (() => {
                                            try {
                                                const analysis = JSON.parse(item.analysis)
                                                return (
                                                    <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded">
                                                        {analysis.reason && (
                                                            <p className="line-clamp-2">💡 {analysis.reason}</p>
                                                        )}
                                                    </div>
                                                )
                                            } catch {
                                                return null
                                            }
                                        })()}
                                    </div>

                                    {/* 버튼 그룹 */}
                                    <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
                                        <a
                                            href={item.product_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                                        >
                                            구매 링크
                                        </a>
                                        <button
                                            onClick={() => handleFindSimilar(item)}
                                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200 flex items-center justify-center"
                                            title="비슷한 상품 찾기"
                                        >
                                            <TrendingUp className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 비슷한 상품 모달 */}
                {selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-900">
                                    '{selectedProduct.trend_keyword}' 관련 추천
                                </h2>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto bg-gray-50">
                                {searchingSimilar ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        <p className="text-gray-600">AI가 유사한 트렌드를 분석 중입니다...</p>
                                    </div>
                                ) : similarProducts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        유사한 상품을 찾지 못했습니다.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {similarProducts.map((prod, idx) => (
                                            <div key={idx} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                                                <div className="aspect-video bg-gray-100 rounded mb-2 overflow-hidden relative">
                                                    {/* 이미지 표시 로직 */}
                                                    {prod.displayUrl || prod.thumbnail_url ? (
                                                        <img src={prod.displayUrl || prod.thumbnail_url} alt="content" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">
                                                            {prod.platform === 'instagram' ? 'Instagram Post' : 'TikTok Video'}
                                                        </div>
                                                    )}
                                                    <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-[10px] px-1 rounded">
                                                        {prod.platform}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium line-clamp-2 mb-1 text-gray-800">
                                                    {prod.content || prod.caption || prod.description}
                                                </p>
                                                <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                        유사도: {(prod.similarity * 100).toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
