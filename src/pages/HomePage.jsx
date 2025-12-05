import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { TrendingUp, Clock, Bookmark, Share2, X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Eye, MessageCircle, Search, Filter, ChevronDown } from "lucide-react";
import api from "../utils/api";
import { useToast } from "../store/useToastStore";
import useBookmarkStore from "../store/useBookmarkStore";
import Leaderboard from "../components/Leaderboard";
import TrendDetailPanel from "../components/TrendDetailPanel";
import { trendsService } from "../lib/supabase";
import { productsService } from "../lib/productsService";

// 더미 데이터
const dummyTrends = [
  {
    id: 1,
    title: "OpenAI, GPT-5 출시 임박... 인간 수준의 추론 능력 탑재",
    summary: "OpenAI가 차세대 언어 모델 GPT-5를 조만간 공개할 예정입니다. 이번 모델은 인간 수준의 추론 능력과 멀티모달 기능을 대폭 강화했다고 알려져 있습니다.",
    source: "TechCrunch",
    category: "모델 출시",
    publishedAt: "2024-12-17T09:00:00Z",
    readingTime: 5,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    tags: ["GPT-5", "OpenAI", "LLM"],
    koreaRelevance: {
      impact: "한국 AI 스타트업들의 기술 격차 우려, 대기업 도입 검토 중"
    }
  },
  {
    id: 2,
    title: "구글, 제미나이 2.0으로 AI 에이전트 시대 개막",
    summary: "구글이 제미나이 2.0을 발표하며 AI 에이전트 기능을 대폭 강화했습니다. 웹 브라우징, 코딩, 게임 플레이 등 다양한 작업을 자율적으로 수행할 수 있습니다.",
    source: "The Verge",
    category: "AI 에이전트",
    publishedAt: "2024-12-17T07:30:00Z",
    readingTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    tags: ["Gemini", "Google", "AI Agent"],
    koreaRelevance: {
      impact: "네이버, 카카오 등 국내 빅테크 기업들의 대응 전략 수립 중"
    }
  },
  {
    id: 3,
    title: "앤트로픽, 클로드 3.5 한국어 성능 대폭 개선",
    summary: "앤트로픽이 클로드 3.5 업데이트를 통해 한국어 이해와 생성 능력을 크게 향상시켰습니다. 특히 전문 용어와 맥락 이해에서 뛰어난 성능을 보입니다.",
    source: "AI Times",
    category: "모델 업데이트",
    publishedAt: "2024-12-17T06:00:00Z",
    readingTime: 4,
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
    tags: ["Claude", "Anthropic", "한국어"],
    koreaRelevance: {
      impact: "한국 기업들의 클로드 도입 급증 예상, B2B 시장 확대"
    }
  }
];

// 카테고리 정의
const CATEGORIES = [
  { id: 'all', label: '전체', icon: '🎯' },
  { id: 'ai-tools', label: 'AI 도구', icon: '🛠️' },
  { id: 'model-release', label: '모델 출시', icon: '🚀' },
  { id: 'api', label: 'API', icon: '🔌' },
  { id: 'opensource', label: '오픈소스', icon: '📂' },
];

// 정렬 옵션
const SORT_OPTIONS = [
  { id: 'latest', label: '최신순' },
  { id: 'popular', label: '인기순' },
  { id: 'comments', label: '댓글순' },
];

const HomePage = () => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [searchInputValue, setSearchInputValue] = useState(searchParams.get('q') || '');
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);
  const { showToast } = useToast();
  const { toggleBookmark, isBookmarked, getBookmarkCount } = useBookmarkStore();

  useEffect(() => {
    fetchTrends();
  }, []);

  // URL 파라미터 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'latest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [searchQuery, selectedCategory, sortBy]);

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
      const trend = trends.find(t => t.id === hoveredCard);
      if (trend && trend.allImages && trend.allImages.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex(prev => ({
            ...prev,
            [hoveredCard]: ((prev[hoveredCard] || 0) + 1) % trend.allImages.length
          }));
        }, 2000); // 2초마다 이미지 변경
        return () => clearInterval(interval);
      }
    } else {
      // 호버가 끝나면 인덱스 초기화
      setCurrentImageIndex({});
    }
  }, [hoveredCard, trends]);

  // 키보드 이벤트 처리 및 스크롤 방지
  useEffect(() => {
    if (selectedProduct) {
      // 스크롤 방지
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

  // 더 자연스러운 번역 함수
  const translateToKorean = (text) => {
    if (!text) return "";
    
    // 문장 패턴 기반 번역
    const sentencePatterns = [
      // AI 도구 설명 패턴
      { 
        pattern: /^(.+) is an? (.+) that (.+)$/i,
        replacement: (match, p1, p2, p3) => `${p1}은(는) ${translatePhrase(p3)}하는 ${translatePhrase(p2)}입니다`
      },
      {
        pattern: /^(.+) helps you (.+)$/i,
        replacement: (match, p1, p2) => `${p1}은(는) ${translatePhrase(p2)}하는 것을 도와줍니다`
      },
      {
        pattern: /^(.+) allows you to (.+)$/i,
        replacement: (match, p1, p2) => `${p1}을(를) 사용하면 ${translatePhrase(p2)}할 수 있습니다`
      },
      {
        pattern: /^(.+) enables (.+)$/i,
        replacement: (match, p1, p2) => `${p1}은(는) ${translatePhrase(p2)}을(를) 가능하게 합니다`
      },
      {
        pattern: /^(.+) for (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)}을(를) 위한 ${p1}`
      },
      {
        pattern: /^Create (.+) with (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)}로 ${translatePhrase(p1)}을(를) 만드세요`
      },
      {
        pattern: /^Generate (.+) using (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)}을(를) 사용하여 ${translatePhrase(p1)}을(를) 생성하세요`
      },
      {
        pattern: /^Build (.+) in minutes$/i,
        replacement: (match, p1) => `몇 분 만에 ${translatePhrase(p1)}을(를) 구축하세요`
      },
      {
        pattern: /^The (.+) platform for (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)}을(를) 위한 ${translatePhrase(p1)} 플랫폼`
      },
      {
        pattern: /^Your (.+) assistant$/i,
        replacement: (match, p1) => `당신의 ${translatePhrase(p1)} 어시스턴트`
      },
      {
        pattern: /^AI-powered (.+)$/i,
        replacement: (match, p1) => `AI 기반 ${translatePhrase(p1)}`
      },
      {
        pattern: /^Smart (.+) for (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)}을(를) 위한 스마트 ${translatePhrase(p1)}`
      },
      {
        pattern: /^Automate (.+) with AI$/i,
        replacement: (match, p1) => `AI로 ${translatePhrase(p1)}을(를) 자동화하세요`
      },
      {
        pattern: /^Transform (.+) into (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p1)}을(를) ${translatePhrase(p2)}(으)로 변환하세요`
      },
      {
        pattern: /^All-in-one (.+) solution$/i,
        replacement: (match, p1) => `올인원 ${translatePhrase(p1)} 솔루션`
      },
      {
        pattern: /^Next-generation (.+)$/i,
        replacement: (match, p1) => `차세대 ${translatePhrase(p1)}`
      },
      {
        pattern: /^Professional (.+) tool$/i,
        replacement: (match, p1) => `전문가용 ${translatePhrase(p1)} 도구`
      },
      {
        pattern: /^Easy-to-use (.+)$/i,
        replacement: (match, p1) => `사용하기 쉬운 ${translatePhrase(p1)}`
      },
      {
        pattern: /^Fast and (.+)$/i,
        replacement: (match, p1) => `빠르고 ${translatePhrase(p1)}`
      },
      {
        pattern: /^(.+) made simple$/i,
        replacement: (match, p1) => `쉬워진 ${translatePhrase(p1)}`
      },
      {
        pattern: /^(.+) without (.+)$/i,
        replacement: (match, p1, p2) => `${translatePhrase(p2)} 없이 ${translatePhrase(p1)}`
      },
      {
        pattern: /^(.+) in seconds$/i,
        replacement: (match, p1) => `몇 초 만에 ${translatePhrase(p1)}`
      },
      {
        pattern: /^(.+) at scale$/i,
        replacement: (match, p1) => `대규모 ${translatePhrase(p1)}`
      }
    ];

    // 구문 번역 도우미
    function translatePhrase(phrase) {
      // 일반적인 구문 번역
      const phraseTranslations = {
        // 동작
        "create content": "콘텐츠 생성",
        "generate images": "이미지 생성",
        "write code": "코드 작성",
        "build apps": "앱 개발",
        "manage projects": "프로젝트 관리",
        "analyze data": "데이터 분석",
        "track performance": "성능 추적",
        "optimize workflow": "워크플로우 최적화",
        "automate tasks": "작업 자동화",
        "collaborate with team": "팀 협업",
        "design graphics": "그래픽 디자인",
        "edit videos": "비디오 편집",
        "schedule posts": "게시물 예약",
        "monitor metrics": "지표 모니터링",
        "generate reports": "보고서 생성",
        "manage customers": "고객 관리",
        "process documents": "문서 처리",
        "train models": "모델 학습",
        "deploy applications": "애플리케이션 배포",
        "secure data": "데이터 보안",
        
        // 기능/특성
        "artificial intelligence": "인공지능",
        "machine learning": "머신러닝",
        "natural language processing": "자연어 처리",
        "computer vision": "컴퓨터 비전",
        "deep learning": "딥러닝",
        "neural network": "신경망",
        "data science": "데이터 사이언스",
        "business intelligence": "비즈니스 인텔리전스",
        "customer relationship": "고객 관계",
        "project management": "프로젝트 관리",
        "content creation": "콘텐츠 제작",
        "social media": "소셜 미디어",
        "email marketing": "이메일 마케팅",
        "search engine": "검색 엔진",
        "cloud storage": "클라우드 저장소",
        "real-time collaboration": "실시간 협업",
        "task automation": "작업 자동화",
        "workflow optimization": "워크플로우 최적화",
        "performance tracking": "성능 추적",
        "analytics dashboard": "분석 대시보드",
        
        // 대상
        "small businesses": "소규모 비즈니스",
        "large enterprises": "대기업",
        "creative professionals": "크리에이티브 전문가",
        "marketing teams": "마케팅 팀",
        "sales teams": "영업 팀",
        "developers": "개발자",
        "designers": "디자이너",
        "content creators": "콘텐츠 크리에이터",
        "project managers": "프로젝트 매니저",
        "data scientists": "데이터 과학자",
        "business owners": "사업주",
        "freelancers": "프리랜서",
        "agencies": "에이전시",
        "startups": "스타트업",
        "educators": "교육자",
        "students": "학생",
        "researchers": "연구원",
        
        // 기타 주요 용어
        "AI": "AI",
        "API": "API",
        "SDK": "SDK",
        "UI": "UI",
        "UX": "UX",
        "SEO": "SEO",
        "CRM": "CRM",
        "ERP": "ERP",
        "SaaS": "SaaS",
        "B2B": "B2B",
        "B2C": "B2C",
        "IoT": "IoT",
        "AR": "AR",
        "VR": "VR",
        "3D": "3D",
        "2D": "2D",
        
        // 형용사구
        "easy to use": "사용하기 쉬운",
        "user friendly": "사용자 친화적인",
        "highly scalable": "확장성이 뛰어난",
        "fully automated": "완전 자동화된",
        "cloud based": "클라우드 기반",
        "open source": "오픈 소스",
        "enterprise grade": "엔터프라이즈급",
        "production ready": "프로덕션 준비 완료",
        "battle tested": "실전 검증된",
        "cutting edge": "최첨단",
        "state of the art": "최신 기술",
        "next generation": "차세대",
        "all in one": "올인원",
        "plug and play": "즉시 사용 가능한",
        "drag and drop": "드래그 앤 드롭",
        "no code": "노코드",
        "low code": "로우코드",
        "real time": "실시간",
        "high performance": "고성능",
        "cost effective": "비용 효율적인"
      };

      // 구문 번역
      let translatedPhrase = phrase.toLowerCase();
      Object.keys(phraseTranslations).forEach(key => {
        const regex = new RegExp(key, 'gi');
        translatedPhrase = translatedPhrase.replace(regex, phraseTranslations[key]);
      });

      // 남은 개별 단어 번역
      const wordTranslations = {
        "platform": "플랫폼",
        "tool": "도구",
        "app": "앱",
        "application": "애플리케이션",
        "software": "소프트웨어",
        "service": "서비스",
        "solution": "솔루션",
        "system": "시스템",
        "engine": "엔진",
        "generator": "생성기",
        "builder": "빌더",
        "editor": "에디터",
        "manager": "매니저",
        "assistant": "어시스턴트",
        "dashboard": "대시보드",
        "interface": "인터페이스",
        "workspace": "워크스페이스",
        "database": "데이터베이스",
        "api": "API",
        "integration": "통합",
        "automation": "자동화",
        "workflow": "워크플로우",
        "process": "프로세스",
        "feature": "기능",
        "update": "업데이트",
        "version": "버전",
        "premium": "프리미엄",
        "professional": "전문가용",
        "enterprise": "엔터프라이즈",
        "business": "비즈니스",
        "marketing": "마케팅",
        "sales": "영업",
        "analytics": "분석",
        "data": "데이터",
        "content": "콘텐츠",
        "media": "미디어",
        "video": "비디오",
        "audio": "오디오",
        "image": "이미지",
        "document": "문서",
        "file": "파일",
        "email": "이메일",
        "chat": "채팅",
        "team": "팀",
        "project": "프로젝트",
        "task": "작업",
        "report": "보고서",
        "insight": "인사이트",
        "metric": "지표",
        "performance": "성능",
        "security": "보안",
        "privacy": "프라이버시",
        "cloud": "클라우드",
        "mobile": "모바일",
        "desktop": "데스크톱",
        "web": "웹",
        "online": "온라인",
        "offline": "오프라인",
        "free": "무료",
        "paid": "유료",
        "trial": "평가판",
        "demo": "데모",
        "support": "지원",
        "help": "도움말",
        "guide": "가이드",
        "tutorial": "튜토리얼",
        "training": "교육",
        "certification": "인증",
        "community": "커뮤니티",
        "forum": "포럼",
        "blog": "블로그",
        "news": "뉴스",
        "release": "릴리스",
        "launch": "출시",
        "beta": "베타",
        "alpha": "알파",
        "stable": "안정",
        "latest": "최신",
        "new": "신규",
        "improved": "개선된",
        "enhanced": "향상된",
        "advanced": "고급",
        "simple": "간단한",
        "easy": "쉬운",
        "fast": "빠른",
        "powerful": "강력한",
        "efficient": "효율적인",
        "secure": "안전한",
        "reliable": "신뢰할 수 있는",
        "scalable": "확장 가능한",
        "flexible": "유연한",
        "customizable": "커스터마이징 가능한",
        "automated": "자동화된",
        "intelligent": "지능적인",
        "smart": "스마트",
        "modern": "현대적인",
        "innovative": "혁신적인",
        "unique": "독특한",
        "best": "최고의",
        "top": "상위",
        "leading": "선도적인",
        "popular": "인기 있는",
        "trusted": "신뢰받는",
        "recommended": "추천하는",
        "featured": "주목받는",
        "exclusive": "독점적인",
        "limited": "제한된",
        "unlimited": "무제한",
        "instant": "즉시",
        "real-time": "실시간",
        "live": "라이브",
        "interactive": "인터랙티브",
        "responsive": "반응형",
        "adaptive": "적응형",
        "dynamic": "동적",
        "static": "정적",
        "custom": "맞춤",
        "personal": "개인",
        "private": "비공개",
        "public": "공개",
        "shared": "공유",
        "collaborative": "협업",
        "social": "소셜",
        "global": "글로벌",
        "local": "로컬",
        "international": "국제",
        "worldwide": "전 세계",
        "universal": "유니버설",
        "cross-platform": "크로스 플랫폼",
        "multi-platform": "멀티 플랫폼",
        "native": "네이티브",
        "hybrid": "하이브리드"
      };

      // 남은 단어들 번역
      Object.keys(wordTranslations).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        translatedPhrase = translatedPhrase.replace(regex, wordTranslations[key]);
      });

      return translatedPhrase;
    }

    // 문장 패턴 적용
    let translatedText = text;
    let patternMatched = false;

    for (const {pattern, replacement} of sentencePatterns) {
      if (pattern.test(text)) {
        translatedText = text.replace(pattern, replacement);
        patternMatched = true;
        break;
      }
    }

    // 패턴이 매치되지 않으면 일반 번역
    if (!patternMatched) {
      translatedText = translatePhrase(text);
      
      // 문장 끝 정리
      if (!translatedText.endsWith('.') && !translatedText.endsWith('!') && !translatedText.endsWith('?')) {
        translatedText += '.';
      }
    }

    // 첫 글자 대문자 유지
    translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);

    return translatedText;
  };

  const fetchTrends = async () => {
    try {
      setLoading(true);
      
      // Supabase에서 products와 makers 데이터 함께 가져오기
      const data = await productsService.getProductsWithMakers(12);
      console.log("Products with Makers 데이터:", data);
      
      // 실제 데이터가 있으면 첫 번째 아이템의 구조 확인
      if (data && data.length > 0) {
        console.log("첫 번째 제품 구조:", Object.keys(data[0]));
      }
      
      // products 데이터를 브런치 스타일 카드에 맞게 변환
      const formattedTrends = data.map(product => ({
        id: product.id,
        title: product.product_name || "제목 없음",
        summary: product.product_description || product.product_tagline || "AI 기반의 혁신적인 도구입니다.",
        summaryKorean: translateToKorean(product.product_description || product.product_tagline || ""),
        tagline: product.product_tagline || "",
        source: "Product Hunt",
        category: product.topics && Array.isArray(product.topics) && product.topics.length > 0 
          ? product.topics[0] 
          : "AI 도구",
        publishedAt: product.created_at || new Date().toISOString(),
        readingTime: Math.max(3, Math.ceil((product.product_description?.length || 300) / 300)),
        imageUrl: product.media_gallery && product.media_gallery.length > 0 
          ? product.media_gallery[0] 
          : `https://source.unsplash.com/800x600/?artificial-intelligence,technology,${encodeURIComponent(product.product_name || 'AI')}`,
        allImages: product.media_gallery || [],
        tags: product.topics || ["AI", "혁신", "자동화"],
        importance: product.daily_rank ? (11 - Math.min(product.daily_rank, 10)) : 5,
        views: product.followers_count || Math.floor(Math.random() * 1000),
        commentsCount: product.comments_count || 0,
        original_url: product.product_url || product.website_url || "#",
        websiteUrl: product.website_url,
        // maker 정보 추가 (연결된 경우)
        maker: product.makers ? {
          name: product.makers.name || "Unknown Maker",
          avatar: product.makers.avatar_url,
          bio: product.makers.headline,
          username: product.makers.username
        } : null
      }));
      
      setTrends(formattedTrends.length > 0 ? formattedTrends : dummyTrends);
      
      if (formattedTrends.length === 0) {
        showToast("아직 수집된 제품이 없습니다. 더미 데이터를 표시합니다.", "info");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("데이터를 불러오는 중 오류가 발생했습니다.", "error");
      // 에러 시에도 더미 데이터 표시
      setTrends(dummyTrends);
    } finally {
      setLoading(false);
    }
  };

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

  const handleBookmark = (e, trend) => {
    e.preventDefault();
    e.stopPropagation();
    const wasAdded = toggleBookmark(trend);
    if (wasAdded) {
      showToast("북마크에 저장되었습니다.", "success");
    } else {
      showToast("북마크에서 제거되었습니다.", "info");
    }
  };

  const handleShare = (e, trend) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${trend.title} - ${window.location.origin}/trends/${trend.id}`);
    showToast("링크가 복사되었습니다.", "success");
  };

  // 카테고리 매칭 함수
  const matchesCategory = (trend, category) => {
    if (category === 'all') return true;
    
    const categoryMappings = {
      'ai-tools': ['AI 도구', 'ai tools', 'tools', 'productivity', 'automation'],
      'model-release': ['모델 출시', 'model', 'llm', 'gpt', 'claude', 'gemini'],
      'api': ['API', 'developer tools', 'integration', 'sdk'],
      'opensource': ['오픈소스', 'open source', 'github', 'repository']
    };
    
    const mappings = categoryMappings[category] || [];
    const trendCategory = trend.category?.toLowerCase() || '';
    const trendTags = trend.tags?.map(tag => tag.toLowerCase()) || [];
    const trendTitle = trend.title?.toLowerCase() || '';
    const trendSummary = trend.summary?.toLowerCase() || '';
    
    return mappings.some(mapping => {
      const lowerMapping = mapping.toLowerCase();
      return trendCategory.includes(lowerMapping) ||
             trendTags.some(tag => tag.includes(lowerMapping)) ||
             trendTitle.includes(lowerMapping) ||
             trendSummary.includes(lowerMapping);
    });
  };

  // 필터링 및 정렬된 트렌드
  const filteredAndSortedTrends = useMemo(() => {
    let filtered = trends;
    
    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trend => {
        return (
          trend.title?.toLowerCase().includes(query) ||
          trend.summary?.toLowerCase().includes(query) ||
          trend.summaryKorean?.toLowerCase().includes(query) ||
          trend.tagline?.toLowerCase().includes(query) ||
          trend.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }
    
    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(trend => matchesCategory(trend, selectedCategory));
    }
    
    // 정렬
    const sorted = [...filtered];
    switch (sortBy) {
      case 'popular':
        sorted.sort((a, b) => {
          // 뷰 수로 정렬, 같으면 중요도로 정렬
          if (b.views !== a.views) return b.views - a.views;
          return b.importance - a.importance;
        });
        break;
      case 'comments':
        sorted.sort((a, b) => {
          // 댓글 수로 정렬, 같으면 뷰 수로 정렬
          if (b.commentsCount !== a.commentsCount) return b.commentsCount - a.commentsCount;
          return b.views - a.views;
        });
        break;
      case 'latest':
      default:
        sorted.sort((a, b) => {
          // 먼저 중요도로 정렬, 같으면 날짜로 정렬
          if (b.importance !== a.importance) {
            return b.importance - a.importance;
          }
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        });
        break;
    }
    
    return sorted;
  }, [trends, searchQuery, selectedCategory, sortBy]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // 정렬 변경 핸들러
  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
  }, []);

  const handleImageClick = (e, trend) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(trend);
    setSelectedImageIndex(currentImageIndex[trend.id] || 0);
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
              <TrendingUp className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-text-primary">AI Trends</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-text-secondary hover:text-primary transition-colors">홈</Link>
              <Link to="/huggingface" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1">
                <span>🤗</span> HuggingFace
              </Link>
              <Link to="/deep-dive" className="text-text-secondary hover:text-primary transition-colors">심층 분석</Link>
              <Link to="/korean" className="text-text-secondary hover:text-primary transition-colors">한국 시장</Link>
              <Link to="/resources" className="text-text-secondary hover:text-primary transition-colors">리소스</Link>
              <Link to="/bookmarks" className="text-text-secondary hover:text-primary transition-colors relative">
                북마크
                {getBookmarkCount() > 0 && (
                  <span className="absolute -top-1 -right-4 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getBookmarkCount()}
                  </span>
                )}
              </Link>
            </nav>

            <button className="btn-primary">
              구독하기
            </button>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-article mx-auto text-center">
          <h1 className="font-display text-display-lg font-light mb-6 leading-tight animate-fade-up text-text-primary">
            AI 트렌드를
            <br />
            <span className="text-accent font-normal">한눈에</span> 파악하세요
          </h1>
          <p className="text-xl text-text-secondary mb-10 animate-fade-up animation-delay-200 font-light">
            매일 쏟아지는 AI 뉴스를 큐레이션하고
            <br />
            실무에 바로 적용 가능한 도구들을 소개합니다
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-up animation-delay-400">
            <button className="btn-primary">
              오늘의 브리핑 보기
            </button>
            <Link to="/huggingface" className="btn-ghost flex items-center gap-2">
              <span className="text-xl">🤗</span>
              HuggingFace 트렌드 보기
            </Link>
            <button className="btn-ghost">
              무료로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* 검색 및 필터 섹션 - 깔끔한 디자인 */}
      <section className="sticky top-16 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* 상단 검색바와 정렬 옵션 */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            {/* 검색바 - 더 심플하게 */}
            <div className="relative flex-1 max-w-2xl w-full">
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="AI 도구, 모델, API 검색..."
                value={searchInputValue}
                onChange={(e) => setSearchInputValue(e.target.value)}
                className="w-full pl-12 md:pl-14 pr-10 md:pr-12 py-3 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white transition-all duration-200 text-sm md:text-base"
              />
              {searchInputValue && (
                <button
                  onClick={() => {
                    setSearchInputValue('');
                    setSearchQuery('');
                  }}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 md:w-5 h-4 md:h-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* 정렬 옵션 - 라디오 버튼 스타일 */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg self-center">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSortChange(option.id)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all duration-200 ${
                    sortBy === option.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 필터 - 태그 스타일로 개선 */}
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <span className="hidden md:inline text-sm font-medium text-gray-700 flex-shrink-0">카테고리:</span>
            <div className="flex items-center gap-1.5 md:gap-2 pb-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm md:text-base">{category.icon}</span>
                  <span>{category.label}</span>
                  {selectedCategory === category.id && filteredAndSortedTrends.length > 0 && (
                    <span className="ml-1 bg-white/20 rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs">
                      {filteredAndSortedTrends.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 검색 결과 정보 - 심플하게 */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">검색 결과:</span>
                <div className="flex items-center gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                      <Search className="w-3 h-3" />
                      <span className="font-medium text-gray-900">{searchQuery}</span>
                    </span>
                  )}
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                      <span>{CATEGORIES.find(cat => cat.id === selectedCategory)?.icon}</span>
                      <span className="font-medium text-gray-900">
                        {CATEGORIES.find(cat => cat.id === selectedCategory)?.label}
                      </span>
                    </span>
                  )}
                  <span className="font-medium text-gray-900">
                    총 {filteredAndSortedTrends.length}개
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchInputValue('');
                  setSelectedCategory('all');
                  setSortBy('latest');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 트렌드 리스트 - 브런치 스타일 카드 */}
      <section className="pb-20 bg-background-secondary">
        <div className="max-w-wide mx-auto px-6">
          {/* 섹션 헤더 - 브런치 스타일 */}
          <div className="mb-16 text-center">
            <span className="inline-block text-primary-accent text-sm font-medium mb-4 tracking-wider uppercase">TODAY'S PICK</span>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-6 text-text-primary">
              오늘의 AI 프로덕트
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed font-light">
              실무에 바로 적용 가능한 AI 도구들을 엄선했습니다
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-text-tertiary">새로운 AI 프로덕트를 불러오는 중...</div>
            </div>
          ) : filteredAndSortedTrends.length === 0 ? (
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
              <div className="grid grid-cols-1 gap-6">
                {filteredAndSortedTrends.map((trend) => (
                <article
                  key={trend.id}
                  className="group"
                >
                  <div
                    className="block cursor-pointer"
                    onClick={() => setSelectedTrend(trend)}
                    onMouseEnter={() => setHoveredCard(trend.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="bg-background-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row border border-border-light">
                      {/* 왼쪽 이미지 갤러리 영역 */}
                      <div 
                        className="relative w-full md:w-96 h-64 md:h-72 bg-background-tertiary flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={(e) => handleImageClick(e, trend)}
                      >
                        {trend.allImages && trend.allImages.length > 0 ? (
                          <div className="relative h-full">
                            {/* 슬라이드쇼 이미지 */}
                            <div className="relative h-full">
                              {trend.allImages.map((img, idx) => (
                                <div
                                  key={idx}
                                  className={`absolute inset-0 transition-opacity duration-1000 ${
                                    idx === (currentImageIndex[trend.id] || 0) ? 'opacity-100' : 'opacity-0'
                                  }`}
                                >
                                  <img
                                    src={img}
                                    alt={`${trend.title} ${idx + 1}`}
                                    className={`w-full h-full object-cover transition-all duration-700 ${
                                      hoveredCard === trend.id 
                                        ? 'scale-110 brightness-75 contrast-110' 
                                        : 'scale-100 brightness-100 contrast-100'
                                    }`}
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                            
                            {/* 이미지 인디케이터 (여러 개일 때만) */}
                            {trend.allImages.length > 1 && hoveredCard === trend.id && (
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                                {trend.allImages.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      idx === (currentImageIndex[trend.id] || 0)
                                        ? 'bg-white w-6'
                                        : 'bg-white/50'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* 이미지가 없을 때 */
                          <img
                            src={trend.imageUrl}
                            alt={trend.title}
                            className={`w-full h-full object-cover transition-all duration-700 ${
                              hoveredCard === trend.id 
                                ? 'scale-110 brightness-75 contrast-110' 
                                : 'scale-100 brightness-100 contrast-100'
                            }`}
                            loading="lazy"
                          />
                        )}
                        
                        {/* 호버 시 상세 정보 오버레이 */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 ${
                          hoveredCard === trend.id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}>
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-500">
                            <h4 className="text-lg font-bold mb-2">{trend.title}</h4>
                            <p className="text-sm mb-3 line-clamp-2">{trend.tagline || trend.summary}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {trend.maker && (
                                  <div className="flex items-center gap-2">
                                    {trend.maker.avatar && (
                                      <img 
                                        src={trend.maker.avatar} 
                                        alt={trend.maker.name}
                                        className="w-6 h-6 rounded-full border border-white/50"
                                      />
                                    )}
                                    <span className="text-xs">{trend.maker.name}</span>
                                  </div>
                                )}
                                <span className="text-xs opacity-75">•</span>
                                <span className="text-xs opacity-75">{trend.category}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span>👥 {formatNumber(trend.views)}</span>
                                {trend.commentsCount > 0 && <span>💬 {trend.commentsCount}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 카테고리 뱃지 - 우측 상단 (호버 시 사라짐) */}
                        <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
                          hoveredCard === trend.id ? 'opacity-0' : 'opacity-100'
                        }`}>
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary text-sm font-medium rounded-full shadow-sm">
                            {trend.category}
                          </span>
                        </div>
                        
                        {/* 이미지 수 표시 (호버 시에만) */}
                        {trend.allImages && trend.allImages.length > 1 && (
                          <div className={`absolute top-4 right-4 transition-opacity duration-300 ${
                            hoveredCard === trend.id ? 'opacity-100' : 'opacity-0'
                          }`}>
                            <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-md">
                              📷 {trend.allImages.length}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 오른쪽 콘텐츠 영역 */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col">
                        {/* 메타 정보 */}
                        <div className="flex items-center gap-3 mb-3 text-sm text-text-tertiary">
                          <span className="font-medium">{trend.source}</span>
                          <span>·</span>
                          <span>{formatDate(trend.publishedAt)}</span>
                          {trend.importance > 7 && (
                            <>
                              <span>·</span>
                              <span className="text-accent font-medium">🔥 HOT</span>
                            </>
                          )}
                        </div>

                        {/* 제목 */}
                        <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-primary transition-colors">
                          {trend.title}
                        </h3>

                        {/* Tagline - 영어 */}
                        {trend.tagline && (
                          <p className="text-lg text-text-tertiary mb-3 italic">
                            "{trend.tagline}"
                          </p>
                        )}

                        {/* 요약 - 한국어로 번역된 설명 */}
                        <p className="text-text-secondary mb-6 line-clamp-3 md:line-clamp-4 text-base leading-relaxed">
                          {trend.summaryKorean || trend.summary}
                        </p>

                        {/* 하단 정보 - 스페이서로 하단 정렬 */}
                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              {/* 메이커 정보 */}
                              {trend.maker && (
                                <div className="flex items-center gap-2">
                                  {trend.maker.avatar && (
                                    <img 
                                      src={trend.maker.avatar} 
                                      alt={trend.maker.name}
                                      className="w-8 h-8 rounded-full border border-border"
                                    />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-text-primary">{trend.maker.name}</p>
                                    {trend.maker.bio && (
                                      <p className="text-xs text-text-tertiary">{trend.maker.bio}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* 통계 정보 */}
                              <div className="flex items-center gap-4 text-sm text-text-tertiary">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {trend.readingTime}분 읽기
                                </span>
                                <span>👥 팔로워 {trend.views.toLocaleString()}</span>
                                {trend.commentsCount > 0 && (
                                  <span>💬 댓글 {trend.commentsCount}</span>
                                )}
                              </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleBookmark(e, trend)}
                                className="p-2.5 rounded-full hover:bg-primary-lighter transition-all duration-200"
                              >
                                <Bookmark className={`w-5 h-5 transition-all ${isBookmarked(trend.id) ? 'text-primary fill-primary' : hoveredCard === trend.id ? 'text-primary' : 'text-gray-500'}`} />
                              </button>
                              <button
                                onClick={(e) => handleShare(e, trend)}
                                className="p-2.5 rounded-full hover:bg-primary-lighter transition-all duration-200"
                              >
                                <Share2 className={`w-5 h-5 ${hoveredCard === trend.id ? 'text-primary' : 'text-gray-500'}`} />
                              </button>
                              {trend.websiteUrl && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(trend.websiteUrl, '_blank');
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
                            {trend.tags.slice(0, 5).map((tag) => (
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
                  </div>
                </article>
                ))}
              </div>
            )}

          {/* 더 보기 버튼 - 브런치 스타일 */}
          {filteredAndSortedTrends.length > 0 && (
            <div className="mt-20 text-center">
              <button className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-text-secondary border-2 border-border rounded-full hover:border-primary hover:text-primary transition-all duration-300">
                더 많은 프로덕트 보기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* HuggingFace 섹션 */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-wide mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4 text-text-primary flex items-center justify-center gap-3">
              <span className="text-5xl">🤗</span>
              HuggingFace 트렌드
            </h2>
            <p className="text-xl text-text-secondary">
              최신 AI 모델과 데이터셋을 발견하고, AI가 추천하는 모델을 찾아보세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/huggingface" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-yellow-200 hover:border-yellow-400">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">인기 모델</h3>
              <p className="text-gray-600">최신 트렌드 AI 모델들을 둘러보세요</p>
            </Link>
            
            <Link to="/huggingface" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-green-200 hover:border-green-400">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">데이터셋</h3>
              <p className="text-gray-600">다양한 AI 학습용 데이터셋 탐색</p>
            </Link>
            
            <Link to="/huggingface" className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-purple-200 hover:border-purple-400">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">AI 추천</h3>
              <p className="text-gray-600">GPT & Claude가 추천하는 맞춤 모델</p>
            </Link>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/huggingface" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium">
              HuggingFace 트렌드 모두 보기
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 리더보드 섹션 */}
      <Leaderboard />

      {/* 이미지 팝업 모달 - 브런치 스타일 */}
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
              {/* 닫기 버튼 - 우측 상단 고정 */}
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
                    onClick={(e) => handleBookmark(e, selectedProduct)}
                    className={`p-3 rounded-full border-2 transition-all ${
                      isBookmarked(selectedProduct.id) 
                        ? 'border-primary text-primary' 
                        : 'border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked(selectedProduct.id) ? 'fill-current' : ''}`} />
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
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* 가로 스크롤바 숨기기 */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>

      {/* 트렌드 상세 정보 패널 */}
      <TrendDetailPanel
        trend={selectedTrend}
        isOpen={!!selectedTrend}
        onClose={() => setSelectedTrend(null)}
        trends={filteredAndSortedTrends}
        onTrendClick={(trend) => {
          setSelectedTrend(trend);
        }}
      />
    </div>
  );
};

export default HomePage;