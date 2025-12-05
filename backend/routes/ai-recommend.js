const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// OpenAI 설정 (v4 방식)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Claude 설정
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI 모델 추천 엔드포인트
router.post('/gpt-recommend', async (req, res) => {
  try {
    const { query, useModel = 'gpt' } = req.body;

    if (!query) {
      return res.status(400).json({ error: '쿼리가 필요합니다.' });
    }

    let recommendations;

    if (useModel === 'claude') {
      // Claude API 사용 - 최신 모델 사용
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // 최신 Claude 3.5 Sonnet 모델
        max_tokens: 1000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `사용자가 "${query}"를 하고 싶어합니다. 
          이에 적합한 Hugging Face 모델들을 추천해주세요.
          
          만약 여러 작업이 조합된 경우 (예: "번역하고 요약하기"), 각 작업에 필요한 모델들을 모두 추천해주세요.
          
          응답 형식(JSON):
          [
            {
              "modelId": "모델 이름 (예: bert-base-uncased)",
              "reason": "추천 이유를 한국어로 간단히 설명",
              "task": "이 모델이 담당할 작업 (예: 번역, 요약, 감정분석)"
            }
          ]
          
          - 조합 작업인 경우 3-5개 모델 추천
          - 단일 작업인 경우 3개 모델 추천
          - 실제로 Hugging Face에 존재하는 인기 있는 모델만 추천해주세요.`
        }]
      });

      // Claude 응답 파싱
      const claudeResponse = message.content[0].text;
      try {
        recommendations = JSON.parse(claudeResponse);
      } catch {
        // JSON 파싱 실패 시 텍스트에서 추출
        recommendations = extractRecommendationsFromText(claudeResponse);
      }

    } else {
      // OpenAI GPT API 사용 (v4 방식)
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI that recommends Hugging Face models based on user requirements. Always respond in JSON format.'
          },
          {
            role: 'user',
            content: `사용자가 "${query}"를 하고 싶어합니다. 
            이에 적합한 Hugging Face 모델들을 추천해주세요.
            
            만약 여러 작업이 조합된 경우 (예: "번역하고 요약하기"), 각 작업에 필요한 모델들을 모두 추천해주세요.
            
            응답 형식(JSON만 반환):
            [
              {
                "modelId": "모델 이름 (예: bert-base-uncased)",
                "reason": "추천 이유를 한국어로 간단히 설명",
                "task": "이 모델이 담당할 작업 (예: 번역, 요약, 감정분석)"
              }
            ]
            
            - 조합 작업인 경우 3-5개 모델 추천
            - 단일 작업인 경우 3개 모델 추천
            - 실제로 Hugging Face에 존재하는 인기 있는 모델만 추천해주세요.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const gptResponse = completion.choices[0].message.content;
      try {
        recommendations = JSON.parse(gptResponse);
      } catch {
        // JSON 파싱 실패 시 기본 추천
        recommendations = getDefaultRecommendations(query);
      }
    }

    res.json({ 
      recommendations,
      model: useModel
    });

  } catch (error) {
    console.error('AI 추천 에러:', error);
    
    // API 키가 없거나 에러가 발생한 경우 기본 추천 제공
    const defaultRecommendations = getDefaultRecommendations(req.body.query);
    
    res.status(200).json({
      recommendations: defaultRecommendations,
      model: 'fallback',
      error: 'AI API 호출 실패, 기본 추천을 제공합니다.'
    });
  }
});

// 텍스트에서 추천 정보 추출 (백업용)
function extractRecommendationsFromText(text) {
  // 간단한 파싱 로직
  const recommendations = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.includes('/') && line.includes('-')) {
      const modelMatch = line.match(/[\w-]+\/[\w-]+/);
      if (modelMatch) {
        recommendations.push({
          modelId: modelMatch[0],
          reason: line.split(':')[1] || '추천 모델입니다.'
        });
      }
    }
  }
  
  return recommendations.slice(0, 3);
}

// 기본 추천 로직
function getDefaultRecommendations(query) {
  const queryLower = query.toLowerCase();
  
  // 키워드 기반 추천
  if (queryLower.includes('한국어') || queryLower.includes('korean')) {
    if (queryLower.includes('번역') || queryLower.includes('translation')) {
      return [
        { modelId: 'Helsinki-NLP/opus-mt-ko-en', reason: '한국어-영어 번역에 특화된 모델' },
        { modelId: 'Helsinki-NLP/opus-mt-en-ko', reason: '영어-한국어 번역에 특화된 모델' },
        { modelId: 'facebook/mbart-large-50-many-to-many-mmt', reason: '다국어 번역 지원 모델' }
      ];
    } else if (queryLower.includes('요약') || queryLower.includes('summary')) {
      return [
        { modelId: 'gogamza/kobart-summarization', reason: '한국어 요약에 특화된 KoBART 모델' },
        { modelId: 'lcw99/t5-base-korean-text-summary', reason: '한국어 텍스트 요약용 T5 모델' },
        { modelId: 'psyche/kolongformer-base-summarization', reason: '한국어 긴 문서 요약 모델' }
      ];
    } else if (queryLower.includes('감정') || queryLower.includes('sentiment')) {
      return [
        { modelId: 'matthewburke/korean_sentiment', reason: '한국어 감정 분석 전용 모델' },
        { modelId: 'beomi/kcbert-base', reason: '한국어 BERT 모델로 감정 분석 가능' },
        { modelId: 'monologg/koelectra-base-v3-discriminator', reason: '한국어 이해에 뛰어난 KoELECTRA' }
      ];
    }
  }
  
  if (queryLower.includes('이미지') || queryLower.includes('image')) {
    if (queryLower.includes('생성') || queryLower.includes('generate')) {
      return [
        { modelId: 'stabilityai/stable-diffusion-2-1', reason: '고품질 이미지 생성 모델' },
        { modelId: 'runwayml/stable-diffusion-v1-5', reason: '안정적인 이미지 생성 모델' },
        { modelId: 'CompVis/stable-diffusion-v1-4', reason: '널리 사용되는 이미지 생성 모델' }
      ];
    } else if (queryLower.includes('분류') || queryLower.includes('classification')) {
      return [
        { modelId: 'google/vit-base-patch16-224', reason: 'Vision Transformer 기반 이미지 분류' },
        { modelId: 'microsoft/resnet-50', reason: 'ResNet-50 이미지 분류 모델' },
        { modelId: 'facebook/deit-small-patch16-224', reason: '효율적인 이미지 분류 모델' }
      ];
    }
  }
  
  if (queryLower.includes('음성') || queryLower.includes('speech') || queryLower.includes('audio')) {
    return [
      { modelId: 'openai/whisper-base', reason: '다국어 음성 인식 모델' },
      { modelId: 'facebook/wav2vec2-base-960h', reason: '영어 음성 인식 모델' },
      { modelId: 'kresnik/wav2vec2-large-xlsr-korean', reason: '한국어 음성 인식 모델' }
    ];
  }
  
  // 기본 추천
  return [
    { modelId: 'bert-base-uncased', reason: '다목적 텍스트 처리 기본 모델' },
    { modelId: 'gpt2', reason: '텍스트 생성을 위한 경량 모델' },
    { modelId: 'distilbert-base-uncased', reason: 'BERT의 경량화 버전' }
  ];
}

module.exports = router;