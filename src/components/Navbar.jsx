import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, Home, Bookmark, BarChart3, LogOut, Menu, X, Bot, Github, ShoppingCart, Target, Instagram, Zap } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useState } from 'react'

const Navbar = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl gradient-text">AI Trends</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4" />
              <span>홈</span>
            </Link>

            <Link to="/trends" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>트렌드</span>
            </Link>

            <Link to="/analysis" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span>분석</span>
            </Link>

            <Link to="/huggingface" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Bot className="h-4 w-4" />
              <span>Hugging Face</span>
            </Link>

            <Link to="/korean" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <TrendingUp className="h-4 w-4" />
              <span>한국 AI</span>
            </Link>

            <Link to="/github" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Link>

            <Link to="/purchase" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart className="h-4 w-4" />
              <span>AI 구매대행</span>
            </Link>

            <Link to="/purchase-2" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Zap className="h-4 w-4" />
              <span>AI 구매대행 2</span>
            </Link>

            <Link to="/product-analysis" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Target className="h-4 w-4" />
              <span>상품 분석</span>
            </Link>

            <Link to="/instagram" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Instagram className="h-4 w-4" />
              <span>콘텐츠 테이블</span>
            </Link>

            <Link to="/auto-discovery" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
              <Zap className="h-4 w-4" />
              <span>🤖 AI 구매대행</span>
            </Link>

            {user && (
              <Link to="/bookmarks" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                <Bookmark className="h-4 w-4" />
                <span>북마크</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary text-sm"
              >
                로그인
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              홈
            </Link>
            <Link
              to="/trends"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              트렌드
            </Link>
            <Link
              to="/analysis"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              분석
            </Link>
            <Link
              to="/huggingface"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hugging Face
            </Link>
            <Link
              to="/korean"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              한국 AI
            </Link>
            <Link
              to="/github"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              GitHub
            </Link>
            <Link
              to="/purchase"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI 구매대행
            </Link>
            <Link
              to="/product-analysis"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              상품 분석
            </Link>
            <Link
              to="/instagram"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              콘텐츠 테이블
            </Link>
            <Link
              to="/auto-discovery"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              🤖 AI 구매대행
            </Link>
            {user && (
              <Link
                to="/bookmarks"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                북마크
              </Link>
            )}
            <hr className="my-2" />
            {user ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-600">{user.email}</div>
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar