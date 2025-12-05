const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');
const GitHubExplorer = require('./githubExplorer');

// AI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GitHub Explorer 초기화
const githubExplorer = new GitHubExplorer();

// Telegram 봇 초기화
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// 허용된 사용자 목록
const allowedUsers = process.env.TELEGRAM_ALLOWED_USERS?.split(',').map(Number) || [];

// 활성 브라우저 세션 관리
const browserSessions = new Map();

// 권한 체크 미들웨어
const checkAuthorization = (userId) => {
  return allowedUsers.length === 0 || allowedUsers.includes(userId);
};

// 브라우저 세션 가져오기
async function getBrowserSession(userId) {
  if (!browserSessions.has(userId)) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    browserSessions.set(userId, browser);
  }
  return browserSessions.get(userId);
}

// 스크린샷 찍기
async function takeScreenshot(page, chatId) {
  const screenshotPath = path.join(__dirname, `../temp/screenshot_${chatId}_${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  
  await bot.sendPhoto(chatId, screenshotPath, {
    caption: '📸 현재 페이지 스크린샷'
  });
  
  // 임시 파일 삭제
  await fs.unlink(screenshotPath);
}

// AI 트렌드 사이트 뉴스 요약
async function summarizeAITrends(chatId) {
  const browser = await getBrowserSession(chatId);
  const page = await browser.newPage();
  
  try {
    // 상태 메시지 전송
    const statusMessage = await bot.sendMessage(chatId, '🔄 AI 트렌드 사이트를 분석하고 있습니다...');
    
    // 페이지 접속
    await page.goto('http://localhost:5173/korean', { waitUntil: 'networkidle2' });
    
    // 스크린샷 전송
    await takeScreenshot(page, chatId);
    
    // 뉴스 데이터 추출
    const newsData = await page.evaluate(() => {
      const articles = [];
      document.querySelectorAll('article').forEach(article => {
        const title = article.querySelector('h2')?.textContent || '';
        const summary = article.querySelector('p')?.textContent || '';
        const date = article.querySelector('time')?.textContent || '';
        const category = article.querySelector('.text-blue-600')?.textContent || '';
        
        if (title) {
          articles.push({ title, summary, date, category });
        }
      });
      return articles.slice(0, 5); // 최신 5개만
    });
    
    // 상태 업데이트
    await bot.editMessageText('🤖 AI로 뉴스를 분석 중입니다...', {
      chat_id: chatId,
      message_id: statusMessage.message_id
    });
    
    // GPT로 요약 생성
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 한국 AI 시장 전문가입니다. 뉴스를 분석하여 핵심 트렌드와 시사점을 도출합니다."
        },
        {
          role: "user",
          content: `다음 AI 뉴스들을 분석하여 요약해주세요:\n\n${JSON.stringify(newsData, null, 2)}\n\n다음 형식으로 답변해주세요:\n1. 🎯 핵심 트렌드 (3개)\n2. 💡 주요 인사이트\n3. 🚀 주목할 기업/기술\n4. 📊 한국 시장 영향`
        }
      ],
      max_tokens: 500
    });
    
    const summary = completion.choices[0].message.content;
    
    // 결과 전송
    await bot.deleteMessage(chatId, statusMessage.message_id);
    
    await bot.sendMessage(chatId, `📋 *AI 트렌드 뉴스 요약*\n\n${summary}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔗 전체 기사 보기', url: 'http://localhost:5173/korean' },
          { text: '🔄 다시 분석', callback_data: 'refresh_analysis' }
        ]]
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, `❌ 오류가 발생했습니다: ${error.message}`);
  } finally {
    await page.close();
  }
}

// 명령어 핸들러
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  bot.sendMessage(chatId, 
    `👋 안녕하세요! AI 웹 자동화 봇입니다.\n\n` +
    `사용 가능한 명령어:\n` +
    `🔸 /analyze - AI 트렌드 뉴스 분석\n` +
    `🔸 /visit [URL] - 웹사이트 방문\n` +
    `🔸 /screenshot - 현재 페이지 스크린샷\n` +
    `🔸 /task [설명] - 자유로운 작업 요청\n` +
    `🔸 /github trending [언어] - GitHub 트렌딩\n` +
    `🔸 /github analyze [owner/repo] - 저장소 분석\n` +
    `🔸 /github search [쿼리] - 코드 검색\n` +
    `🔸 /github topic [토픽] - 토픽 탐색\n` +
    `🔸 /stop - 브라우저 종료`
  );
});

// AI 트렌드 분석 명령
bot.onText(/\/analyze/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  await summarizeAITrends(chatId);
});

// URL 방문 명령
bot.onText(/\/visit (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const url = match[1];
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const browser = await getBrowserSession(userId);
  const page = await browser.newPage();
  
  try {
    await bot.sendMessage(chatId, `🌐 ${url} 접속 중...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, chatId);
    
    const title = await page.title();
    await bot.sendMessage(chatId, `✅ 접속 완료: ${title}`);
  } catch (error) {
    await bot.sendMessage(chatId, `❌ 접속 실패: ${error.message}`);
  }
});

// 자유 작업 요청
bot.onText(/\/task (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const task = match[1];
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const statusMessage = await bot.sendMessage(chatId, '🤔 작업을 분석하고 있습니다...');
  
  try {
    // GPT로 작업 계획 생성
    const planning = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 웹 자동화 전문가입니다. 사용자의 요청을 단계별 작업으로 분해합니다."
        },
        {
          role: "user",
          content: `다음 작업을 수행하기 위한 단계를 만들어주세요: "${task}"\n\n단계별로 구체적인 행동을 포함해주세요.`
        }
      ],
      max_tokens: 300
    });
    
    const plan = planning.choices[0].message.content;
    
    await bot.editMessageText(
      `📋 작업 계획:\n\n${plan}\n\n이 계획대로 진행할까요?`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ 실행', callback_data: `execute_task:${task}` },
            { text: '❌ 취소', callback_data: 'cancel_task' }
          ]]
        }
      }
    );
  } catch (error) {
    await bot.sendMessage(chatId, `❌ 오류: ${error.message}`);
  }
});

// 브라우저 종료
bot.onText(/\/stop/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (browserSessions.has(userId)) {
    const browser = browserSessions.get(userId);
    await browser.close();
    browserSessions.delete(userId);
    await bot.sendMessage(chatId, '✅ 브라우저를 종료했습니다.');
  } else {
    await bot.sendMessage(chatId, 'ℹ️ 활성 브라우저 세션이 없습니다.');
  }
});

// 콜백 쿼리 핸들러
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;
  
  if (data === 'refresh_analysis') {
    await summarizeAITrends(chatId);
  } else if (data === 'cancel_task') {
    await bot.editMessageText('❌ 작업이 취소되었습니다.', {
      chat_id: chatId,
      message_id: msg.message_id
    });
  } else if (data.startsWith('execute_task:')) {
    const task = data.replace('execute_task:', '');
    await bot.editMessageText('🚀 작업을 실행 중입니다...', {
      chat_id: chatId,
      message_id: msg.message_id
    });
    // 실제 작업 실행 로직 추가 필요
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});

// GitHub 명령어 핸들러
bot.onText(/\/github trending\s*(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const language = match[1] || '';
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const statusMessage = await bot.sendMessage(chatId, `🔍 GitHub ${language ? language + ' ' : ''}트렌딩 저장소를 검색 중...`);
  
  try {
    const repos = await githubExplorer.getTrendingRepos(language);
    
    let message = `🔥 *GitHub 트렌딩 ${language ? '(' + language + ')' : ''}*\n\n`;
    
    repos.slice(0, 10).forEach((repo, index) => {
      message += `${index + 1}. *${repo.name}*\n`;
      message += `⭐ ${repo.stars} | 🍴 ${repo.forks}\n`;
      message += `${repo.description || '설명 없음'}\n`;
      message += `[🔗 보기](${repo.url})\n\n`;
    });
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    await bot.editMessageText(`❌ 오류: ${error.message}`, {
      chat_id: chatId,
      message_id: statusMessage.message_id
    });
  }
});

// GitHub 저장소 분석
bot.onText(/\/github analyze (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const repoPath = match[1];
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const [owner, repo] = repoPath.split('/');
  if (!owner || !repo) {
    return bot.sendMessage(chatId, '❌ 올바른 형식: /github analyze owner/repo');
  }
  
  const statusMessage = await bot.sendMessage(chatId, `🔍 ${repoPath} 저장소를 분석 중...`);
  
  try {
    const repoDetails = await githubExplorer.getRepoDetails(owner, repo);
    const analysis = await githubExplorer.analyzeRepository(repoDetails);
    
    await bot.editMessageText(
      `📊 *${repoPath} 분석 결과*\n\n${analysis}`,
      {
        chat_id: chatId,
        message_id: statusMessage.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔗 저장소 보기', url: repoDetails.repo.html_url },
            { text: '📋 유사 프로젝트', callback_data: `similar:${repoPath}` }
          ]]
        }
      }
    );
  } catch (error) {
    await bot.editMessageText(`❌ 오류: ${error.message}`, {
      chat_id: chatId,
      message_id: statusMessage.message_id
    });
  }
});

// GitHub 코드 검색
bot.onText(/\/github search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const query = match[1];
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const statusMessage = await bot.sendMessage(chatId, `🔍 "${query}" 코드를 검색 중...`);
  
  try {
    const results = await githubExplorer.searchCode(query);
    
    let message = `🔍 *코드 검색 결과: "${query}"*\n\n`;
    
    if (results.length === 0) {
      message += '결과가 없습니다.';
    } else {
      results.slice(0, 10).forEach((result, index) => {
        message += `${index + 1}. *${result.repository}*\n`;
        message += `📄 ${result.path}\n`;
        message += `[🔗 보기](${result.url})\n\n`;
      });
    }
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    await bot.editMessageText(`❌ 오류: ${error.message}`, {
      chat_id: chatId,
      message_id: statusMessage.message_id
    });
  }
});

// GitHub 토픽 탐색
bot.onText(/\/github topic (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const topic = match[1];
  
  if (!checkAuthorization(userId)) {
    return bot.sendMessage(chatId, '❌ 권한이 없습니다.');
  }
  
  const statusMessage = await bot.sendMessage(chatId, `🏷️ "${topic}" 토픽을 탐색 중...`);
  
  try {
    const { repos, analysis } = await githubExplorer.exploreByTopic(topic);
    
    let message = `🏷️ *토픽: ${topic}*\n\n`;
    message += `*AI 분석:*\n${analysis}\n\n`;
    message += `*상위 저장소:*\n\n`;
    
    repos.slice(0, 5).forEach((repo, index) => {
      message += `${index + 1}. *${repo.name}*\n`;
      message += `⭐ ${repo.stars} | ${repo.language || 'N/A'}\n`;
      message += `[🔗 보기](${repo.url})\n\n`;
    });
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: statusMessage.message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
  } catch (error) {
    await bot.editMessageText(`❌ 오류: ${error.message}`, {
      chat_id: chatId,
      message_id: statusMessage.message_id
    });
  }
});

// 콜백 쿼리 핸들러 업데이트
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const data = callbackQuery.data;
  
  if (data === 'refresh_analysis') {
    await summarizeAITrends(chatId);
  } else if (data === 'cancel_task') {
    await bot.editMessageText('❌ 작업이 취소되었습니다.', {
      chat_id: chatId,
      message_id: msg.message_id
    });
  } else if (data.startsWith('execute_task:')) {
    const task = data.replace('execute_task:', '');
    await bot.editMessageText('🚀 작업을 실행 중입니다...', {
      chat_id: chatId,
      message_id: msg.message_id
    });
    // 실제 작업 실행 로직 추가 필요
  } else if (data.startsWith('similar:')) {
    const repoPath = data.replace('similar:', '');
    const [owner, repo] = repoPath.split('/');
    
    try {
      const repoDetails = await githubExplorer.getRepoDetails(owner, repo);
      const similar = await githubExplorer.findSimilarProjects(
        repoDetails.repo.topics || [],
        repoDetails.repo.language,
        repoPath
      );
      
      let message = `🔗 *${repoPath}와 유사한 프로젝트*\n\n`;
      similar.forEach((proj, index) => {
        message += `${index + 1}. *${proj.name}*\n`;
        message += `⭐ ${proj.stars} | 유사도: ${(proj.similarity * 100).toFixed(0)}%\n`;
        message += `${proj.description || '설명 없음'}\n`;
        message += `[🔗 보기](${proj.url})\n\n`;
      });
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (error) {
      await bot.sendMessage(chatId, `❌ 오류: ${error.message}`);
    }
  }
  
  await bot.answerCallbackQuery(callbackQuery.id);
});

// 정리 작업
process.on('SIGINT', async () => {
  console.log('봇 종료 중...');
  for (const [userId, browser] of browserSessions) {
    await browser.close();
  }
  process.exit(0);
});

module.exports = bot;