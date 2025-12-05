// Hugging Face API 설정
const HF_API_BASE = 'https://huggingface.co/api';
const HF_INFERENCE_API = 'https://api-inference.huggingface.co/models';

// API 토큰 (무료로 사용 가능, 더 높은 rate limit를 원하면 토큰 추가)
// https://huggingface.co/settings/tokens 에서 토큰 생성 가능
const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN || '';

// Hub API 호출 함수들
export const fetchModels = async (options = {}) => {
  const { limit = 30, sort = 'downloads', direction = -1, search = '' } = options;
  
  let url = `${HF_API_BASE}/models?limit=${limit}&sort=${sort}&direction=${direction}&full=true`;
  if (search) url += `&search=${search}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

// 모델 상세 정보 가져오기
export const fetchModelDetails = async (modelId) => {
  try {
    const response = await fetch(`${HF_API_BASE}/models/${modelId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching model details:', error);
    return null;
  }
};

export const fetchDatasets = async (options = {}) => {
  const { limit = 30, sort = 'downloads', direction = -1, search = '' } = options;
  
  let url = `${HF_API_BASE}/datasets?limit=${limit}&sort=${sort}&direction=${direction}`;
  if (search) url += `&search=${search}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
};

export const fetchSpaces = async (options = {}) => {
  const { limit = 30, sort = 'likes', direction = -1, search = '' } = options;
  
  let url = `${HF_API_BASE}/spaces?limit=${limit}&sort=${sort}&direction=${direction}`;
  if (search) url += `&search=${search}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return [];
  }
};

// Inference API 호출 함수들
export const runInference = async (modelId, inputs, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // 토큰이 있으면 추가
  if (HF_TOKEN) {
    headers['Authorization'] = `Bearer ${HF_TOKEN}`;
  }
  
  try {
    const response = await fetch(`${HF_INFERENCE_API}/${modelId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs, ...options }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
};

// 텍스트 요약
export const summarizeText = async (text, maxLength = 150) => {
  return runInference('facebook/bart-large-cnn', text, {
    parameters: { max_length: maxLength, min_length: 30 }
  });
};

// 텍스트 번역 (영어 → 한국어)
export const translateToKorean = async (text) => {
  return runInference('Helsinki-NLP/opus-mt-en-ko', text);
};

// 감정 분석
export const analyzeSentiment = async (text) => {
  return runInference('nlptown/bert-base-multilingual-uncased-sentiment', text);
};

// 텍스트 분류
export const classifyText = async (text, candidate_labels) => {
  return runInference('facebook/bart-large-mnli', {
    inputs: text,
    parameters: { candidate_labels }
  });
};

// 이미지 분류
export const classifyImage = async (imageUrl) => {
  return runInference('google/vit-base-patch16-224', imageUrl);
};

// 텍스트 생성
export const generateText = async (prompt, maxLength = 100) => {
  return runInference('gpt2', prompt, {
    parameters: { max_length: maxLength }
  });
};

// 질문 답변
export const questionAnswering = async (question, context) => {
  return runInference('deepset/roberta-base-squad2', {
    question,
    context
  });
};

// README 콘텐츠 가져오기
export const fetchReadme = async (repoId, type = 'models') => {
  try {
    const response = await fetch(`https://huggingface.co/${repoId}/raw/main/README.md`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
};