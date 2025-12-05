const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AdvancedWebAgent {
  constructor(page, bot, chatId) {
    this.page = page;
    this.bot = bot;
    this.chatId = chatId;
  }

  // 페이지 분석 및 이해
  async analyzePage() {
    const pageContent = await this.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent.trim()
        })),
        buttons: Array.from(document.querySelectorAll('button, a[role="button"]')).map(btn => ({
          text: btn.textContent.trim(),
          id: btn.id,
          classes: btn.className
        })),
        forms: Array.from(document.querySelectorAll('form')).map(form => ({
          id: form.id,
          action: form.action,
          fields: Array.from(form.querySelectorAll('input, textarea, select')).map(field => ({
            type: field.type,
            name: field.name,
            id: field.id,
            placeholder: field.placeholder,
            required: field.required
          }))
        })),
        links: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        }))
      };
    });

    return pageContent;
  }

  // AI 기반 요소 찾기
  async findElementByDescription(description) {
    const pageAnalysis = await this.analyzePage();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 웹 페이지 분석 전문가입니다. 사용자의 설명에 가장 적합한 요소를 찾아줍니다."
        },
        {
          role: "user",
          content: `페이지 분석 결과:\n${JSON.stringify(pageAnalysis, null, 2)}\n\n사용자가 찾는 요소: "${description}"\n\n가장 적합한 요소를 선택하고 CSS 선택자를 제안해주세요.`
        }
      ],
      max_tokens: 150
    });

    return completion.choices[0].message.content;
  }

  // 복잡한 작업 실행
  async executeComplexTask(taskDescription) {
    const steps = await this.planTask(taskDescription);
    const results = [];

    for (const [index, step] of steps.entries()) {
      await this.bot.sendMessage(this.chatId, `📍 단계 ${index + 1}/${steps.length}: ${step.description}`);
      
      try {
        const result = await this.executeStep(step);
        results.push(result);
        
        // 각 단계 후 스크린샷
        if (step.screenshot) {
          await this.takeScreenshot(`단계 ${index + 1} 완료`);
        }
      } catch (error) {
        await this.bot.sendMessage(this.chatId, `⚠️ 단계 ${index + 1} 실패: ${error.message}`);
        break;
      }
    }

    return results;
  }

  // 작업 계획 생성
  async planTask(taskDescription) {
    const pageAnalysis = await this.analyzePage();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 웹 자동화 전문가입니다. 구체적인 단계별 작업 계획을 JSON 형식으로 생성합니다."
        },
        {
          role: "user",
          content: `현재 페이지: ${pageAnalysis.title} (${pageAnalysis.url})\n\n작업: ${taskDescription}\n\n이 작업을 수행하기 위한 단계를 JSON 배열로 만들어주세요. 각 단계는 다음 형식을 따라야 합니다:\n[{ "action": "click|type|wait|scroll", "target": "CSS선택자 또는 설명", "value": "입력값(필요시)", "description": "단계 설명", "screenshot": true/false }]`
        }
      ],
      max_tokens: 500
    });

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch {
      // JSON 파싱 실패 시 기본 계획
      return [{
        action: "analyze",
        description: "페이지 분석 중",
        screenshot: true
      }];
    }
  }

  // 단계 실행
  async executeStep(step) {
    switch (step.action) {
      case 'click':
        await this.page.click(step.target);
        await this.page.waitForTimeout(1000);
        break;
        
      case 'type':
        await this.page.type(step.target, step.value);
        break;
        
      case 'wait':
        await this.page.waitForTimeout(parseInt(step.value) || 2000);
        break;
        
      case 'scroll':
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        break;
        
      case 'waitForElement':
        await this.page.waitForSelector(step.target, { timeout: 10000 });
        break;
        
      default:
        console.log(`알 수 없는 액션: ${step.action}`);
    }
    
    return { success: true, step };
  }

  // 스마트 폼 채우기
  async fillFormIntelligently(formData) {
    const forms = await this.page.$$('form');
    
    if (forms.length === 0) {
      throw new Error('페이지에 폼이 없습니다.');
    }

    // 각 필드에 대해 AI가 적절한 값 매칭
    const fields = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(field => ({
        type: field.type,
        name: field.name,
        id: field.id,
        placeholder: field.placeholder,
        label: field.labels?.[0]?.textContent
      }));
    });

    for (const field of fields) {
      const value = await this.matchFieldValue(field, formData);
      if (value) {
        const selector = field.id ? `#${field.id}` : `[name="${field.name}"]`;
        await this.page.type(selector, value);
      }
    }
  }

  // 필드 값 매칭
  async matchFieldValue(field, data) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 폼 필드와 데이터를 매칭하는 전문가입니다. 적절한 값을 찾아 반환합니다."
        },
        {
          role: "user",
          content: `필드 정보: ${JSON.stringify(field)}\n\n사용 가능한 데이터: ${JSON.stringify(data)}\n\n이 필드에 적합한 값을 찾아주세요. 값만 반환하고, 없으면 null을 반환하세요.`
        }
      ],
      max_tokens: 50
    });

    const result = completion.choices[0].message.content.trim();
    return result === 'null' ? null : result;
  }

  // 동적 콘텐츠 대기
  async waitForDynamicContent() {
    // 로딩 인디케이터 확인
    const loadingSelectors = [
      '.loading', '.spinner', '.loader', 
      '[class*="loading"]', '[class*="spinner"]',
      '.skeleton'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { hidden: true, timeout: 5000 });
      } catch {
        // 타임아웃은 무시
      }
    }

    // 네트워크 활동 대기
    await this.page.waitForLoadState('networkidle');
  }

  // 스크린샷 찍기
  async takeScreenshot(caption = '') {
    const screenshotPath = `/tmp/screenshot_${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: false });
    
    await this.bot.sendPhoto(this.chatId, screenshotPath, {
      caption: `📸 ${caption}`
    });
    
    // 임시 파일 삭제
    const fs = require('fs').promises;
    await fs.unlink(screenshotPath);
  }

  // 비전 API를 사용한 시각적 분석
  async analyzeVisually(question) {
    const screenshot = await this.page.screenshot({ encoding: 'base64' });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question },
            { 
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshot}`,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    return completion.choices[0].message.content;
  }

  // 테이블 데이터 추출
  async extractTableData() {
    const tables = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('table')).map(table => {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
          return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
        });
        return { headers, rows };
      });
    });

    return tables;
  }

  // 자동 로그인
  async autoLogin(credentials) {
    // 로그인 폼 찾기
    const loginForm = await this.findLoginForm();
    
    if (!loginForm) {
      throw new Error('로그인 폼을 찾을 수 없습니다.');
    }

    // 사용자명/이메일 입력
    await this.page.type(loginForm.usernameSelector, credentials.username);
    
    // 비밀번호 입력
    await this.page.type(loginForm.passwordSelector, credentials.password);
    
    // 로그인 버튼 클릭
    await this.page.click(loginForm.submitSelector);
    
    // 로그인 완료 대기
    await this.waitForDynamicContent();
    
    // 로그인 성공 확인
    const isLoggedIn = await this.checkLoginSuccess();
    
    if (!isLoggedIn) {
      throw new Error('로그인에 실패했습니다.');
    }
  }

  // 로그인 폼 찾기
  async findLoginForm() {
    const forms = await this.page.evaluate(() => {
      const passwordInput = document.querySelector('input[type="password"]');
      if (!passwordInput) return null;
      
      const form = passwordInput.closest('form');
      const usernameInput = form?.querySelector('input[type="text"], input[type="email"]');
      const submitButton = form?.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
      
      if (usernameInput && submitButton) {
        return {
          usernameSelector: usernameInput.id ? `#${usernameInput.id}` : `input[name="${usernameInput.name}"]`,
          passwordSelector: passwordInput.id ? `#${passwordInput.id}` : `input[name="${passwordInput.name}"]`,
          submitSelector: submitButton.id ? `#${submitButton.id}` : 'button[type="submit"]'
        };
      }
      
      return null;
    });
    
    return forms;
  }

  // 로그인 성공 확인
  async checkLoginSuccess() {
    // 일반적인 로그인 성공 지표들
    const successIndicators = [
      'logout', 'sign out', '로그아웃',
      'dashboard', 'profile', 'mypage',
      '대시보드', '마이페이지', '프로필'
    ];

    const pageText = await this.page.evaluate(() => document.body.textContent.toLowerCase());
    
    return successIndicators.some(indicator => pageText.includes(indicator));
  }
}

module.exports = AdvancedWebAgent;