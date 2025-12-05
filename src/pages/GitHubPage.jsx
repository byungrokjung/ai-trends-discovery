import React, { useState, useCallback } from 'react';
import { Loader2, Search, Star, GitFork, Code, TrendingUp, BookOpen, Users, Calendar, ExternalLink, Hash } from 'lucide-react';
import Toast from '../components/Toast';

function GitHubPage() {
  const [activeTab, setActiveTab] = useState('deepwiki');
  const [language, setLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deepWikiRepo, setDeepWikiRepo] = useState('');
  const [ingestRepo, setIngestRepo] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [trendingRepos, setTrendingRepos] = useState([]);
  const [topicInsights, setTopicInsights] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  // 트렌딩 저장소 가져오기
  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/github/trending${language ? `?language=${language}` : ''}`);
      if (!response.ok) throw new Error('트렌딩 저장소를 불러올 수 없습니다');
      const result = await response.json();
      setTrendingRepos(result);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [language]);

  // 저장소 분석
  const analyzeRepo = async () => {
    if (!deepWikiRepo || !deepWikiRepo.includes('/')) {
      showToast('올바른 형식으로 입력해주세요 (예: owner/repo)', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/github/analyze/${deepWikiRepo}`);
      if (!response.ok) throw new Error('저장소를 분석할 수 없습니다');
      const result = await response.json();
      setAnalysisData(result);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 코드 검색
  const searchCode = async () => {
    if (!searchQuery.trim()) {
      showToast('검색어를 입력해주세요', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/github/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('검색을 수행할 수 없습니다');
      const result = await response.json();
      setSearchResults(result);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 토픽 탐색
  const exploreTopic = async () => {
    if (!topic.trim()) {
      showToast('토픽을 입력해주세요', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/github/topic/${encodeURIComponent(topic)}`);
      if (!response.ok) throw new Error('토픽을 탐색할 수 없습니다');
      const result = await response.json();
      setTopicInsights(result);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const buildGitinGistUrl = (repoFullName) => {
    if (!repoFullName || !repoFullName.includes('/')) {
      return null;
    }
    return `https://gitingest.com/repo/${repoFullName}`;
  };

  const openGitinGist = (repoFullName) => {
    const url = buildGitinGistUrl(repoFullName);
    if (!url) {
      showToast('유효한 저장소 정보를 찾을 수 없습니다.', 'error');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">GitHub 오픈소스 탐색</h1>
          <p className="mt-2 text-gray-600">트렌딩 프로젝트부터 코드 검색까지</p>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <nav className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm">
          {[
            { id: 'deepwiki', label: 'DeepWiki', icon: BookOpen },
            { id: 'gitingest', label: 'GitIngest', icon: Search },
            { id: 'gitmcp', label: 'GitMCP', icon: Users },
            { id: 'analytics', label: 'Git Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 입력 폼 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {activeTab === 'deepwiki' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    DeepWiki 단계 · 저장소 경로
                  </label>
                  <span className="text-xs text-gray-500">예: owner/repo</span>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={deepWikiRepo}
                    onChange={(e) => setDeepWikiRepo(e.target.value)}
                    placeholder="예: facebook/react"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={analyzeRepo}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BookOpen className="h-5 w-5" />}
                    <span>깊이 이해하기</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                저장소 구조·README·릴리스 정보를 기반으로 AI가 주요 인사이트를 요약합니다.
              </p>
            </div>
          )}

          {activeTab === 'gitingest' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    GitIngest 단계 · 저장소 경로
                  </label>
                  <span className="text-xs text-gray-500">예: owner/repo</span>
                </div>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={ingestRepo}
                    onChange={(e) => setIngestRepo(e.target.value)}
                    placeholder="예: vercel/next.js"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => openGitinGist(ingestRepo)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Search className="h-5 w-5" />
                    <span>GitinGist 열기</span>
                  </button>
                </div>
              </div>
              {buildGitinGistUrl(ingestRepo) && (
                <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                  <p className="font-medium">자동 생성된 GitinGist URL</p>
                  <p className="mt-1 break-all">{buildGitinGistUrl(ingestRepo)}</p>
                  <p className="mt-2 text-xs text-blue-600">
                    GitinGist는 저장소 요약과 프롬프트 입력값을 빠르게 추출할 때 활용할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gitmcp' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">GitMCP 단계</h3>
              <p className="text-sm text-gray-600">
                Playwright MCP와 같은 MCP 서버를 등록하면 Codex/Claude를 통해 코드 수정·커밋·배포 자동화를 실행할 수 있습니다.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>
                  <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">npm install</code> 이후
                  <code className="ml-2 rounded bg-gray-100 px-1 py-0.5 text-xs">npm run mcp:install -- playwright</code>
                  명령으로 MCP를 설치합니다.
                </li>
                <li>
                  설치 완료 후 <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">env RUST_LOG="codex=debug" codex "/mcp"</code>
                  명령으로 등록 상태를 확인하세요.
                </li>
                <li>
                  Codex에서 MCP를 호출할 때 실행할 작업(예: 테스트 수정, 빌드, 배포)을 프롬프트로 지시합니다.
                </li>
              </ol>
              <p className="text-xs text-gray-500">
                실제 수정 전에는 로컬에서 변경사항을 검증하고, 필요한 경우 Git 브랜치 전략을 설정하세요.
              </p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    언어별 트렌딩 저장소
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="예: python"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={fetchTrending}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <TrendingUp className="h-5 w-5" />}
                      <span>조회</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    토픽 기반 인사이트
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="예: machine-learning"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={exploreTopic}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Hash className="h-5 w-5" />}
                      <span>분석</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  코드 검색 (선택)
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="예: useEffect hook, async await"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={searchCode}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    <span>검색</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 결과 표시 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        )}

        {!loading && activeTab === 'deepwiki' && analysisData && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-end gap-3 mb-6">
              {analysisData?.repoDetails?.repo?.html_url && (
                <a
                  href={analysisData.repoDetails.repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  GitHub에서 보기
                </a>
              )}
              <button
                type="button"
                onClick={() => openGitinGist(analysisData?.repoDetails?.repo?.full_name || deepWikiRepo)}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                GitinGist로 보기
              </button>
            </div>
            {analysisData.analysis && (
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap">{analysisData.analysis}</div>
              </div>
            )}

            {analysisData.similar && analysisData.similar.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">유사한 프로젝트</h3>
                <div className="space-y-3">
                  {analysisData.similar.map((proj, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{proj.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{proj.description || '설명 없음'}</p>
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        <span className="text-sm text-gray-500">
                          유사도: {(proj.similarity * 100).toFixed(0)}%
                        </span>
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'analytics' && (
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">트렌딩 저장소</h3>
              {trendingRepos.length === 0 ? (
                <p className="text-sm text-gray-500">언어를 선택하고 조회를 눌러 최신 트렌드를 불러오세요.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {trendingRepos.map((repo, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {repo.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{repo.description || '설명이 없습니다'}</p>

                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Star className="h-4 w-4" />
                              <span>{formatNumber(repo.stars)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <GitFork className="h-4 w-4" />
                              <span>{formatNumber(repo.forks)}</span>
                            </span>
                            {repo.language && (
                              <span className="flex items-center space-x-1">
                                <Code className="h-4 w-4" />
                                <span>{repo.language}</span>
                              </span>
                            )}
                          </div>

                          {repo.topics && repo.topics.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {repo.topics.slice(0, 5).map((topic, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openGitinGist(repo.name)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            GitinGist로 보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">코드 검색 결과</h3>
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-500">검색어를 입력하면 관련 파일을 확인할 수 있습니다.</p>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.repository}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <Code className="inline h-4 w-4 mr-1" />
                            {result.path}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => openGitinGist(result.repository)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            GitinGist로 보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">토픽 트렌드 분석</h3>
              {topicInsights ? (
                <div className="space-y-6">
                  {topicInsights.analysis && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="prose prose-blue max-w-none">
                        <div className="whitespace-pre-wrap">{topicInsights.analysis}</div>
                      </div>
                    </div>
                  )}

                  {topicInsights.repos && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">관련 저장소</h4>
                      <div className="grid gap-4">
                        {topicInsights.repos.map((repo, index) => (
                          <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{repo.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{repo.description || '설명 없음'}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Star className="h-4 w-4" />
                                  <span>{formatNumber(repo.stars)}</span>
                                </span>
                                {repo.language && (
                                  <span className="flex items-center space-x-1">
                                    <Code className="h-4 w-4" />
                                    <span>{repo.language}</span>
                                  </span>
                                )}
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(repo.created_at)}</span>
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 flex flex-col items-end gap-2">
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => openGitinGist(repo.name)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                GitinGist로 보기
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">관심 있는 토픽을 입력하면 AI가 트렌드를 분석해 줍니다.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default GitHubPage;
