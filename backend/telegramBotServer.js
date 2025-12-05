require('dotenv').config();
const express = require('express');
const bot = require('./services/telegramBot');

const app = express();
const PORT = process.env.TELEGRAM_BOT_PORT || 3001;

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    bot: bot.isPolling() ? 'running' : 'stopped',
    timestamp: new Date().toISOString()
  });
});

// 봇 시작
console.log('🤖 텔레그램 봇을 시작합니다...');
console.log('📝 봇 설정:');
console.log('- 폴링 모드: 활성화');
console.log('- 허용된 사용자:', process.env.TELEGRAM_ALLOWED_USERS || '모든 사용자');

// 임시 디렉토리 생성
const fs = require('fs');
const path = require('path');
const tempDir = path.join(__dirname, 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
  console.log('📁 임시 디렉토리 생성됨:', tempDir);
}

app.listen(PORT, () => {
  console.log(`🌐 봇 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log('✅ 텔레그램 봇이 준비되었습니다!');
  console.log('💬 봇에게 /start 명령을 보내서 시작하세요.');
});