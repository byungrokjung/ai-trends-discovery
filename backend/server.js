const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

// 환경 변수를 먼저 로드
dotenv.config();

// 환경 변수가 로드된 후에 모듈 import
const { supabase } = require('./config/supabase');
const { startRSSCrawler } = require('./services/rssCrawlerService');
const dataCollector = require('./services/dataCollector');
const { startDailyCronJob } = require('./jobs/dailyCron');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (프론트엔드 빌드 파일)
app.use(express.static(path.join(__dirname, '../dist')));

// 환경변수 상태 로깅
console.log('🔧 환경변수 상태:');
console.log('- PORT:', process.env.PORT || '5000');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('- OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('- ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trends', require('./routes/trends'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api', require('./routes/ai-recommend'));
app.use('/api/korean-market', require('./routes/korean-market'));
app.use('/api/github', require('./routes/github'));
app.use('/api/purchase', require('./routes/purchase'));
app.use('/api/product-analysis', require('./routes/product-analysis'));
app.use('/api/instagram', require('./routes/instagram'));
app.use('/api/tiktok', require('./routes/tiktok'));
app.use('/api/ai-shopping', require('./routes/ai-shopping'));
app.use('/api/sourcing', require('./routes/sourcing'));
app.use('/api/vector-search', require('./routes/vector-search'));
app.use('/api/daily-recommendations', require('./routes/daily-recommendations'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch all handler - SPA용
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// RSS 크롤러 스케줄링 (매 시간마다 실행)
cron.schedule('0 * * * *', () => {
  console.log('🔄 RSS 크롤링 시작...');
  startRSSCrawler();
});

// 서버 시작 시 한 번 실행
if (process.env.NODE_ENV !== 'test') {
  startRSSCrawler();

  // 한국 AI 뉴스 수집 스케줄러 시작
  dataCollector.startScheduledCollection();

  // 서버 시작 시 한 번 데이터 수집 (옵션)
  console.log('🇰🇷 한국 AI 뉴스 초기 수집 시작...');
  dataCollector.collectAll()
    .then(() => console.log('✅ 초기 데이터 수집 완료'))
    .catch(err => console.error('❌ 초기 데이터 수집 실패:', err));
}

app.listen(PORT, () => {
  console.log(`✅ 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🇰🇷 한국 AI 시장 API: http://localhost:${PORT}/api/korean-market`);

  // 일일 추천 크론잡 시작 (매일 아침 7시)
  startDailyCronJob();
});