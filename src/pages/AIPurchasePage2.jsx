import { useState, useEffect } from 'react'
import {
    Zap, TrendingUp, Target,
    Play, ExternalLink, RefreshCw,
    Users, Star, Package,
    Instagram, Video
} from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function AIPurchasePage2() {
    const [activeTab, setActiveTab] = useState('all')
    const [realData, setRealData] = useState({
        instagram: [],
        tiktok: [],
        products: []
    })
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({
        totalItems: 0,
        instagramCount: 0,
        tiktokCount: 0,
        productCount: 0
    })
    const [sourcingData, setSourcingData] = useState([])
    const [sourcingLoading, setSourcingLoading] = useState(false)

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

    useEffect(() => {
        loadRealData()
    }, [])

    const loadRealData = async () => {
        setLoading(true)
        try {
            const [instagramResponse, tiktokResponse, productResponse] = await Promise.all([
                fetch(`${API_BASE}/api/instagram/posts?limit=1000&sortBy=like_count`),
                fetch(`${API_BASE}/api/tiktok/contents?limit=1000&sort_by=digg_count`),
                fetch(`${API_BASE}/api/product-analysis/daily?limit=1000`)
            ])

            const instagramData = await instagramResponse.json()
            const tiktokData = await tiktokResponse.json()
            const productData = await productResponse.json()

            const instagramPosts = instagramData.success ? instagramData.data : []
            const tiktokContents = tiktokData.success ? tiktokData.data : []
            const productAnalysis = productData.success ? productData.data : []

            setRealData({
                instagram: instagramPosts,
                tiktok: tiktokContents,
                products: productAnalysis
            })

            setStats({
                totalItems: instagramPosts.length + tiktokContents.length + productAnalysis.length,
                instagramCount: instagramPosts.length,
                tiktokCount: tiktokContents.length,
                productCount: productAnalysis.length
            })
        } catch (error) {
            console.error('데이터 로드 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSourcingAnalysis = async () => {
        setSourcingLoading(true)
        try {
            const response = await fetch(`${API_BASE}/api/sourcing/recommendations`)
            const result = await response.json()

            if (result.success) {
                setSourcingData(result.data)
            }
        } catch (error) {
            console.error('소싱 분석 실패:', error)
            alert('소싱 분석 중 오류가 발생했습니다.')
        } finally {
            setSourcingLoading(false)
        }
    }

    const tabs = [
        { id: 'all', label: '전체', count: stats.totalItems },
        { id: 'instagram', label: '인스타그램', count: stats.instagramCount },
        { id: 'tiktok', label: '틱톡', count: stats.tiktokCount },
        { id: 'product', label: '상품분석', count: stats.productCount }
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Real Data Mode
                                </span>
                                <span className="text-sm text-gray-500">n8n 수집 데이터 실시간 연동</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">AI 소싱 인사이트 (Real)</h1>
                            <p className="mt-2 text-gray-600">실제 수집된 인스타그램/틱톡 데이터를 기반으로 분석합니다.</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleSourcingAnalysis}
                                disabled={sourcingLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <Zap className={`w-4 h-4 ${sourcingLoading ? 'animate-spin' : ''}`} />
                                {sourcingLoading ? 'AI 분석 중...' : 'AI 소싱 분석 실행'}
                            </button>
                            <button
                                onClick={loadRealData}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                데이터 새로고침
                            </button>
                        </div>
                    </div>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <Instagram className="w-6 h-6 text-pink-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">수집된 포스트</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.instagramCount}</div>
                            <div className="text-sm text-gray-500 mt-1">인스타그램 트렌드</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-black rounded-lg">
                                    <Video className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">수집된 영상</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.tiktokCount}</div>
                            <div className="text-sm text-gray-500 mt-1">틱톡 트렌드</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Target className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">분석 상태</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">Active</div>
                            <div className="text-sm text-gray-500 mt-1">실시간 파이프라인 가동중</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* AI 소싱 추천 섹션 */}
                {sourcingData.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Zap className="w-6 h-6 text-yellow-500" />
                            AI 소싱 추천 (Top Picks)
                        </h2>
                        <div className="space-y-8">
                            {sourcingData.map((item, index) => (
                                <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-1 lg:grid-cols-3">
                                        <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50">
                                            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Viral Origin</h3>
                                            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4 relative">
                                                {item.type === 'instagram' ? (
                                                    <img src={item.originalContent.displayUrl || item.originalContent.imageUrl} className="w-full h-full object-cover" alt="content" />
                                                ) : (
                                                    <img src={item.originalContent.video_cover_url} className="w-full h-full object-cover" alt="content" />
                                                )}
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                                                    {item.type === 'instagram' ? 'Instagram' : 'TikTok'}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-3 italic">
                                                "{item.type === 'instagram' ? item.originalContent.caption : item.originalContent.description}"
                                            </p>
                                        </div>

                                        <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
                                            <h3 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider">AI Analysis</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-xs text-gray-400 mb-1">핵심 상품명</div>
                                                    <div className="text-lg font-bold text-gray-900">{item.analysis.productName}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-400 mb-1">인기 이유</div>
                                                    <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{item.analysis.reason}</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <div className="text-xs text-gray-400 mb-1">타겟 고객</div>
                                                        <div className="text-sm font-medium text-gray-800">{item.analysis.targetAudience}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-400 mb-1">소구점</div>
                                                        <div className="text-sm font-medium text-gray-800">{item.analysis.sellingPoint}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-yellow-50/30">
                                            <h3 className="text-sm font-bold text-orange-600 mb-4 uppercase tracking-wider">Sourcing Match</h3>
                                            <div className="space-y-3">
                                                {item.sourcingProducts.map((product, pIdx) => (
                                                    <a
                                                        key={pIdx}
                                                        href={product.contextLink || product.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                                                    >
                                                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                            <img src={product.thumbnail} alt="product" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600">{product.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <ExternalLink className="w-3 h-3" />
                                                                AliExpress
                                                            </div>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 상품분석 섹션 */}
                {(activeTab === 'all' || activeTab === 'product') && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            상품 분석 데이터
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realData.products.map((product) => (
                                <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg mb-1">{product.product_name}</h3>
                                                <p className="text-sm text-gray-500">{product.product_type}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${product.balance_score >= 70 ? 'bg-green-100 text-green-700'
                                                : product.balance_score >= 50 ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                점수 {product.balance_score}
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">검색량</span>
                                                <span className="font-medium text-gray-900">{product.search_volume?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">경쟁 강도</span>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className={`w-2 h-2 rounded-full ${i < (product.competition_level || 0) ? 'bg-orange-500' : 'bg-gray-200'
                                                            }`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">총 리뷰</span>
                                                <span className="font-medium text-gray-900">{product.total_reviews?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">평균 별점</span>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="font-medium text-gray-900">{product.avg_rating}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {product.analysis_summary && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-600 line-clamp-3">{product.analysis_summary}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {realData.products.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    수집된 상품 분석 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 틱톡 섹션 */}
                {(activeTab === 'all' || activeTab === 'tiktok') && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            틱톡 급상승 트렌드
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {realData.tiktok.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        {item.video_cover_url ? (
                                            <img src={item.video_cover_url} alt="Cover" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white font-medium flex items-center gap-1">
                                            <Play className="w-3 h-3" />
                                            {item.play_count?.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                                {item.author_avatar && <img src={item.author_avatar} alt="author" className="w-full h-full object-cover" />}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 truncate">{item.author_name}</span>
                                        </div>
                                        <p className="text-gray-900 font-medium line-clamp-2 mb-3 h-12">{item.description || '내용 없음'}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                                            <div className="flex gap-3">
                                                <span className="flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                                    {item.digg_count?.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                    {item.share_count?.toLocaleString()}
                                                </span>
                                            </div>
                                            <span>{format(new Date(item.created_at), 'MM.dd', { locale: ko })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {realData.tiktok.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    수집된 틱톡 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 인스타그램 섹션 */}
                {(activeTab === 'all' || activeTab === 'instagram') && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Instagram className="w-5 h-5" />
                            인스타그램 인기 포스트
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {realData.instagram.map((item) => (
                                <div key={item.pk || item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-square bg-gray-100 relative overflow-hidden group">
                                        {item.displayUrl || item.imageUrl ? (
                                            <img src={item.displayUrl || item.imageUrl} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <div className="text-white text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span>❤️ {item.likesCount?.toLocaleString()}</span>
                                                    <span>💬 {item.commentsCount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-900">@{item.ownerUsername}</span>
                                            <span className="text-xs text-gray-500">{format(new Date(item.timestamp), 'MM.dd', { locale: ko })}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.caption}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {item.caption?.match(/#[\w가-힣]+/g)?.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {realData.instagram.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                    수집된 인스타그램 데이터가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
