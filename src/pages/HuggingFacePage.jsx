import React, { useState, useEffect } from 'react';
import { Bot, Database, Rocket, TrendingUp, Github, Star, Download, Calendar, Filter, Search, ExternalLink, Zap, Brain, Image as ImageIcon, X, Code, Users, GitBranch, Info, MessageSquare, FileText, Activity, Globe, Shield, Clock, Cpu, HardDrive, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../store/useToastStore';
import { 
  fetchModels, 
  fetchDatasets, 
  fetchSpaces, 
  summarizeText, 
  translateToKorean, 
  analyzeSentiment,
  fetchModelDetails,
  fetchReadme 
} from '../lib/huggingface';

const HuggingFacePage = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('trending');
  const [inferenceText, setInferenceText] = useState('');
  const [inferenceResult, setInferenceResult] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [readmeContent, setReadmeContent] = useState(null);
  // GPT 추천 관련 상태
  const [gptQuery, setGptQuery] = useState('');
  const [gptRecommendations, setGptRecommendations] = useState(null);
  const [gptLoading, setGptLoading] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState([]);
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 한 페이지당 10개만 표시
  const toast = useToast();

  // 더미 데이터 - 더 상세한 정보 포함
  const dummyModels = [
    { 
      id: 'meta-llama/Llama-2-70b-chat-hf', 
      description: 'Llama 2 70B Chat - 메타의 대화형 AI 모델로, 70억 개의 파라미터를 가진 대규모 언어 모델. 다양한 대화 시나리오에서 뛰어난 성능을 보여줍니다.',
      likes: 12543, 
      downloads: 2847291, 
      task: 'text-generation',
      pipeline_tag: 'text-generation',
      library_name: 'transformers',
      license: 'llama2',
      language: ['en'],
      tags: ['llama', 'llama-2', 'chat', 'conversational', 'text-generation'],
      lastModified: new Date('2024-01-15').toISOString(),
      private: false,
      gated: true,
      modelId: 'meta-llama/Llama-2-70b-chat-hf',
      author: { name: 'Meta', avatarUrl: null, fullname: 'Meta AI' },
      siblings: [{ rfilename: 'pytorch_model.bin', size: 140000000000 }]
    },
    { 
      id: 'openai/whisper-large-v3', 
      description: 'Whisper Large v3 - OpenAI의 최신 음성 인식 모델. 680,000시간 이상의 다국어 음성 데이터로 학습되어 높은 정확도를 자랑합니다.',
      likes: 8932, 
      downloads: 1928374, 
      task: 'automatic-speech-recognition',
      pipeline_tag: 'automatic-speech-recognition',
      library_name: 'transformers',
      license: 'apache-2.0',
      language: ['en', 'ko', 'ja', 'zh', 'de', 'fr', 'es'],
      tags: ['whisper', 'speech', 'asr', 'automatic-speech-recognition', 'multilingual'],
      lastModified: new Date('2024-02-20').toISOString(),
      private: false,
      modelId: 'openai/whisper-large-v3'
    },
    { 
      id: 'stabilityai/stable-diffusion-xl-base-1.0', 
      description: 'Stable Diffusion XL - Stability AI의 최신 이미지 생성 모델. 1024x1024 해상도의 고품질 이미지를 생성할 수 있으며, 향상된 이미지 품질과 구성력을 제공합니다.',
      likes: 15234, 
      downloads: 4829183, 
      task: 'text-to-image',
      pipeline_tag: 'text-to-image',
      library_name: 'diffusers',
      license: 'openrail++',
      tags: ['stable-diffusion', 'stable-diffusion-xl', 'text-to-image', 'diffusers', 'base'],
      lastModified: new Date('2023-12-10').toISOString(),
      private: false
    },
    { 
      id: 'sentence-transformers/all-MiniLM-L6-v2', 
      description: '문장 임베딩을 위한 경량 모델. 384차원의 벡터를 생성하며, 시맨틱 검색, 클러스터링, 문장 유사도 계산에 최적화되어 있습니다.',
      likes: 5421, 
      downloads: 8372910, 
      task: 'sentence-similarity',
      pipeline_tag: 'feature-extraction',
      library_name: 'sentence-transformers',
      license: 'apache-2.0',
      language: ['en'],
      tags: ['sentence-transformers', 'feature-extraction', 'sentence-similarity', 'embeddings'],
      lastModified: new Date('2023-11-05').toISOString(),
      private: false
    },
    { 
      id: 'facebook/bart-large-mnli', 
      description: 'BART Large MNLI - Facebook의 자연어 추론 모델. Multi-Genre Natural Language Inference 데이터셋으로 학습되어 텍스트 분류, 감정 분석 등에 활용 가능합니다.',
      likes: 3210, 
      downloads: 1029384, 
      task: 'text-classification',
      pipeline_tag: 'zero-shot-classification',
      library_name: 'transformers',
      license: 'apache-2.0',
      language: ['en'],
      tags: ['bart', 'mnli', 'zero-shot-classification', 'text-classification'],
      lastModified: new Date('2023-09-20').toISOString(),
      private: false
    },
  ];

  const dummyDatasets = [
    { 
      id: 'wikipedia', 
      description: '위키피디아 전체 텍스트 데이터셋. 20GB 이상의 백과사전 데이터로 언어 모델 사전학습에 널리 사용됩니다.',
      likes: 4532, 
      downloads: 892734,
      tags: ['text', 'wikipedia', 'encyclopedia', 'multilingual'],
      size: '20.3 GB',
      lastModified: new Date('2024-01-01').toISOString(),
      language: ['en', 'ko', 'ja', 'zh', 'de', 'fr'],
      task_categories: ['text-generation', 'fill-mask'],
      license: 'cc-by-sa-3.0'
    },
    { 
      id: 'common_voice', 
      description: '모질라의 다국어 음성 인식 데이터셋. 100개 이상의 언어로 구성되어 있으며, 커뮤니티 기반으로 수집된 오픈소스 음성 데이터입니다.',
      likes: 3421, 
      downloads: 543219,
      tags: ['audio', 'speech', 'multilingual', 'crowd-sourced'],
      size: '87.6 GB',
      lastModified: new Date('2024-02-15').toISOString(),
      language: ['en', 'ko', 'ja', 'zh', 'de', 'fr', 'es', 'ru'],
      task_categories: ['automatic-speech-recognition'],
      license: 'cc0-1.0'
    },
    { 
      id: 'imagenet-1k', 
      description: 'ImageNet 1000 클래스 이미지 데이터셋. 120만 개 이상의 이미지로 구성되어 있으며, 컴퓨터 비전 연구의 표준 벤치마크입니다.',
      likes: 8734, 
      downloads: 1928374,
      tags: ['image', 'classification', 'imagenet', 'benchmark'],
      size: '144.0 GB',
      lastModified: new Date('2023-06-10').toISOString(),
      task_categories: ['image-classification'],
      license: 'other'
    }
  ];

  const dummySpaces = [
    { 
      id: 'stabilityai/stable-diffusion', 
      description: 'Stable Diffusion 웹 UI 데모. 텍스트로부터 이미지를 생성할 수 있는 인터랙티브 웹 애플리케이션입니다.',
      likes: 23421,
      sdk: 'gradio',
      sdk_version: '4.0.2',
      app_file: 'app.py',
      tags: ['stable-diffusion', 'text-to-image', 'image-generation'],
      lastModified: new Date('2024-02-28').toISOString(),
      runtime: { stage: 'RUNNING', hardware: 'A10G' },
      private: false
    },
    { 
      id: 'openai/whisper', 
      description: 'Whisper 음성 인식 데모. 음성 파일을 업로드하면 텍스트로 변환해주는 서비스입니다.',
      likes: 12893,
      sdk: 'gradio',
      sdk_version: '3.50.2',
      app_file: 'app.py',
      tags: ['whisper', 'speech-recognition', 'audio', 'transcription'],
      lastModified: new Date('2024-01-20').toISOString(),
      runtime: { stage: 'RUNNING', hardware: 'T4 medium' },
      private: false
    },
    { 
      id: 'coqui/xtts', 
      description: '다국어 음성 합성 데모. 텍스트를 자연스러운 음성으로 변환하며, 음성 복제 기능도 제공합니다.',
      likes: 8934,
      sdk: 'docker',
      tags: ['tts', 'text-to-speech', 'voice-cloning', 'multilingual'],
      lastModified: new Date('2024-02-10').toISOString(),
      runtime: { stage: 'RUNNING', hardware: 'T4 small' },
      private: false
    }
  ];

  // Hugging Face Hub 데이터 가져오기
  const fetchHuggingFaceData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 - 성능 최적화를 위해 개수 줄임
      const [modelsData, datasetsData, spacesData] = await Promise.all([
        fetchModels({ limit: 20, sort: 'downloads' }),  // 20개로 줄임
        fetchDatasets({ limit: 20, sort: 'downloads' }), // 20개로 줄임
        fetchSpaces({ limit: 20, sort: 'likes' })        // 20개로 줄임
      ]);

      setModels(modelsData);
      setDatasets(datasetsData);
      setSpaces(spacesData);
      
      // 데이터가 없으면 더미 데이터 사용
      if (modelsData.length === 0) setModels(dummyModels);
      if (datasetsData.length === 0) setDatasets(dummyDatasets);
      if (spacesData.length === 0) setSpaces(dummySpaces);

      toast.success('Hugging Face 데이터를 성공적으로 불러왔습니다!');
    } catch (error) {
      console.error('Error fetching HF data:', error);
      toast.error('API 호출 중 오류가 발생했습니다. 더미 데이터를 사용합니다.');
      // 에러 시 더미 데이터 사용
      setModels(dummyModels);
      setDatasets(dummyDatasets);
      setSpaces(dummySpaces);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHuggingFaceData();
  }, []);

  // GPT에게 추천받기
  const getGPTRecommendations = async (useModel = 'gpt') => {
    if (!gptQuery.trim()) {
      toast.warning('어떤 작업을 하고 싶은지 설명해주세요.');
      return;
    }

    setGptLoading(true);
    try {
      // 백엔드 API 호출
      const response = await fetch('http://localhost:5000/api/gpt-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: gptQuery,
          useModel: useModel // 'gpt' 또는 'claude'
        })
      });

      const data = await response.json();
      
      if (data.error && data.recommendations) {
        // API 키 없을 때 기본 추천 사용
        toast.info(data.error);
      } else if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      
      setGptRecommendations(data.recommendations);

      // 추천받은 모델들을 HuggingFace에서 검색
      const searchPromises = data.recommendations.map(async (rec) => {
        const models = await fetchModels({ search: rec.modelId, limit: 5 });
        return models[0]; // 첫 번째 결과만 사용
      });

      const results = await Promise.all(searchPromises);
      setRecommendedItems(results.filter(Boolean));
      
      toast.success('AI 추천을 완료했습니다!');
    } catch (error) {
      console.error('GPT 추천 에러:', error);
      // 더미 추천 데이터 사용
      const dummyRecommendations = [
        { modelId: 'bert-base-uncased', reason: '텍스트 분류에 적합한 기본 모델' },
        { modelId: 'gpt2', reason: '텍스트 생성을 위한 경량 모델' },
        { modelId: 'distilbert-base-uncased', reason: 'BERT의 경량화 버전' }
      ];
      setGptRecommendations(dummyRecommendations);
      toast.info('더미 추천 데이터를 사용합니다.');
    } finally {
      setGptLoading(false);
    }
  };

  // Inference API 호출
  const runInference = async () => {
    if (!inferenceText || !selectedModel) {
      toast.warning('텍스트와 모델을 선택해주세요.');
      return;
    }

    setLoading(true);
    setInferenceResult(null);
    
    try {
      let result = {};
      
      switch (selectedModel) {
        case 'summarization':
          const summaryResult = await summarizeText(inferenceText);
          result.summary = summaryResult[0]?.summary_text || '요약 생성에 실패했습니다.';
          break;
          
        case 'translation':
          const translationResult = await translateToKorean(inferenceText);
          result.translation = translationResult[0]?.translation_text || '번역에 실패했습니다.';
          break;
          
        case 'sentiment':
          const sentimentResult = await analyzeSentiment(inferenceText);
          if (sentimentResult && sentimentResult[0]) {
            // 별점을 감정으로 변환 (1-2: 부정, 3: 중립, 4-5: 긍정)
            const stars = parseInt(sentimentResult[0].label.split(' ')[0]);
            result.sentiment = {
              label: stars <= 2 ? 'NEGATIVE' : stars >= 4 ? 'POSITIVE' : 'NEUTRAL',
              score: sentimentResult[0].score,
              stars: stars
            };
          }
          break;
      }
      
      setInferenceResult(result);
      toast.success('분석이 완료되었습니다!');
    } catch (error) {
      console.error('Inference error:', error);
      
      // 에러 메시지 개선
      if (error.message.includes('loading')) {
        toast.warning('모델을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      } else {
        toast.error('분석 중 오류가 발생했습니다. 다른 모델을 시도해보세요.');
      }
      
      // 더미 결과 표시
      setInferenceResult({
        error: true,
        message: '실제 API 호출에 실패했습니다. 아래는 예시 결과입니다.',
        summary: "AI 기술이 빠르게 발전하고 있습니다. 특히 자연어 처리와 컴퓨터 비전 분야에서 놀라운 성과를 보이고 있습니다.",
        translation: "AI technology is rapidly advancing. Particularly in natural language processing and computer vision, it shows remarkable achievements.",
        sentiment: { label: "POSITIVE", score: 0.85, stars: 4 }
      });
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 데이터
  const getFilteredData = () => {
    let data = [];
    if (activeTab === 'models') data = models;
    else if (activeTab === 'datasets') data = datasets;
    else if (activeTab === 'spaces') data = spaces;

    if (searchQuery) {
      data = data.filter(item => 
        item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return data;
  };

  const filteredData = getFilteredData();
  
  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  // 탭이나 검색이 변경되면 첫 페이지로
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedFilter]);

  // 숫자 포맷팅 함수
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 태스크/카테고리에 따른 아이콘과 색상 반환
  const getTaskInfo = (task) => {
    const taskMap = {
      'text-generation': { icon: MessageSquare, color: 'blue', label: '텍스트 생성' },
      'text-classification': { icon: FileText, color: 'green', label: '텍스트 분류' },
      'automatic-speech-recognition': { icon: Activity, color: 'purple', label: '음성 인식' },
      'text-to-image': { icon: ImageIcon, color: 'pink', label: '이미지 생성' },
      'sentence-similarity': { icon: GitBranch, color: 'indigo', label: '문장 유사도' },
      'feature-extraction': { icon: Cpu, color: 'orange', label: '특징 추출' },
      'zero-shot-classification': { icon: Brain, color: 'yellow', label: 'Zero-shot 분류' },
      'image-classification': { icon: ImageIcon, color: 'teal', label: '이미지 분류' },
      'fill-mask': { icon: Code, color: 'gray', label: '마스크 채우기' },
    };
    return taskMap[task] || { icon: Zap, color: 'gray', label: task };
  };

  // 아이템 클릭 핸들러
  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setItemDetails(null);
    setReadmeContent(null);
    setDetailsLoading(true);

    try {
      // 모델인 경우에만 상세 정보 가져오기
      if (activeTab === 'models') {
        const [details, readme] = await Promise.all([
          fetchModelDetails(item.id),
          fetchReadme(item.id, 'models')
        ]);
        if (details) {
          setItemDetails(details);
        }
        if (readme) {
          setReadmeContent(readme.substring(0, 2000) + (readme.length > 2000 ? '...' : ''));
        }
      } else {
        // 다른 타입에 대해서도 README 시도
        const readme = await fetchReadme(item.id, activeTab);
        if (readme) {
          setReadmeContent(readme.substring(0, 2000) + (readme.length > 2000 ? '...' : ''));
        }
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
      // 에러 무시 (부분적 실패 허용)
    } finally {
      setDetailsLoading(false);
    }
  };

  // 상세 정보 모달 닫기
  const closeDetails = () => {
    setSelectedItem(null);
    setItemDetails(null);
    setReadmeContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bot className="w-6 h-6 text-yellow-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Hugging Face 트렌드</h1>
            </div>
            <button
              onClick={fetchHuggingFaceData}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              새로고침
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* GPT 추천 섹션 */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm p-6 border border-purple-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI 추천 모델 찾기
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-3">어떤 작업을 하고 싶으신가요? AI가 적합한 모델을 추천해드립니다.</p>
              
              {/* 빠른 아이디어 버튼들 */}
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">빠른 선택:</span>
                <button
                  onClick={() => setGptQuery('한국어 챗봇 만들기')}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  🤖 한국어 챗봇
                </button>
                <button
                  onClick={() => setGptQuery('이미지에서 텍스트 추출하기')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  📷 OCR
                </button>
                <button
                  onClick={() => setGptQuery('영어를 한국어로 실시간 번역')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  🌐 번역
                </button>
                <button
                  onClick={() => setGptQuery('음성을 텍스트로 변환하고 요약하기')}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                >
                  🎙️ 음성→텍스트
                </button>
                <button
                  onClick={() => setGptQuery('감정 분석하고 시각화하기')}
                  className="px-3 py-1 text-sm bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                >
                  💭 감정 분석
                </button>
                <button
                  onClick={() => setGptQuery('코드 자동 완성 및 버그 찾기')}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  👨‍💻 코딩 도우미
                </button>
              </div>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={gptQuery}
                  onChange={(e) => setGptQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && getGPTRecommendations()}
                  placeholder="예: 한국어 텍스트 요약 + 감정 분석, 이미지 생성 + 스타일 변환..."
                  className="flex-1 px-4 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => getGPTRecommendations('gpt')}
                    disabled={gptLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {gptLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        추천 중...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        GPT 추천
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => getGPTRecommendations('claude')}
                    disabled={gptLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {gptLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        추천 중...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Claude 추천
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* GPT 추천 결과 */}
            {gptRecommendations && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-purple-100">
                <h3 className="font-semibold text-gray-900 mb-3">추천 결과:</h3>
                <div className="space-y-3">
                  {gptRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rec.modelId}</p>
                        {rec.task && (
                          <p className="text-xs text-purple-600 font-medium mb-1">작업: {rec.task}</p>
                        )}
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery(rec.modelId);
                          setActiveTab('models');
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        검색 →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추천받은 모델 목록 */}
            {recommendedItems.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 cursor-pointer transition-all"
                  >
                    <h4 className="font-medium text-gray-900">{item.id}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description || '설명 없음'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>👍 {item.likes || 0}</span>
                      <span>📥 {(item.downloads || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 섹션 1: Hugging Face Hub 트렌드 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-yellow-600" />
              Hugging Face Hub 트렌드
            </h2>

            {/* 탭 네비게이션 */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('models')}
                className={`px-4 py-2.5 font-medium transition-all relative ${
                  activeTab === 'models' ? 'text-yellow-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  모델 ({models.length})
                </div>
                {activeTab === 'models' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('datasets')}
                className={`px-4 py-2.5 font-medium transition-all relative ${
                  activeTab === 'datasets' ? 'text-yellow-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  데이터셋 ({datasets.length})
                </div>
                {activeTab === 'datasets' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('spaces')}
                className={`px-4 py-2.5 font-medium transition-all relative ${
                  activeTab === 'spaces' ? 'text-yellow-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Spaces ({spaces.length})
                </div>
                {activeTab === 'spaces' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-600" />
                )}
              </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500"
              >
                <option value="trending">인기순</option>
                <option value="recent">최신순</option>
                <option value="downloads">다운로드순</option>
              </select>
            </div>

            {/* 콘텐츠 리스트 */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {paginatedData.map((item) => (
                  <div
                    key={item.id}
                    className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 cursor-pointer hover:border-yellow-400 overflow-hidden"
                    onClick={() => handleItemClick(item)}
                  >
                    {/* 타입 표시자 */}
                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-xs font-medium rounded-bl-lg shadow-sm">
                      {activeTab === 'models' ? '모델' : activeTab === 'datasets' ? '데이터셋' : 'Space'}
                    </div>
                    <div className="mb-4">
                      {/* 제목 및 작성자 */}
                      <div className="flex items-start gap-3">
                        {/* 아이콘/아바타 */}
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                          ${activeTab === 'models' ? 'bg-blue-100 text-blue-600' : 
                            activeTab === 'datasets' ? 'bg-green-100 text-green-600' : 
                            'bg-purple-100 text-purple-600'}
                        `}>
                          {activeTab === 'models' ? <Bot className="w-6 h-6" /> : 
                           activeTab === 'datasets' ? <Database className="w-6 h-6" /> : 
                           <Rocket className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-gray-900 text-xl group-hover:text-yellow-600 transition-colors">
                                  {item.id.split('/')[1] || item.id}
                                </h3>
                                {/* 상태 배지들 */}
                                <div className="flex items-center gap-1.5">
                                  {item.private && (
                                    <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded-full flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      Private
                                    </span>
                                  )}
                                  {item.gated && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      Gated
                                    </span>
                                  )}
                                  {activeTab === 'spaces' && item.runtime?.stage === 'RUNNING' && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                      <Activity className="w-3 h-3" />
                                      Running
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="font-medium">{item.author?.name || item.id.split('/')[0]}</span>
                                  {item.author?.fullname && (
                                    <span className="text-gray-500">• {item.author.fullname}</span>
                                  )}
                                </span>
                                {item.lastModified && (
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(item.lastModified).toLocaleDateString('ko-KR', { 
                                      year: 'numeric', month: 'short', day: 'numeric' 
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <a
                              href={`https://huggingface.co/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 설명 */}
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {item.description || item.cardData?.description || '설명이 없습니다.'}
                      </p>
                    </div>
                    
                    {/* 메타 정보 그리드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* 태스크/파이프라인 */}
                      {(item.task || item.pipeline_tag || item.task_categories) && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-1">
                            {(() => {
                              const taskInfo = getTaskInfo(item.task || item.pipeline_tag || (item.task_categories && item.task_categories[0]));
                              const IconComponent = taskInfo.icon;
                              return <IconComponent className={`w-4 h-4 text-${taskInfo.color}-600`} />;
                            })()}
                            <span className="text-xs font-medium text-gray-700">
                              {activeTab === 'models' ? 'Task' : 'Categories'}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {(() => {
                              const task = item.task || item.pipeline_tag || (item.task_categories && item.task_categories[0]);
                              const taskInfo = getTaskInfo(task);
                              return taskInfo.label;
                            })()}
                            {item.task_categories && item.task_categories.length > 1 && (
                              <span className="text-xs text-gray-500 ml-1">+{item.task_categories.length - 1}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* 라이브러리/SDK */}
                      {(item.library_name || item.sdk) && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Code className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-gray-700">
                              {activeTab === 'models' ? 'Library' : 'SDK'}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.library_name || item.sdk}
                            {item.sdk_version && ` v${item.sdk_version}`}
                          </div>
                        </div>
                      )}
                      
                      {/* 라이센스 */}
                      {item.license && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-gray-700">License</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.license}
                          </div>
                        </div>
                      )}
                      
                      {/* 언어 */}
                      {item.language && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-gray-700">Languages</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {Array.isArray(item.language) 
                              ? item.language.slice(0, 3).join(', ') + (item.language.length > 3 ? ` +${item.language.length - 3}` : '')
                              : item.language}
                          </div>
                        </div>
                      )}
                      
                      {/* 데이터셋 크기 */}
                      {item.size && activeTab === 'datasets' && (
                        <div className="bg-indigo-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <HardDrive className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-medium text-gray-700">Size</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.size}
                          </div>
                        </div>
                      )}
                      
                      {/* 하드웨어 */}
                      {activeTab === 'spaces' && item.runtime?.hardware && (
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Cpu className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium text-gray-700">Hardware</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.runtime.hardware}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 태그 */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 8).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 text-xs rounded-full hover:border-gray-400 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 8 && (
                            <span className="px-2.5 py-1 text-gray-500 text-xs italic">
                              +{item.tags.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 통계 바 */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* 좋아요 */}
                          {item.likes !== undefined && (
                            <div className="flex items-center gap-2 group/stat">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 group-hover/stat:bg-yellow-200 transition-colors">
                                <Star className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">{formatNumber(item.likes)}</div>
                                <div className="text-xs text-gray-500">likes</div>
                              </div>
                            </div>
                          )}
                          
                          {/* 다운로드 */}
                          {item.downloads !== undefined && (
                            <div className="flex items-center gap-2 group/stat">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 group-hover/stat:bg-blue-200 transition-colors">
                                <Download className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">{formatNumber(item.downloads)}</div>
                                <div className="text-xs text-gray-500">downloads</div>
                              </div>
                            </div>
                          )}
                          
                          {/* 모델 크기 (예시) */}
                          {activeTab === 'models' && item.siblings && item.siblings[0]?.size && (
                            <div className="flex items-center gap-2 group/stat">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 group-hover/stat:bg-purple-200 transition-colors">
                                <HardDrive className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-gray-900">
                                  {item.siblings[0].size > 1000000000 
                                    ? `${(item.siblings[0].size / 1000000000).toFixed(1)}GB`
                                    : `${(item.siblings[0].size / 1000000).toFixed(1)}MB`}
                                </div>
                                <div className="text-xs text-gray-500">model size</div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* 빠른 작업 버튼 */}
                        <div className="flex items-center gap-2">
                          {activeTab === 'models' && (
                            <button
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://huggingface.co/${item.id}/tree/main`, '_blank');
                              }}
                            >
                              <Code className="w-3.5 h-3.5" />
                              코드 보기
                            </button>
                          )}
                          {activeTab === 'spaces' && (
                            <button
                              className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://huggingface.co/spaces/${item.id}`, '_blank');
                              }}
                            >
                              <Rocket className="w-3.5 h-3.5" />
                              체험하기
                            </button>
                          )}
                          <button
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(item.id);
                              toast.success('클립보드에 복사되었습니다!');
                            }}
                          >
                            경로 복사
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* 페이지 번호 */}
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-yellow-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 섹션 2: Inference API 데모 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              Inference API 데모
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 입력 영역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분석할 텍스트
                </label>
                <textarea
                  value={inferenceText}
                  onChange={(e) => setInferenceText(e.target.value)}
                  placeholder="여기에 텍스트를 입력하세요..."
                  className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500"
                />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사용할 모델
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">모델을 선택하세요</option>
                    <option value="summarization">요약 (Summarization)</option>
                    <option value="translation">번역 (Translation)</option>
                    <option value="sentiment">감정 분석 (Sentiment)</option>
                  </select>
                </div>

                <button
                  onClick={runInference}
                  disabled={loading || !inferenceText || !selectedModel}
                  className="mt-4 w-full py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-300"
                >
                  {loading ? '처리 중...' : '분석 실행'}
                </button>
              </div>

              {/* 결과 영역 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">분석 결과</h3>
                {inferenceResult ? (
                  <div className="space-y-4">
                    {inferenceResult.error && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                        <p className="text-sm text-yellow-800">{inferenceResult.message}</p>
                      </div>
                    )}
                    {inferenceResult.summary && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">요약:</p>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                          {inferenceResult.summary}
                        </p>
                      </div>
                    )}
                    {inferenceResult.translation && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">한국어 번역:</p>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                          {inferenceResult.translation}
                        </p>
                      </div>
                    )}
                    {inferenceResult.sentiment && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">감정 분석:</p>
                        <div className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              inferenceResult.sentiment.label === 'POSITIVE' 
                                ? 'bg-green-100 text-green-700' 
                                : inferenceResult.sentiment.label === 'NEGATIVE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {inferenceResult.sentiment.label === 'POSITIVE' ? '긍정적' : 
                               inferenceResult.sentiment.label === 'NEGATIVE' ? '부정적' : '중립적'}
                            </span>
                            <span className="text-sm text-gray-600">
                              신뢰도: {(inferenceResult.sentiment.score * 100).toFixed(1)}%
                            </span>
                            {inferenceResult.sentiment.stars && (
                              <span className="text-sm text-gray-600">
                                별점: {'⭐'.repeat(inferenceResult.sentiment.stars)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">분석 결과가 여기에 표시됩니다.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 섹션 3: Transformers.js 데모 */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-yellow-600" />
              브라우저에서 AI 실행 (Transformers.js)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900">텍스트 분류</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  텍스트의 감정이나 카테고리를 브라우저에서 직접 분석
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  데모 시작 →
                </button>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900">이미지 분류</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  이미지 내용을 인식하고 태그를 자동으로 생성
                </p>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  데모 시작 →
                </button>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 text-white rounded-lg">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-gray-900">임베딩 생성</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  텍스트를 벡터로 변환하여 유사도 검색 가능
                </p>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  데모 시작 →
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>💡 Tip:</strong> Transformers.js는 브라우저에서 직접 ML 모델을 실행하므로 
                서버 API 호출 없이도 빠르고 프라이빗한 AI 기능을 제공할 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 상세 정보 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={closeDetails}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedItem.id.split('/')[1] || selectedItem.id}
                  </h2>
                  <p className="text-gray-600">
                    by <span className="font-medium">{selectedItem.id.split('/')[0]}</span>
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              ) : (
                <>
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-gray-600" />
                      기본 정보
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="text-gray-700">
                        {selectedItem.description || itemDetails?.cardData?.description || '설명이 없습니다.'}
                      </p>
                      
                      {/* 통계 정보 */}
                      <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200">
                        {selectedItem.likes !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{formatNumber(selectedItem.likes)}</span>
                            <span className="text-sm text-gray-500">likes</span>
                          </div>
                        )}
                        {selectedItem.downloads !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Download className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{formatNumber(selectedItem.downloads)}</span>
                            <span className="text-sm text-gray-500">downloads</span>
                          </div>
                        )}
                        {selectedItem.lastModified && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              업데이트: {new Date(selectedItem.lastModified).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 모델 특화 정보 */}
                  {activeTab === 'models' && itemDetails && (
                    <>
                      {/* 모델 카드 */}
                      {itemDetails.cardData && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Code className="w-5 h-5 text-gray-600" />
                            모델 상세 정보
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            {itemDetails.cardData.model_type && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">모델 타입:</span>
                                <span className="ml-2 text-sm text-gray-600">{itemDetails.cardData.model_type}</span>
                              </div>
                            )}
                            {itemDetails.cardData.language && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">지원 언어:</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  {Array.isArray(itemDetails.cardData.language) 
                                    ? itemDetails.cardData.language.join(', ') 
                                    : itemDetails.cardData.language}
                                </span>
                              </div>
                            )}
                            {itemDetails.cardData.license && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">라이센스:</span>
                                <span className="ml-2 text-sm text-gray-600">{itemDetails.cardData.license}</span>
                              </div>
                            )}
                            {itemDetails.cardData.datasets && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">학습 데이터셋:</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {itemDetails.cardData.datasets.map((dataset, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-300">
                                      {dataset}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 파일 정보 */}
                      {itemDetails.siblings && itemDetails.siblings.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-gray-600" />
                            모델 파일
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {itemDetails.siblings
                                .filter(file => file.rfilename.endsWith('.bin') || file.rfilename.endsWith('.safetensors') || file.rfilename.endsWith('.onnx'))
                                .slice(0, 10)
                                .map((file, idx) => {
                                  const fileSize = file.size ? (file.size > 1000000000 
                                    ? `${(file.size / 1000000000).toFixed(2)} GB`
                                    : `${(file.size / 1000000).toFixed(1)} MB`) : 'N/A';
                                  const fileType = file.rfilename.endsWith('.safetensors') ? 'SafeTensors' :
                                                  file.rfilename.endsWith('.bin') ? 'PyTorch' :
                                                  file.rfilename.endsWith('.onnx') ? 'ONNX' : 'Other';
                                  
                                  return (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <HardDrive className="w-4 h-4 text-gray-500" />
                                        <div>
                                          <span className="text-sm text-gray-700 font-mono">{file.rfilename}</span>
                                          <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {fileType}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-sm font-medium text-gray-600">
                                        {fileSize}
                                      </span>
                                    </div>
                                  );
                                })}
                              {itemDetails.siblings.filter(f => f.rfilename.endsWith('.bin') || f.rfilename.endsWith('.safetensors') || f.rfilename.endsWith('.onnx')).length > 10 && (
                                <p className="text-sm text-gray-500 text-center pt-2">
                                  +{itemDetails.siblings.filter(f => f.rfilename.endsWith('.bin') || f.rfilename.endsWith('.safetensors') || f.rfilename.endsWith('.onnx')).length - 10} more files
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* README 콘텐츠 */}
                  {readmeContent && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        README
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {readmeContent}
                        </pre>
                        {readmeContent.includes('...') && (
                          <p className="mt-4 text-sm text-gray-500 italic">
                            * README 콘텐츠가 너무 길어 일부만 표시됩니다.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 태그 */}
                  {(selectedItem.tags || itemDetails?.tags) && (selectedItem.tags || itemDetails?.tags).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5 text-gray-600" />
                        태그
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(selectedItem.tags || itemDetails?.tags).map((tag, idx) => (
                          <a
                            key={idx}
                            href={`https://huggingface.co/models?other=${tag}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm rounded-full hover:from-gray-200 hover:to-gray-300 transition-all flex items-center gap-1 group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            #{tag}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 외부 링크 */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <a
                      href={`https://huggingface.co/${selectedItem.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Hugging Face에서 보기
                    </a>
                    {activeTab === 'models' && (
                      <a
                        href={`https://huggingface.co/${selectedItem.id}/tree/main`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        파일 탐색
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HuggingFacePage;