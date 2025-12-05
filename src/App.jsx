import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import HomePage from './pages/HomePage'
import TrendsPage from './pages/TrendsPage'
import AnalysisPage from './pages/AnalysisPage'
import LoginPage from './pages/LoginPage'
import BookmarksPage from './pages/BookmarksPage'
import HuggingFacePage from './pages/HuggingFacePage'
import KoreanMarketPage from './pages/KoreanMarketPage'
import GitHubPage from './pages/GitHubPage'
import AIPurchasePage from './pages/AIPurchasePage'
import ProductAnalysisPage from './pages/ProductAnalysisPage'
import ContentTablePage from './pages/ContentTablePage'
import InstagramDetailPage from './pages/InstagramDetailPage'
import TikTokDetailPage from './pages/TikTokDetailPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AutoProductDiscoveryPage from './pages/AutoProductDiscoveryPage'
import AIPurchasePage2 from './pages/AIPurchasePage2'
import DailyRecommendations from './pages/DailyRecommendations'
import SupabaseTest from './components/SupabaseTest'
import useAuthStore from './store/useAuthStore'

function App() {
  const { checkAuth } = useAuthStore()
  console.log('App component rendered, routes:', window.location.pathname)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toast />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/huggingface" element={<HuggingFacePage />} />
          <Route path="/korean" element={<KoreanMarketPage />} />
          <Route path="/github" element={<GitHubPage />} />
          <Route path="/purchase" element={<AIPurchasePage />} />
          <Route path="/product-analysis" element={<ProductAnalysisPage />} />
          <Route path="/instagram" element={<ContentTablePage />} />
          <Route path="/instagram-detail" element={<InstagramDetailPage />} />
          <Route path="/tiktok-detail" element={<TikTokDetailPage />} />
          <Route path="/product-detail" element={<ProductDetailPage />} />
          <Route path="/auto-discovery" element={<AutoProductDiscoveryPage />} />
          <Route path="/purchase-2" element={<AIPurchasePage2 />} />
          <Route path="/daily-recommendations" element={<DailyRecommendations />} />
          <Route path="/test" element={<SupabaseTest />} />
        </Routes>
      </main>
    </div>
  )
}

export default App