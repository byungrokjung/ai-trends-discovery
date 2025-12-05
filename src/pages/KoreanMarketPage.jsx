import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, TrendingUp, Users, Calendar, ExternalLink, Filter, Search, MapPin, Zap, Award, ChevronRight, Sparkles, Globe, BarChart3, Target, Megaphone, Loader2, RefreshCw, ArrowUpRight, Bookmark, Share2, Heart, MessageCircle, Clock, Hash } from 'lucide-react';
import { useToast } from '../store/useToastStore';
import { koreanMarketService } from '../services/koreanMarketService';

const KoreanMarketPage = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState([]);
  const [useCasesData, setUseCasesData] = useState([]);
  const [companiesData, setCompaniesData] = useState([]);
  const [trendsData, setTrendsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  // 한국 AI 뉴스 더미 데이터
  const koreanAINews = [
    {
      id: 1,
      title: "네이버, 하이퍼클로바X 기반 B2B 서비스 '클로바 스튜디오' 정식 출시",
      summary: "네이버가 자체 개발한 초거대 AI 하이퍼클로바X를 활용한 B2B 서비스를 본격화합니다. 기업들이 쉽게 AI를 도입할 수 있도록 API와 맞춤형 솔루션을 제공합니다.",
      company: "네이버",
      date: "2024-03-15",
      category: "서비스 출시",
      impact: "국내 기업의 AI 도입 문턱을 낮추고 디지털 전환 가속화 예상",
      tags: ["하이퍼클로바X", "B2B", "API"],
      link: "https://www.naver.com"
    },
    {
      id: 2,
      title: "카카오브레인, 멀티모달 AI 'KoGPT' 성능 대폭 개선",
      summary: "카카오브레인이 한국어에 특화된 멀티모달 AI 모델을 공개했습니다. 텍스트와 이미지를 동시에 이해하고 생성할 수 있어 다양한 산업 분야 적용이 기대됩니다.",
      company: "카카오브레인",
      date: "2024-03-14",
      category: "기술 발표",
      impact: "콘텐츠 제작, 이커머스 등에서 혁신적인 서비스 개발 가능",
      tags: ["KoGPT", "멀티모달", "한국어AI"],
      link: "https://www.kakaobrain.com"
    },
    {
      id: 3,
      title: "삼성전자, 온디바이스 AI '가우스2' 갤럭시 S25 탑재 확정",
      summary: "삼성전자가 자체 개발한 온디바이스 AI 가우스2를 차세대 갤럭시 스마트폰에 탑재합니다. 클라우드 연결 없이도 강력한 AI 기능을 제공할 예정입니다.",
      company: "삼성전자",
      date: "2024-03-13",
      category: "제품 발표",
      impact: "개인정보 보호 강화 및 실시간 AI 처리로 사용자 경험 혁신",
      tags: ["가우스", "온디바이스AI", "갤럭시"],
      link: "https://www.samsung.com"
    },
    {
      id: 4,
      title: "LG AI연구원, 산업특화 AI '엑사원 2.0' 공개",
      summary: "LG AI연구원이 제조, 바이오, 화학 등 산업 분야에 특화된 AI 모델을 발표했습니다. 도메인 전문성을 갖춘 AI로 산업 현장의 문제를 해결합니다.",
      company: "LG AI연구원",
      date: "2024-03-12",
      category: "연구 성과",
      impact: "국내 제조업의 AI 전환 가속화 및 생산성 향상 기대",
      tags: ["엑사원", "산업AI", "제조업"],
      link: "https://www.lgresearch.ai"
    }
  ];

  // 산업별 적용 사례 더미 데이터
  const industryUseCases = [
    {
      id: 1,
      company: "신한은행",
      industry: "금융",
      title: "AI 기반 실시간 이상거래 탐지 시스템 구축",
      description: "머신러닝을 활용하여 금융 사기를 실시간으로 탐지하는 시스템을 구축했습니다. 기존 대비 사기 탐지율 85% 향상, 오탐률 60% 감소를 달성했습니다.",
      aiTech: ["이상 탐지", "머신러닝", "실시간 분석"],
      results: {
        detection: "+85%",
        falsePositive: "-60%",
        responseTime: "0.3초"
      },
      implementation: "자체 개발 + AWS SageMaker",
      period: "6개월",
      investment: "15억원"
    },
    {
      id: 2,
      company: "CJ대한통운",
      industry: "물류",
      title: "AI 물류 최적화로 배송 효율 30% 개선",
      description: "AI 기반 경로 최적화와 수요 예측을 통해 배송 효율을 획기적으로 개선했습니다. 실시간 교통 정보와 날씨를 고려한 동적 라우팅을 구현했습니다.",
      aiTech: ["경로 최적화", "수요 예측", "컴퓨터 비전"],
      results: {
        efficiency: "+30%",
        cost: "-25%",
        satisfaction: "+40%"
      },
      implementation: "네이버 클로바 + 자체 시스템",
      period: "8개월",
      investment: "20억원"
    },
    {
      id: 3,
      company: "삼성서울병원",
      industry: "의료",
      title: "AI 진단 보조 시스템으로 암 조기 발견율 향상",
      description: "딥러닝 기반 의료 영상 분석 시스템을 도입하여 폐암, 유방암의 조기 발견율을 크게 향상시켰습니다. 의료진의 진단 시간도 50% 단축되었습니다.",
      aiTech: ["의료 영상 분석", "딥러닝", "진단 보조"],
      results: {
        accuracy: "97.5%",
        earlyDetection: "+45%",
        timeReduction: "-50%"
      },
      implementation: "뷰노 + VUNO Med",
      period: "12개월",
      investment: "30억원"
    },
    {
      id: 4,
      company: "현대자동차",
      industry: "제조",
      title: "AI 품질 검사 시스템으로 불량률 90% 감소",
      description: "컴퓨터 비전과 딥러닝을 활용한 실시간 품질 검사 시스템을 구축했습니다. 미세한 결함도 정확히 탐지하여 품질을 대폭 개선했습니다.",
      aiTech: ["컴퓨터 비전", "품질 검사", "예지 보전"],
      results: {
        defectRate: "-90%",
        inspection: "100%",
        productivity: "+25%"
      },
      implementation: "자체 개발 + 마키나락스",
      period: "10개월",
      investment: "50억원"
    },
    {
      id: 5,
      company: "11번가",
      industry: "이커머스",
      title: "AI 추천 시스템으로 구매 전환율 2배 상승",
      description: "고객 행동 분석과 협업 필터링을 결합한 AI 추천 시스템을 구축했습니다. 개인화된 상품 추천으로 고객 만족도와 매출이 크게 증가했습니다.",
      aiTech: ["추천 시스템", "자연어 처리", "고객 분석"],
      results: {
        conversion: "+200%",
        revenue: "+35%",
        retention: "+50%"
      },
      implementation: "SK C&C + 자체 개발",
      period: "9개월",
      investment: "25억원"
    }
  ];

  // 한국 AI 기업들
  const koreanAICompanies = [
    { name: "네이버", logo: "🟢", focus: "하이퍼클로바X, 검색 AI" },
    { name: "카카오", logo: "🟡", focus: "KoGPT, 대화형 AI" },
    { name: "삼성전자", logo: "🔵", focus: "가우스, 온디바이스 AI" },
    { name: "LG AI연구원", logo: "🔴", focus: "엑사원, 산업 AI" },
    { name: "뷰노", logo: "🟣", focus: "의료 AI, 진단 보조" },
    { name: "업스테이지", logo: "🟠", focus: "Solar LLM, 문서 AI" }
  ];

  // 뉴스 데이터 가져오기
  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await koreanMarketService.getNews({
        page: currentPage,
        industry: selectedIndustry === 'all' ? null : selectedIndustry,
        search: searchQuery
      });
      
      if (response.success) {
        setNewsData(response.data || koreanAINews);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('뉴스 로드 실패:', error);
      // 실패 시 더미 데이터 사용
      setNewsData(koreanAINews);
    } finally {
      setLoading(false);
    }
  };

  // 적용 사례 데이터 가져오기
  const fetchUseCases = async () => {
    setLoading(true);
    try {
      const response = await koreanMarketService.getUseCases({
        industry: selectedIndustry === 'all' ? null : selectedIndustry,
        search: searchQuery
      });
      
      if (response.success) {
        setUseCasesData(response.data || industryUseCases);
      }
    } catch (error) {
      console.error('사례 로드 실패:', error);
      // 실패 시 더미 데이터 사용
      setUseCasesData(industryUseCases);
    } finally {
      setLoading(false);
    }
  };

  // 기업 데이터 가져오기
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await koreanMarketService.getCompanies();
      
      if (response.success) {
        setCompaniesData(response.data || koreanAICompanies);
      }
    } catch (error) {
      console.error('기업 로드 실패:', error);
      // 실패 시 더미 데이터 사용
      setCompaniesData(koreanAICompanies);
    } finally {
      setLoading(false);
    }
  };

  // 트렌드 데이터 가져오기
  const fetchTrends = async () => {
    try {
      const response = await koreanMarketService.getTrends(7);
      if (response.success) {
        setTrendsData(response.data);
      }
    } catch (error) {
      console.error('트렌드 로드 실패:', error);
    }
  };

  // 데이터 새로고침
  const refreshData = () => {
    toast.success('데이터를 새로고침합니다...');
    
    if (activeTab === 'news') {
      fetchNews();
    } else if (activeTab === 'cases') {
      fetchUseCases();
    } else if (activeTab === 'companies') {
      fetchCompanies();
    }
    
    fetchTrends();
  };

  // useEffect로 데이터 로드
  useEffect(() => {
    if (activeTab === 'news') {
      fetchNews();
    } else if (activeTab === 'cases') {
      fetchUseCases();
    } else if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [activeTab, selectedIndustry, searchQuery, currentPage]);

  useEffect(() => {
    fetchTrends();
  }, []);

  // 산업 필터
  const industries = [
    { id: 'all', name: '전체', icon: '🏢' },
    { id: '금융', name: '금융', icon: '💳' },
    { id: '의료', name: '의료', icon: '🏥' },
    { id: '제조', name: '제조', icon: '🏭' },
    { id: '물류', name: '물류', icon: '🚚' },
    { id: '이커머스', name: '이커머스', icon: '🛒' },
    { id: '교육', name: '교육', icon: '🎓' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 - 미니멀하고 깔끔한 스타일 */}
      <header className="border-b border-gray-100 sticky top-0 z-40 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI 마켓 인사이트</h1>
                <p className="text-xs text-gray-500">한국 AI 시장 동향</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-2.5 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 group"
                title="새로고침"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 group-hover:text-gray-900 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 hover:bg-gray-50 rounded-xl transition-all"
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 - 브런치 스타일로 깔끔하게 */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Market Intelligence</span>
            </div>
            <h2 className="text-5xl font-serif leading-tight mb-6">
              한국 AI 시장의<br/>
              <span className="text-blue-600">현재와 미래</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12 font-light">
              국내 기업들의 AI 혁신 사례와 시장 동향을<br/>
              깊이있게 분석하고 인사이트를 제공합니다.
            </p>
            
            {/* 주요 통계 - 미니멀하고 우아하게 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '87%', label: '대기업 AI 도입률', trend: '+12%' },
                { value: '4.2조', label: '시장 규모', trend: '+45%' },
                { value: '248개', label: 'AI 스타트업', trend: '+62개' },
                { value: '12K+', label: 'AI 전문가', trend: '+3.2K' }
              ].map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-3xl font-light text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-green-600 font-medium">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* 탭 네비게이션 - 브런치 스타일 */}
        <div className="flex items-center justify-center mb-16">
          <nav className="inline-flex p-1 bg-gray-100 rounded-2xl">
            {[
              { id: 'news', label: '트렌드', icon: TrendingUp },
              { id: 'cases', label: '케이스', icon: Briefcase },
              { id: 'companies', label: '기업', icon: Building2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 최신 뉴스 탭 - 브런치 스타일 아티클 */}
        {activeTab === 'news' && (
          <div>
            {/* 섹션 헤더 */}
            <div className="text-center mb-16">
              <h3 className="text-3xl font-serif mb-4">오늘의 AI 트렌드</h3>
              {trendsData && (
                <p className="text-gray-600">
                  {trendsData.totalNews}개의 새로운 인사이트
                </p>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">콘텐츠를 불러오는 중...</p>
                </div>
              </div>
            ) : newsData.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-500">아직 새로운 소식이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-24">
                {newsData.map(news => (
                  <article key={news.id} className="group">
                    <div className="max-w-4xl mx-auto">
                      {/* 메타 정보 */}
                      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                        <span className="font-medium">{news.company}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <time className="text-gray-500">{news.date}</time>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-blue-600">{news.category}</span>
                      </div>
                      
                      {/* 제목 */}
                      <h2 className="text-3xl font-serif leading-tight mb-6 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {news.title}
                      </h2>
                      
                      {/* 본문 */}
                      <p className="text-lg leading-relaxed text-gray-700 mb-8 font-light">
                        {news.summary}
                      </p>
                      
                      {/* 임팩트 */}
                      {news.impact && (
                        <blockquote className="border-l-4 border-blue-200 pl-6 mb-8">
                          <p className="text-gray-600 italic">
                            "{news.impact}"
                          </p>
                        </blockquote>
                      )}
                      
                      {/* 태그와 액션 */}
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          {news.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer">
                              <Hash className="w-3 h-3 inline mr-1" />{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                            <Bookmark className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
                            <Share2 className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            원문 읽기
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            
            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 적용 사례 탭 - 브런치 스타일 케이스 스터디 */}
        {activeTab === 'cases' && (
          <div>
            {/* 섹션 헤더 */}
            <div className="text-center mb-16">
              <h3 className="text-3xl font-serif mb-4">AI 혁신 케이스</h3>
              <p className="text-gray-600 mb-12">
                국내 기업들의 AI 도입 성공 사례
              </p>
              
              {/* 필터 - 미니멀한 디자인 */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="기업이나 기술로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {industries.map(industry => (
                    <button
                      key={industry.id}
                      onClick={() => setSelectedIndustry(industry.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedIndustry === industry.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-1.5">{industry.icon}</span>
                      {industry.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 사례 목록 - 브런치 스타일 카드 */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">케이스를 불러오는 중...</p>
                </div>
              </div>
            ) : useCasesData.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-500">해당하는 사례가 없습니다.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {useCasesData.map(useCase => (
                  <article key={useCase.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                    {/* 상단 헤더 */}
                    <div className="p-8 pb-0">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span className="font-semibold text-gray-900">{useCase.company}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>{useCase.industry}</span>
                          </div>
                          <h3 className="text-xl font-serif leading-relaxed mb-3">
                            {useCase.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed mb-6 font-light">
                        {useCase.description}
                      </p>
                      
                      {/* 기술 스택 */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {useCase.aiTech.map(tech => (
                          <span key={tech} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 성과 지표 - 시각적으로 개선 */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">도입 성과</h4>
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(useCase.results).slice(0, 3).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-2xl font-light text-gray-900">{value}</div>
                            <div className="text-xs text-gray-600 mt-1">{key}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-blue-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            {useCase.period}
                          </span>
                          <span className="font-medium text-blue-700">
                            {useCase.investment}
                          </span>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium group-hover:underline">
                          자세히 →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 주요 기업 탭 */}
        {activeTab === 'companies' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">한국 주요 AI 기업</h3>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companiesData.map(company => (
                <div key={company.name} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{company.logo}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.focus}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    기업 소개 보기
                  </button>
                </div>
              ))}
              </div>
            )}

            {/* AI 생태계 오버뷰 - 감성적 디자인 */}
            <div className="mt-20 py-20 border-t border-gray-100">
              <div className="max-w-4xl mx-auto text-center">
                <h4 className="text-2xl font-serif mb-12">
                  함께 만들어가는 AI 미래
                </h4>
                
                <div className="grid md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-3">글로벌 기업</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      삼성, LG, SK 등 대기업이<br/>
                      AI 기술로 새로운 가치를 창출합니다
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-3">혁신 스타트업</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      업스테이지, 뷰노 등이<br/>
                      세계 무대에서 경쟁력을 입증합니다
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-3">연구 기관</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      KAIST, 서울대 등이<br/>
                      미래 AI 인재를 양성합니다
                    </p>
                  </div>
                </div>
                
                <div className="mt-16 pt-16 border-t border-gray-100">
                  <blockquote className="text-lg text-gray-600 font-light italic">
                    "AI는 단순한 기술이 아닌, 우리의 삶을 변화시키는 도구입니다"<br/>
                    <cite className="text-sm text-gray-500 not-italic">— AI 트렌드 리포트 2024</cite>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KoreanMarketPage;