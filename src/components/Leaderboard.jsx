import React, { useState, useEffect } from "react";
import { TrendingUp, Eye, Bookmark, MessageCircle, Award, Flame, Zap } from "lucide-react";
import { trendsService } from "../lib/supabase";

const Leaderboard = () => {
  const [topTrends, setTopTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTrends();
  }, []);

  const fetchPopularTrends = async () => {
    try {
      const data = await trendsService.getPopularTrends(5);
      
      const formattedTrends = data.map((trend, index) => ({
        id: trend.id,
        rank: index + 1,
        title: trend.title,
        category: trend.category || "기타",
        views: trend.views || 0,
        bookmarks: trend.bookmarks || Math.floor(trend.views * 0.15),
        comments: trend.comments || Math.floor(trend.views * 0.012),
        score: trend.importance || 5,
        trend: index < 2 ? "up" : index > 3 ? "down" : "same",
        imageUrl: trend.image_url || `https://source.unsplash.com/400x300/?ai,technology`
      }));

      setTopTrends(formattedTrends);
    } catch (error) {
      console.error("Error fetching popular trends:", error);
      // 에러시 더미 데이터 사용
      setTopTrends(dummyTopTrends);
    } finally {
      setLoading(false);
    }
  };

  // 더미 데이터 (fallback)
  const dummyTopTrends = [
    {
      id: 1,
      rank: 1,
      title: "OpenAI의 새로운 추론 모델 o3, 인간 수준의 AGI에 근접",
      category: "모델 출시",
      views: 15234,
      bookmarks: 2341,
      comments: 189,
      score: 9.8,
      trend: "up",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      rank: 2,
      title: "구글 제미나이 2.0, 멀티모달 AI의 새로운 기준 제시",
      category: "AI 에이전트",
      views: 12456,
      bookmarks: 1987,
      comments: 156,
      score: 9.5,
      trend: "up",
      imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      rank: 3,
      title: "메타, 라마 3.5 공개... 오픈소스 AI의 반격",
      category: "오픈소스",
      views: 11234,
      bookmarks: 1654,
      comments: 134,
      score: 9.2,
      trend: "same",
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      rank: 4,
      title: "삼성전자, 자체 AI 칩 '마하' 공개... NVIDIA 도전장",
      category: "하드웨어",
      views: 9876,
      bookmarks: 1432,
      comments: 123,
      score: 8.9,
      trend: "down",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      rank: 5,
      title: "네이버 하이퍼클로바X, 한국어 특화 성능 세계 1위",
      category: "한국 AI",
      views: 8765,
      bookmarks: 1234,
      comments: 98,
      score: 8.7,
      trend: "up",
      imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop"
    }
  ];

  const hotWriters = [
    {
      id: 1,
      name: "김테크",
      title: "AI 전문 애널리스트",
      articles: 156,
      followers: 3421,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "이노베이션",
      title: "실리콘밸리 특파원",
      articles: 234,
      followers: 2987,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      name: "박인사이트",
      title: "머신러닝 엔지니어",
      articles: 89,
      followers: 2156,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    }
  ];

  const formatNumber = (num) => {
    if (num >= 10000) return `${Math.floor(num / 1000)}K`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Award className="w-5 h-5 text-accent" />;
      case 2:
        return <Award className="w-5 h-5 text-gray-500" />;
      case 3:
        return <Award className="w-5 h-5 text-accent-dark" />;
      default:
        return <span className="text-text-tertiary font-bold">#{rank}</span>;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <span className="w-4 h-4 text-gray-400">—</span>;
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-wide mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-accent" />
            <h2 className="font-display text-display font-light text-text-primary">실시간 트렌딩</h2>
          </div>
          <p className="text-lg text-text-secondary font-light">지금 가장 주목받는 AI 소식들</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 리더보드 */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-text-primary">Top 5 트렌드</h3>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <Zap className="w-4 h-4" />
                  실시간 업데이트
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-pulse text-text-tertiary">트렌딩 데이터 로딩 중...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topTrends.map((trend) => (
                    <article
                      key={trend.id}
                      className="bg-background-card rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-border-light"
                    >
                      <div className="flex items-start gap-4">
                        {/* 순위 */}
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
                          {getRankIcon(trend.rank)}
                        </div>

                        {/* 이미지 */}
                        <div className="hidden sm:block flex-shrink-0">
                          <img
                            src={trend.imageUrl}
                            alt={trend.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* 콘텐츠 */}
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="tag text-xs">{trend.category}</span>
                            {getTrendIcon(trend.trend)}
                          </div>
                          <h4 className="font-bold text-lg mb-3 line-clamp-2 hover:text-primary transition-colors">
                            {trend.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-text-tertiary">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(trend.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3 h-3" />
                              {formatNumber(trend.bookmarks)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {formatNumber(trend.comments)}
                            </span>
                          </div>
                        </div>

                        {/* 점수 */}
                        <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{trend.score}</div>
                            <div className="text-xs text-text-tertiary">점수</div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 - 인기 작가 */}
          <div className="lg:col-span-1">
            <div className="bg-background-secondary rounded-2xl p-8 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-primary-accent" />
                <h3 className="text-xl font-bold text-text-primary">이주의 인기 작가</h3>
              </div>

              <div className="space-y-6">
                {hotWriters.map((writer, index) => (
                  <div key={writer.id} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-text-tertiary w-6">
                      {index + 1}
                    </span>
                    <img
                      src={writer.avatar}
                      alt={writer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                      <h4 className="font-bold text-sm text-text-primary">{writer.name}</h4>
                      <p className="text-xs text-text-tertiary">{writer.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-tertiary">
                        <span>{writer.articles} 글</span>
                        <span>•</span>
                        <span>{formatNumber(writer.followers)} 구독</span>
                      </div>
                    </div>
                    <button className="btn-ghost text-xs py-1 px-3">
                      구독
                    </button>
                  </div>
                ))}
              </div>

              {/* 추가 통계 */}
              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="font-bold text-sm mb-4 text-text-primary">오늘의 키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {["GPT-5", "AI에이전트", "한국AI", "오픈소스", "AGI"].map((keyword) => (
                    <span
                      key={keyword}
                      className="tag text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;