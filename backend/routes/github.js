const express = require('express');
const router = express.Router();
const GitHubExplorer = require('../services/githubExplorer');

const githubExplorer = new GitHubExplorer();

// 트렌딩 저장소 조회
router.get('/trending', async (req, res) => {
  try {
    const { language } = req.query;
    const repos = await githubExplorer.getTrendingRepos(language);
    res.json(repos);
  } catch (error) {
    console.error('트렌딩 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 저장소 분석
router.get('/analyze/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoDetails = await githubExplorer.getRepoDetails(owner, repo);
    const analysis = await githubExplorer.analyzeRepository(repoDetails);
    
    // 유사 프로젝트 찾기
    let similar = [];
    if (repoDetails.repo.topics && repoDetails.repo.topics.length > 0) {
      similar = await githubExplorer.findSimilarProjects(
        repoDetails.repo.topics,
        repoDetails.repo.language,
        `${owner}/${repo}`
      );
    }
    
    res.json({ analysis, similar, repoDetails });
  } catch (error) {
    console.error('저장소 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 코드 검색
router.get('/search', async (req, res) => {
  try {
    const { q, language } = req.query;
    if (!q) {
      return res.status(400).json({ error: '검색어가 필요합니다' });
    }
    
    const results = await githubExplorer.searchCode(q, language);
    res.json(results);
  } catch (error) {
    console.error('코드 검색 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 토픽 탐색
router.get('/topic/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const result = await githubExplorer.exploreByTopic(topic);
    res.json(result);
  } catch (error) {
    console.error('토픽 탐색 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 개발자 프로필 분석
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await githubExplorer.analyzeDevProfile(username);
    res.json(profile);
  } catch (error) {
    console.error('개발자 프로필 분석 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;