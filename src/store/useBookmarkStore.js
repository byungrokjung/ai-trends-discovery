import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useBookmarkStore = create(
  persist(
    (set, get) => ({
      bookmarks: [],
      
      // 북마크 추가
      addBookmark: (product) => {
        const bookmarks = get().bookmarks;
        const exists = bookmarks.some(b => b.id === product.id);
        
        if (!exists) {
          // 필수 정보만 저장하여 localStorage 용량 최적화
          const bookmarkData = {
            id: product.id,
            title: product.title,
            summary: product.summary,
            summaryKorean: product.summaryKorean,
            tagline: product.tagline,
            source: product.source,
            category: product.category,
            publishedAt: product.publishedAt,
            readingTime: product.readingTime,
            imageUrl: product.imageUrl,
            allImages: product.allImages?.slice(0, 3), // 첫 3개 이미지만 저장
            tags: product.tags,
            views: product.views,
            commentsCount: product.commentsCount,
            original_url: product.original_url,
            websiteUrl: product.websiteUrl,
            maker: product.maker,
            bookmarkedAt: new Date().toISOString()
          };
          
          set({ bookmarks: [...bookmarks, bookmarkData] });
          return true;
        }
        return false;
      },
      
      // 북마크 제거
      removeBookmark: (productId) => {
        set(state => ({
          bookmarks: state.bookmarks.filter(b => b.id !== productId)
        }));
      },
      
      // 북마크 여부 확인
      isBookmarked: (productId) => {
        return get().bookmarks.some(b => b.id === productId);
      },
      
      // 북마크 토글
      toggleBookmark: (product) => {
        const isBookmarked = get().isBookmarked(product.id);
        if (isBookmarked) {
          get().removeBookmark(product.id);
          return false;
        } else {
          get().addBookmark(product);
          return true;
        }
      },
      
      // 북마크 개수
      getBookmarkCount: () => {
        return get().bookmarks.length;
      },
      
      // 북마크 초기화
      clearBookmarks: () => {
        set({ bookmarks: [] });
      },
      
      // 북마크 검색
      searchBookmarks: (query) => {
        const bookmarks = get().bookmarks;
        if (!query) return bookmarks;
        
        const lowerQuery = query.toLowerCase();
        return bookmarks.filter(bookmark => {
          return (
            bookmark.title?.toLowerCase().includes(lowerQuery) ||
            bookmark.summary?.toLowerCase().includes(lowerQuery) ||
            bookmark.summaryKorean?.toLowerCase().includes(lowerQuery) ||
            bookmark.tagline?.toLowerCase().includes(lowerQuery) ||
            bookmark.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        });
      },
      
      // 카테고리별 북마크 필터링
      filterBookmarksByCategory: (category) => {
        const bookmarks = get().bookmarks;
        if (category === 'all') return bookmarks;
        
        return bookmarks.filter(bookmark => {
          // HomePage의 matchesCategory 로직과 동일하게 적용
          const categoryMappings = {
            'ai-tools': ['AI 도구', 'ai tools', 'tools', 'productivity', 'automation'],
            'model-release': ['모델 출시', 'model', 'llm', 'gpt', 'claude', 'gemini'],
            'api': ['API', 'developer tools', 'integration', 'sdk'],
            'opensource': ['오픈소스', 'open source', 'github', 'repository']
          };
          
          const mappings = categoryMappings[category] || [];
          const bookmarkCategory = bookmark.category?.toLowerCase() || '';
          const bookmarkTags = bookmark.tags?.map(tag => tag.toLowerCase()) || [];
          const bookmarkTitle = bookmark.title?.toLowerCase() || '';
          const bookmarkSummary = bookmark.summary?.toLowerCase() || '';
          
          return mappings.some(mapping => {
            const lowerMapping = mapping.toLowerCase();
            return bookmarkCategory.includes(lowerMapping) ||
                   bookmarkTags.some(tag => tag.includes(lowerMapping)) ||
                   bookmarkTitle.includes(lowerMapping) ||
                   bookmarkSummary.includes(lowerMapping);
          });
        });
      },
      
      // 북마크 정렬
      sortBookmarks: (sortBy) => {
        const bookmarks = get().bookmarks;
        const sorted = [...bookmarks];
        
        switch (sortBy) {
          case 'latest':
            // 북마크한 시간 기준 최신순
            sorted.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
            break;
          case 'oldest':
            // 북마크한 시간 기준 오래된순
            sorted.sort((a, b) => new Date(a.bookmarkedAt) - new Date(b.bookmarkedAt));
            break;
          case 'popular':
            // 조회수 기준
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
          case 'comments':
            // 댓글 수 기준
            sorted.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
            break;
          default:
            // 기본값: 북마크한 시간 기준 최신순
            sorted.sort((a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt));
        }
        
        return sorted;
      }
    }),
    {
      name: 'ai-trends-bookmarks', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useBookmarkStore