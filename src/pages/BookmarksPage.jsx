import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Share2, X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Eye, MessageCircle, Search, Filter, ChevronDown, Trash2, BookmarkX } from 'lucide-react';
import useBookmarkStore from '../store/useBookmarkStore';
import { useToast } from '../store/useToastStore';

// 카테고리 정의 (HomePage와 동일)
const CATEGORIES = [
  { id: 'all', label: '전체', icon: '🎯' },
  { id: 'ai-tools', label: 'AI 도구', icon: '🛠️' },
  { id: 'model-release', label: '모델 출시', icon: '🚀' },
  { id: 'api', label: 'API', icon: '🔌' },
  { id: 'opensource', label: '오픈소스', icon: '📂' },
];

// 정렬 옵션
const SORT_OPTIONS = [
  { id: 'latest', label: '최근 저장순' },
  { id: 'oldest', label: '오래된순' },
  { id: 'popular', label: '인기순' },
  { id: 'comments', label: '댓글순' },
];

const BookmarksPage = () => {
  const { 
    bookmarks, 
    removeBookmark, 
    searchBookmarks, 
    filterBookmarksByCategory,
    sortBookmarks,
    clearBookmarks 
  } = useBookmarkStore();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 디바운싱된 검색
  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    const timer = setTimeout(() => {
      setSearchQuery(searchInputValue);
    }, 500);
    
    setSearchDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchInputValue]);

  // 이미지 슬라이드쇼 효과
  useEffect(() => {
    if (hoveredCard) {
      const bookmark = filteredAndSortedBookmarks.find(b => b.id === hoveredCard);
      if (bookmark && bookmark.allImages && bookmark.allImages.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex(prev => ({
            ...prev,
            [hoveredCard]: ((prev[hoveredCard] || 0) + 1) % bookmark.allImages.length
          }));
        }, 2000);
        return () => clearInterval(interval);
      }
    } else {
      setCurrentImageIndex({});
    }
  }, [hoveredCard]);

  // 키보드 이벤트 처리
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedProduct, selectedImageIndex]);

  // 필터링 및 정렬된 북마크
  const filteredAndSortedBookmarks = useMemo(() => {
    let filtered = bookmarks;
    
    // 검색어 필터링
    if (searchQuery) {
      filtered = searchBookmarks(searchQuery);
    }
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filterBookmarksByCategory(selectedCategory);
    }
    
    // 정렬
    return sortBookmarks(sortBy);
  }, [bookmarks, searchQuery, selectedCategory, sortBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "방금 전";
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 48) return "어제";
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  const formatNumber = (num) => {
    if (num >= 10000) return `${Math.floor(num / 1000)}K`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleRemoveBookmark = (e, bookmarkId) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(bookmarkId);
    showToast("북마크에서 제거되었습니다.", "info");
  };

  const handleShare = (e, bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${bookmark.title} - ${window.location.origin}/trends/${bookmark.id}`);
    showToast("링크가 복사되었습니다.", "success");
  };

  const handleClearAll = () => {
    clearBookmarks();
    setShowClearConfirm(false);
    showToast("모든 북마크가 삭제되었습니다.", "info");
  };

  const handleImageClick = (e, bookmark) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(bookmark);
    setSelectedImageIndex(currentImageIndex[bookmark.id] || 0);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.allImages) {
      setSelectedImageIndex((prev) => 
        (prev + 1) % selectedProduct.allImages.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.allImages) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedProduct.allImages.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border-light">
        <div className="max-w-wide mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Bookmark className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold text-text-primary">북마크</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-text-secondary hover:text-primary transition-colors">홈</Link>
              <Link to="/deep-dive" className="text-text-secondary hover:text-primary transition-colors">심층 분석</Link>
              <Link to="/korean" className="text-text-secondary hover:text-primary transition-colors">한국 시장</Link>
              <Link to="/resources" className="text-text-secondary hover:text-primary transition-colors">리소스</Link>
              <Link to="/bookmarks" className="text-primary font-medium">북마크</Link>
            </nav>

            <div className="flex items-center gap-4">
              {bookmarks.length > 0 && (
                <button 
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm text-text-secondary hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline">전체 삭제</span>
                </button>
              )}
              <button className="btn-primary">
                구독하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-article mx-auto text-center">
          <h1 className="font-display text-display-lg font-light mb-6 leading-tight animate-fade-up text-text-primary">
            저장한 AI 프로덕트
          </h1>
          <p className="text-xl text-text-secondary mb-6 animate-fade-up animation-delay-200 font-light">
            나중에 다시 확인하고 싶은 AI 도구들을 모아두었습니다
          </p>
          <div className="text-lg text-primary font-medium animate-fade-up animation-delay-400">
            총 {bookmarks.length}개의 북마크
          </div>
        </div>
      </section>

      {/* 검색 및 필터 섹션 */}
      {bookmarks.length > 0 && (
        <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border-light">
          <div className="max-w-wide mx-auto px-6 py-4">
            {/* 검색바 */}
            <div className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="북마크된 AI 도구 검색..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background-card border border-border-light rounded-full text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary transition-colors"
                />
                {searchInputValue && (
                  <button
                    onClick={() => {
                      setSearchInputValue('');
                      setSearchQuery('');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-background-secondary transition-colors"
                  >
                    <X className="w-4 h-4 text-text-tertiary" />
                  </button>
                )}
              </div>
            </div>

            {/* 필터 컨트롤 */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* 카테고리 필터 */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-background-card text-text-secondary hover:bg-background-tertiary'
                    }`}
                  >
                    <span className="text-sm">{category.icon}</span>
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                ))}
              </div>

              {/* 정렬 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-background-card text-text-secondary rounded-full hover:bg-background-tertiary transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {SORT_OPTIONS.find(opt => opt.id === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-background-card rounded-xl shadow-lg border border-border-light overflow-hidden z-50">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-background-tertiary transition-colors ${
                          sortBy === option.id
                            ? 'text-primary font-medium'
                            : 'text-text-secondary'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 북마크 리스트 */}
      <section className="pb-20 bg-background-secondary">
        <div className="max-w-wide mx-auto px-6">
          {bookmarks.length === 0 ? (
            // 북마크가 없을 때
            <div className="text-center py-20">
              <div className="mb-6">
                <BookmarkX className="w-24 h-24 mx-auto text-text-tertiary opacity-50" />
              </div>
              <h3 className="text-2xl font-medium text-text-primary mb-4">
                아직 북마크가 없습니다
              </h3>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                홈에서 마음에 드는 AI 프로덕트를 발견하면
                <br />
                북마크 버튼을 눌러 여기에 저장해보세요
              </p>
              <Link 
                to="/" 
                className="btn-primary inline-flex items-center gap-2"
              >
                AI 프로덕트 둘러보기
              </Link>
            </div>
          ) : (
            <>
              {/* 검색 결과 정보 */}
              {(searchQuery || selectedCategory !== 'all') && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-text-secondary">
                      {searchQuery && (
                        <span>'{searchQuery}' 검색 결과 </span>
                      )}
                      {selectedCategory !== 'all' && (
                        <span>
                          {CATEGORIES.find(cat => cat.id === selectedCategory)?.label} 카테고리 
                        </span>
                      )}
                      <span className="font-medium text-text-primary">
                        {filteredAndSortedBookmarks.length}개
                      </span>
                    </p>
                    {(searchQuery || selectedCategory !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchInputValue('');
                          setSelectedCategory('all');
                          setSortBy('latest');
                        }}
                        className="text-sm text-primary hover:text-primary-hover transition-colors"
                      >
                        필터 초기화
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredAndSortedBookmarks.length === 0 ? (
                // 검색 결과가 없을 때
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-text-primary mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-text-secondary">
                    다른 검색어나 필터를 시도해보세요
                  </p>
                </div>
              ) : (
                // 북마크 카드 목록 (HomePage와 동일한 디자인)
                <div className="grid grid-cols-1 gap-6">
                  {filteredAndSortedBookmarks.map((bookmark) => (
                    <article
                      key={bookmark.id}
                      className="group"
                    >
                      <a
                        href={bookmark.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                        onMouseEnter={() => setHoveredCard(bookmark.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div className="bg-background-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row border border-border-light">
                          {/* 왼쪽 이미지 갤러리 영역 */}
                          <div 
                            className="relative w-full md:w-96 h-64 md:h-72 bg-background-tertiary flex-shrink-0 overflow-hidden cursor-pointer"
                            onClick={(e) => handleImageClick(e, bookmark)}
                          >
                            {bookmark.allImages && bookmark.allImages.length > 0 ? (
                              <div className="relative h-full">
                                {/* 슬라이드쇼 이미지 */}
                                <div className="relative h-full">
                                  {bookmark.allImages.map((img, idx) => (
                                    <div
                                      key={idx}
                                      className={`absolute inset-0 transition-opacity duration-1000 ${
                                        idx === (currentImageIndex[bookmark.id] || 0) ? 'opacity-100' : 'opacity-0'
                                      }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`${bookmark.title} ${idx + 1}`}
                                        className={`w-full h-full object-cover transition-all duration-700 ${
                                          hoveredCard === bookmark.id 
                                            ? 'scale-110 brightness-75 contrast-110' 
                                            : 'scale-100 brightness-100 contrast-100'
                                        }`}
                                        loading="lazy"
                                      />
                                    </div>
                                  ))}
                                </div>
                                
                                {/* 이미지 인디케이터 */}
                                {bookmark.allImages.length > 1 && hoveredCard === bookmark.id && (
                                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                                    {bookmark.allImages.map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                          idx === (currentImageIndex[bookmark.id] || 0)
                                            ? 'bg-white w-6'
                                            : 'bg-white/50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <img
                                src={bookmark.imageUrl}
                                alt={bookmark.title}
                                className={`w-full h-full object-cover transition-all duration-700 ${
                                  hoveredCard === bookmark.id 
                                    ? 'scale-110 brightness-75 contrast-110' 
                                    : 'scale-100 brightness-100 contrast-100'
                                }`}
                                loading="lazy"
                              />
                            )}
                            
                            {/* 호버 시 상세 정보 오버레이 */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${
                              hoveredCard === bookmark.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}>
                              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500">
                                <h4 className="text-lg font-bold mb-2">{bookmark.title}</h4>
                                <p className="text-sm mb-3 line-clamp-2">{bookmark.tagline || bookmark.summary}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs opacity-75">{bookmark.category}</span>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span>👥 {formatNumber(bookmark.views)}</span>
                                    {bookmark.commentsCount > 0 && <span>💬 {bookmark.commentsCount}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* 카테고리 뱃지 */}
                            <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
                              hoveredCard === bookmark.id ? 'opacity-0' : 'opacity-100'
                            }`}>
                              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-sm font-medium rounded-full shadow-sm">
                                {bookmark.category}
                              </span>
                            </div>
                          </div>

                          {/* 오른쪽 콘텐츠 영역 */}
                          <div className="flex-1 p-6 md:p-8 flex flex-col">
                            {/* 메타 정보 */}
                            <div className="flex items-center gap-3 mb-3 text-sm text-text-tertiary">
                              <span className="font-medium">{bookmark.source}</span>
                              <span>·</span>
                              <span>{formatDate(bookmark.publishedAt)}</span>
                              <span>·</span>
                              <span className="text-primary">북마크됨 {formatDate(bookmark.bookmarkedAt)}</span>
                            </div>

                            {/* 제목 */}
                            <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors">
                              {bookmark.title}
                            </h3>

                            {/* Tagline */}
                            {bookmark.tagline && (
                              <p className="text-lg text-text-tertiary mb-3 italic">
                                "{bookmark.tagline}"
                              </p>
                            )}

                            {/* 요약 */}
                            <p className="text-text-secondary mb-6 line-clamp-3 md:line-clamp-4 text-base leading-relaxed">
                              {bookmark.summaryKorean || bookmark.summary}
                            </p>

                            {/* 하단 정보 */}
                            <div className="mt-auto">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                  {/* 메이커 정보 */}
                                  {bookmark.maker && (
                                    <div className="flex items-center gap-2">
                                      {bookmark.maker.avatar && (
                                        <img 
                                          src={bookmark.maker.avatar} 
                                          alt={bookmark.maker.name}
                                          className="w-8 h-8 rounded-full border border-border"
                                        />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-text-primary">{bookmark.maker.name}</p>
                                        {bookmark.maker.bio && (
                                          <p className="text-xs text-text-tertiary">{bookmark.maker.bio}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 통계 정보 */}
                                  <div className="flex items-center gap-4 text-sm text-text-tertiary">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {bookmark.readingTime}분 읽기
                                    </span>
                                    <span>👥 팔로워 {bookmark.views.toLocaleString()}</span>
                                    {bookmark.commentsCount > 0 && (
                                      <span>💬 댓글 {bookmark.commentsCount}</span>
                                    )}
                                  </div>
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => handleRemoveBookmark(e, bookmark.id)}
                                    className="p-2.5 rounded-full hover:bg-red-50 transition-all duration-200 group/btn"
                                  >
                                    <BookmarkX className="w-5 h-5 text-gray-500 group-hover/btn:text-red-500 transition-colors" />
                                  </button>
                                  <button
                                    onClick={(e) => handleShare(e, bookmark)}
                                    className="p-2.5 rounded-full hover:bg-primary-lighter transition-all duration-200"
                                  >
                                    <Share2 className={`w-5 h-5 ${hoveredCard === bookmark.id ? 'text-primary' : 'text-gray-500'}`} />
                                  </button>
                                  {bookmark.websiteUrl && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(bookmark.websiteUrl, '_blank');
                                      }}
                                      className="ml-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                      웹사이트 방문
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 태그 */}
                              <div className="flex flex-wrap gap-2 mt-4">
                                {bookmark.tags.slice(0, 5).map((tag) => (
                                  <span 
                                    key={tag} 
                                    className="px-3 py-1.5 bg-primary-lighter text-text-tertiary text-sm rounded-full hover:bg-primary-light transition-colors cursor-pointer"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 이미지 팝업 모달 (HomePage와 동일) */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-[9999] overflow-y-auto bg-black/90 backdrop-blur-sm animate-fade-in"
          onClick={closeModal}
        >
          <div className="min-h-screen px-4 py-8 md:py-12 flex items-center justify-center">
            <div 
              className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-30 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>

              {/* 이미지 컨테이너 */}
              <div className="relative h-[60vh] md:h-[600px] bg-black">
                {selectedProduct.allImages && selectedProduct.allImages.length > 0 ? (
                  <>
                    {/* 메인 이미지 */}
                    <img
                      src={selectedProduct.allImages[selectedImageIndex]}
                      alt={selectedProduct.title}
                      className="w-full h-full object-contain"
                    />

                    {/* 이미지 네비게이션 */}
                    {selectedProduct.allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-lg transition-all hover:scale-110"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* 이미지 썸네일 */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
                          {selectedProduct.allImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === selectedImageIndex 
                                  ? 'border-primary scale-110' 
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${selectedProduct.title} ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* 상품 정보 섹션 */}
              <div className="bg-white p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                  {/* 북마크 날짜 */}
                  <p className="text-sm text-primary mb-4">
                    북마크 저장일: {new Date(selectedProduct.bookmarkedAt).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>

                  {/* 태그라인 */}
                  {selectedProduct.tagline && (
                    <p className="text-xl text-text-secondary italic mb-4">
                      "{selectedProduct.tagline}"
                    </p>
                  )}

                  {/* 설명 */}
                  <p className="text-lg text-text-secondary leading-relaxed mb-6">
                    {selectedProduct.summaryKorean || selectedProduct.summary}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-text-tertiary mb-6">
                    {selectedProduct.maker && (
                      <div className="flex items-center gap-2">
                        {selectedProduct.maker.avatar && (
                          <img 
                            src={selectedProduct.maker.avatar} 
                            alt={selectedProduct.maker.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-text-primary">{selectedProduct.maker.name}</p>
                          {selectedProduct.maker.bio && (
                            <p className="text-xs">{selectedProduct.maker.bio}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedProduct.publishedAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(selectedProduct.views)} 조회</span>
                    </div>
                    
                    {selectedProduct.commentsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{selectedProduct.commentsCount} 댓글</span>
                      </div>
                    )}
                  </div>

                  {/* 태그 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProduct.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 py-1.5 bg-primary-lighter text-text-tertiary text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.websiteUrl && (
                      <a
                        href={selectedProduct.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors"
                      >
                        웹사이트 방문
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {selectedProduct.original_url && (
                      <a
                        href={selectedProduct.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-all"
                      >
                        Product Hunt에서 보기
                      </a>
                    )}
                    <button
                      onClick={(e) => handleRemoveBookmark(e, selectedProduct.id)}
                      className="p-3 rounded-full border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all"
                    >
                      <BookmarkX className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleShare(e, selectedProduct)}
                      className="p-3 rounded-full border-2 border-gray-300 hover:border-primary hover:text-primary transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전체 삭제 확인 모달 */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-text-primary mb-3">
              모든 북마크 삭제
            </h3>
            <p className="text-text-secondary mb-6">
              정말로 {bookmarks.length}개의 북마크를 모두 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                모두 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* 가로 스크롤바 숨기기 */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BookmarksPage;