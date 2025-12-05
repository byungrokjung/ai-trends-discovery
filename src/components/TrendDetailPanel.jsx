import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Calendar, Tag, Heart, MessageCircle, Share2, Globe, Github, BookOpen, Zap } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import useBookmarkStore from '../store/useBookmarkStore';
import { useToast } from '../store/useToastStore';
import ImageGallery from './ImageGallery';

const TrendDetailPanel = ({ trend, isOpen, onClose, trends = [], onTrendClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      // 약간의 딜레이 후 애니메이션 시작
      setTimeout(() => setIsVisible(true), 10);
      setActiveTab('summary'); // 탭 초기화
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // ESC 키로 닫기
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // 애니메이션 완료 후 닫기
  };

  const handleBookmark = () => {
    toggleBookmark(trend);
    if (!isBookmarked(trend.id)) {
      toast.success("북마크에 추가되었습니다!");
    } else {
      toast.info("북마크에서 제거되었습니다.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${trend.title} - ${window.location.origin}/trends/${trend.id}`);
    toast.success("링크가 복사되었습니다.");
  };

  // 관련 트렌드 찾기
  const getRelatedTrends = () => {
    if (!trend || !trends.length) return [];
    
    // 같은 카테고리 또는 비슷한 태그를 가진 트렌드 찾기
    const relatedTrends = trends
      .filter(t => t.id !== trend.id) // 현재 트렌드 제외
      .map(t => {
        let score = 0;
        
        // 같은 카테고리면 점수 추가
        if (t.category === trend.category) score += 3;
        
        // 공통 태그 개수만큼 점수 추가
        if (trend.tags && t.tags) {
          const commonTags = trend.tags.filter(tag => t.tags.includes(tag));
          score += commonTags.length * 2;
        }
        
        // 비슷한 출처면 점수 추가
        if (t.source === trend.source) score += 1;
        
        return { ...t, score };
      })
      .filter(t => t.score > 0) // 관련성 있는 것만
      .sort((a, b) => b.score - a.score) // 점수 높은 순
      .slice(0, 4); // 상위 4개만
    
    return relatedTrends;
  };

  const relatedTrends = getRelatedTrends();

  if (!isOpen && !isVisible) return null;
  if (!trend) return null;

  return (
    <>
      {/* 오버레이 - 모바일에서만 표시 */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* 패널 */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-out
          w-full lg:w-[480px] xl:w-[600px] overflow-hidden
          ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">상세 정보</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* 이미지 갤러리 */}
              {((trend.allImages && trend.allImages.length > 0) || (trend.images && trend.images.length > 0)) && (
                <ImageGallery images={trend.allImages || trend.images || []} title={trend.title} />
              )}

              {/* 제목과 태그라인 */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{trend.title}</h1>
                {trend.tagline && (
                  <p className="text-lg text-gray-600">{trend.tagline}</p>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isBookmarked(trend.id)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isBookmarked(trend.id) ? 'fill-current' : ''}`} />
                  <span>북마크</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>공유</span>
                </button>
                <a
                  href={trend.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>웹사이트 방문</span>
                </a>
              </div>

              {/* 메타 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">게시일</span>
                  <span className="text-gray-900 font-medium">{formatDate(trend.published_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">출처</span>
                  <span className="text-gray-900 font-medium">{trend.source || 'Product Hunt'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">추천</span>
                  <span className="text-gray-900 font-medium">{trend.votes || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">댓글</span>
                  <span className="text-gray-900 font-medium">{trend.comments || 0}</span>
                </div>
              </div>

              {/* 탭 네비게이션 */}
              <div className="flex gap-1 mb-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2.5 font-medium transition-all relative ${
                    activeTab === 'summary'
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  요약 정보
                  {activeTab === 'summary' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2.5 font-medium transition-all relative ${
                    activeTab === 'preview'
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  웹사이트 미리보기
                  {activeTab === 'preview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2.5 font-medium transition-all relative ${
                    activeTab === 'details'
                      ? 'text-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  상세 정보
                  {activeTab === 'details' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>

              {/* 탭 콘텐츠 */}
              {activeTab === 'summary' && (
                <div>
                  {/* 설명 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      설명
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      {trend.summary_korean ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">한국어 요약</p>
                            <p className="text-gray-800">{trend.summary_korean}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">원문 요약</p>
                            <p className="text-gray-700">{trend.summary}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700">{trend.summary}</p>
                      )}
                    </div>
                  </div>

                  {/* 카테고리와 태그 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      카테고리 & 태그
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trend.category && (
                        <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {trend.category}
                        </span>
                      )}
                      {trend.tags && trend.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI 인사이트 */}
                  {trend.korea_relevance && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        AI 인사이트
                      </h3>
                      {trend.korea_relevance.impact && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">한국 시장 영향</p>
                          <p className="text-gray-800">{trend.korea_relevance.impact}</p>
                        </div>
                      )}
                      {trend.insights?.opportunity && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">사업 기회</p>
                          <p className="text-gray-800">{trend.insights.opportunity}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-6">
                  {/* 웹사이트 정보 카드 */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">웹사이트 정보</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {trend.tagline || trend.summary?.slice(0, 100) + '...'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={trend.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>웹사이트 방문</span>
                          </a>
                          {trend.github_url && (
                            <a
                              href={trend.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                              <Github className="w-4 h-4" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 스크린샷 갤러리 */}
                  {((trend.allImages && trend.allImages.length > 0) || (trend.images && trend.images.length > 0)) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        스크린샷 갤러리
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(trend.allImages || trend.images || []).map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`${trend.title} 스크린샷 ${index + 1}`}
                              className="w-full rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 주요 특징 */}
                  {(trend.features || trend.highlights || trend.summary) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        주요 특징
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {trend.features ? (
                          <ul className="space-y-2">
                            {trend.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span className="text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{trend.summary}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 웹사이트 메타데이터 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">추가 정보</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">URL</dt>
                        <dd className="text-gray-900 truncate max-w-xs">
                          <a 
                            href={trend.original_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {trend.original_url}
                          </a>
                        </dd>
                      </div>
                      {trend.makers && trend.makers.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">제작자</dt>
                          <dd className="text-gray-900">
                            {trend.makers.map(m => m.name).join(', ')}
                          </dd>
                        </div>
                      )}
                      {trend.topics && trend.topics.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">토픽</dt>
                          <dd className="text-gray-900">
                            {trend.topics.join(', ')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* CTA 버튼 */}
                  <div className="flex justify-center pt-4">
                    <a
                      href={trend.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <span>웹사이트에서 자세히 보기</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">ID</dt>
                        <dd className="text-gray-900 font-mono text-sm">{trend.id}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">게시일</dt>
                        <dd className="text-gray-900">{formatDate(trend.published_at)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">출처</dt>
                        <dd className="text-gray-900">{trend.source || 'Product Hunt'}</dd>
                      </div>
                      {trend.featured && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Featured</dt>
                          <dd className="text-gray-900">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">추천</span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* 참여 지표 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">참여 지표</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">추천 수</dt>
                        <dd className="text-gray-900 font-semibold">{trend.votes || 0}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">댓글 수</dt>
                        <dd className="text-gray-900 font-semibold">{trend.comments || 0}</dd>
                      </div>
                      {trend.makers && trend.makers.length > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">제작자 수</dt>
                          <dd className="text-gray-900 font-semibold">{trend.makers.length}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* 관련 링크 */}
                  {(trend.github_url || trend.demo_url) && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">관련 링크</h3>
                      <div className="space-y-2">
                        {trend.github_url && (
                          <a
                            href={trend.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                          >
                            <Github className="w-4 h-4" />
                            <span>GitHub 저장소</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </a>
                        )}
                        {trend.demo_url && (
                          <a
                            href={trend.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span>데모 보기</span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 제작자 정보 */}
                  {trend.makers && trend.makers.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">제작자</h3>
                      <div className="space-y-2">
                        {trend.makers.map((maker, index) => (
                          <div key={index} className="flex items-center gap-3">
                            {maker.image_url && (
                              <img 
                                src={maker.image_url} 
                                alt={maker.name} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{maker.name}</p>
                              {maker.headline && (
                                <p className="text-sm text-gray-600">{maker.headline}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 관련 트렌드 추천 섹션 - 모든 탭에서 표시 */}
              {relatedTrends.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    이것도 관심있으실 거예요
                  </h3>
                  <div className="space-y-3">
                    {relatedTrends.map((relatedTrend) => (
                      <div
                        key={relatedTrend.id}
                        onClick={() => {
                          if (onTrendClick) {
                            onTrendClick(relatedTrend);
                          }
                        }}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          {/* 썸네일 */}
                          {(relatedTrend.allImages?.[0] || relatedTrend.images?.[0]) && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={relatedTrend.allImages?.[0] || relatedTrend.images?.[0]}
                                alt={relatedTrend.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* 정보 */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                              {relatedTrend.title}
                            </h4>
                            {relatedTrend.tagline && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {relatedTrend.tagline}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {relatedTrend.votes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {relatedTrend.comments || 0}
                              </span>
                              {relatedTrend.category && (
                                <span className="px-2 py-0.5 bg-gray-200 rounded text-gray-700">
                                  {relatedTrend.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrendDetailPanel;