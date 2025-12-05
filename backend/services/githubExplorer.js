const axios = require('axios');
const { Octokit } = require('@octokit/rest');
const Anthropic = require('@anthropic-ai/sdk');

class GitHubExplorer {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN // 선택사항, rate limit 증가
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  // 트렌딩 저장소 가져오기
  async getTrendingRepos(language = '', since = 'daily') {
    try {
      // GitHub Trending은 공식 API가 없어서 비공식 API 사용
      const url = `https://api.github.com/search/repositories`;
      const date = new Date();
      date.setDate(date.getDate() - (since === 'weekly' ? 7 : since === 'monthly' ? 30 : 1));
      
      const query = [
        language ? `language:${language}` : '',
        `created:>${date.toISOString().split('T')[0]}`,
        'stars:>10'
      ].filter(Boolean).join(' ');

      const response = await this.octokit.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 20
      });

      return response.data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
        topics: repo.topics || [],
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        license: repo.license?.name,
        owner: {
          login: repo.owner.login,
          avatar_url: repo.owner.avatar_url
        }
      }));
    } catch (error) {
      console.error('GitHub 트렌딩 조회 실패:', error);
      throw error;
    }
  }

  // 저장소 상세 정보 가져오기
  async getRepoDetails(owner, repo) {
    try {
      const [repoInfo, readme, releases, contributors] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.getReadme(owner, repo),
        this.octokit.repos.listReleases({ owner, repo, per_page: 5 }),
        this.octokit.repos.listContributors({ owner, repo, per_page: 10 })
      ]);

      // 최근 커밋 활동
      const commits = await this.octokit.repos.listCommits({
        owner,
        repo,
        per_page: 10
      });

      // 이슈와 PR 통계
      const [openIssues, openPRs] = await Promise.all([
        this.octokit.issues.listForRepo({
          owner,
          repo,
          state: 'open',
          per_page: 1
        }),
        this.octokit.pulls.list({
          owner,
          repo,
          state: 'open',
          per_page: 1
        })
      ]);

      return {
        repo: repoInfo.data,
        readme: readme,
        releases: releases.data,
        contributors: contributors.data,
        recentCommits: commits.data,
        stats: {
          openIssues: openIssues.headers['x-total-count'] || 0,
          openPRs: openPRs.headers['x-total-count'] || 0,
          stars: repoInfo.data.stargazers_count,
          forks: repoInfo.data.forks_count,
          watchers: repoInfo.data.subscribers_count
        },
        activity: {
          lastCommit: commits.data[0]?.commit.author.date,
          commitsPerWeek: this.calculateCommitFrequency(commits.data)
        }
      };
    } catch (error) {
      console.error('저장소 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  // README 파일 가져오기
  async getReadme(owner, repo) {
    try {
      const readme = await this.octokit.repos.getReadme({
        owner,
        repo,
        mediaType: {
          format: 'raw'
        }
      });
      return readme.data;
    } catch (error) {
      return null;
    }
  }

  // 코드 검색
  async searchCode(query, language = '') {
    try {
      const searchQuery = language ? `${query} language:${language}` : query;
      
      const response = await this.octokit.search.code({
        q: searchQuery,
        per_page: 20
      });

      return response.data.items.map(item => ({
        name: item.name,
        path: item.path,
        repository: item.repository.full_name,
        url: item.html_url,
        score: item.score
      }));
    } catch (error) {
      console.error('코드 검색 실패:', error);
      throw error;
    }
  }

  // AI 기반 저장소 분석
  async analyzeRepository(repoDetails) {
    const prompt = `다음 GitHub 저장소를 분석해주세요:

저장소: ${repoDetails.repo.full_name}
설명: ${repoDetails.repo.description}
주요 언어: ${repoDetails.repo.language}
스타: ${repoDetails.stats.stars}
포크: ${repoDetails.stats.forks}
최근 릴리스: ${repoDetails.releases[0]?.name || '없음'}
주요 기여자 수: ${repoDetails.contributors.length}

README 요약:
${repoDetails.readme ? repoDetails.readme.substring(0, 1000) + '...' : '없음'}

다음 항목을 포함하여 분석해주세요:
1. 🎯 프로젝트 핵심 목적
2. 💡 주요 특징 및 장점
3. 🛠️ 기술 스택
4. 📊 프로젝트 활성도 평가
5. 🚀 사용 사례
6. ⚠️ 주의사항 또는 단점
7. 🔮 미래 전망`;

    const message = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      system: "당신은 오픈소스 프로젝트 분석 전문가입니다. 기술적 통찰력과 실용적 조언을 제공합니다."
    });

    return message.content[0].text;
  }

  // 유사 프로젝트 찾기
  async findSimilarProjects(topics, language, currentRepo) {
    try {
      const query = [
        topics.map(t => `topic:${t}`).join(' OR '),
        language ? `language:${language}` : '',
        'stars:>100',
        `-repo:${currentRepo}`
      ].filter(Boolean).join(' ');

      const response = await this.octokit.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: 10
      });

      return response.data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        url: repo.html_url,
        similarity: this.calculateSimilarity(topics, repo.topics || [])
      })).sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    } catch (error) {
      console.error('유사 프로젝트 검색 실패:', error);
      return [];
    }
  }

  // 토픽 기반 탐색
  async exploreByTopic(topic, limit = 10) {
    try {
      const response = await this.octokit.search.repos({
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc',
        per_page: limit
      });

      const repos = response.data.items;
      
      // AI로 트렌드 분석
      const trendAnalysis = await this.analyzeTrend(topic, repos);

      return {
        repos: repos.map(repo => ({
          name: repo.full_name,
          description: repo.description,
          stars: repo.stargazers_count,
          language: repo.language,
          url: repo.html_url,
          created_at: repo.created_at,
          topics: repo.topics
        })),
        analysis: trendAnalysis
      };
    } catch (error) {
      console.error('토픽 탐색 실패:', error);
      throw error;
    }
  }

  // AI 트렌드 분석
  async analyzeTrend(topic, repos) {
    const repoSummary = repos.map(repo => ({
      name: repo.full_name,
      stars: repo.stargazers_count,
      language: repo.language,
      created: repo.created_at
    }));

    const prompt = `"${topic}" 토픽의 GitHub 트렌드를 분석해주세요:

상위 저장소들:
${JSON.stringify(repoSummary, null, 2)}

다음을 포함하여 분석해주세요:
1. 🔥 현재 트렌드 요약
2. 📈 성장 패턴
3. 🔧 주요 기술 스택
4. 🌟 주목할 만한 프로젝트
5. 💡 개발자를 위한 인사이트`;

    const message = await this.anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      system: "당신은 GitHub 트렌드 분석가입니다. 개발자에게 유용한 인사이트를 제공합니다."
    });

    return message.content[0].text;
  }

  // 개발자 프로필 분석
  async analyzeDevProfile(username) {
    try {
      const [userInfo, repos, events] = await Promise.all([
        this.octokit.users.getByUsername({ username }),
        this.octokit.repos.listForUser({ username, sort: 'updated', per_page: 20 }),
        this.octokit.activity.listPublicEventsForUser({ username, per_page: 100 })
      ]);

      // 언어 통계
      const languages = {};
      for (const repo of repos.data) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }

      // 최근 활동 분석
      const recentActivities = this.analyzeActivities(events.data);

      return {
        profile: {
          name: userInfo.data.name,
          bio: userInfo.data.bio,
          company: userInfo.data.company,
          location: userInfo.data.location,
          blog: userInfo.data.blog,
          followers: userInfo.data.followers,
          following: userInfo.data.following,
          public_repos: userInfo.data.public_repos
        },
        languages,
        topRepos: repos.data.slice(0, 5).map(repo => ({
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          language: repo.language,
          url: repo.html_url
        })),
        activities: recentActivities
      };
    } catch (error) {
      console.error('개발자 프로필 분석 실패:', error);
      throw error;
    }
  }

  // 활동 분석
  analyzeActivities(events) {
    const activities = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      stars: 0
    };

    events.forEach(event => {
      switch (event.type) {
        case 'PushEvent':
          activities.commits += event.payload.commits?.length || 0;
          break;
        case 'PullRequestEvent':
          activities.pullRequests++;
          break;
        case 'IssuesEvent':
          activities.issues++;
          break;
        case 'PullRequestReviewEvent':
          activities.reviews++;
          break;
        case 'WatchEvent':
          activities.stars++;
          break;
      }
    });

    return activities;
  }

  // 유사도 계산
  calculateSimilarity(topics1, topics2) {
    const set1 = new Set(topics1);
    const set2 = new Set(topics2);
    const intersection = [...set1].filter(x => set2.has(x));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.length / union.size : 0;
  }

  // 커밋 빈도 계산
  calculateCommitFrequency(commits) {
    if (commits.length < 2) return 0;
    
    const dates = commits.map(c => new Date(c.commit.author.date));
    const daysDiff = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    
    return daysDiff > 0 ? (commits.length / daysDiff * 7).toFixed(1) : 0;
  }

  // 라이선스 분석
  async analyzeLicense(license) {
    const licenseInfo = {
      'MIT': '✅ 매우 관대함 - 상업적 사용, 수정, 배포 모두 가능',
      'Apache-2.0': '✅ 관대함 - 특허 보호 포함, 상업적 사용 가능',
      'GPL-3.0': '⚠️ 제한적 - 수정 시 소스 공개 의무',
      'BSD-3-Clause': '✅ 관대함 - 상업적 사용 가능',
      'UNLICENSE': '✅ 완전 자유 - 퍼블릭 도메인',
      'AGPL-3.0': '⚠️ 매우 제한적 - 네트워크 사용 시에도 소스 공개'
    };

    return licenseInfo[license] || '❓ 라이선스 정보를 확인하세요';
  }
}

module.exports = GitHubExplorer;