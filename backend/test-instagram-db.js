const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://txonxxwdwlyrihplfibo.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b254eHdkd2x5cmlocGxmaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDcwNDgsImV4cCI6MjA3NDAyMzA0OH0.5ABsPoPaoTvQtNygm0ClllfVYfOCSD56swva8V58YB4'
);

async function testInstagramTable() {
  console.log('🔍 Instagram posts 테이블 확인 중...\n');
  
  try {
    // 테이블 존재 확인
    const { data, error, count } = await supabase
      .from('instagram_posts')
      .select('*', { count: 'exact' })
      .limit(5);
      
    if (error) {
      console.log('❌ 테이블이 존재하지 않음:', error.message);
      console.log('\n🔧 instagram_posts 테이블을 생성해야 합니다.');
      return createInstagramTable();
    } else {
      console.log(`✅ instagram_posts 테이블 발견! (총 ${count}개 행)`);
      if (data && data.length > 0) {
        console.log('\n📊 샘플 데이터:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('\n📝 테이블이 비어있습니다. 샘플 데이터를 추가하겠습니다.');
        return insertSampleData();
      }
    }
  } catch (err) {
    console.error('💥 오류 발생:', err.message);
  }
}

async function createInstagramTable() {
  console.log('\n🏗️ instagram_posts 테이블 생성 중...');
  
  // 테이블 생성 SQL
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      
      -- Instagram specific data
      instagram_id TEXT UNIQUE,
      shortcode TEXT,
      username TEXT NOT NULL,
      full_name TEXT,
      caption TEXT,
      media_type TEXT NOT NULL DEFAULT 'image',
      media_url TEXT,
      thumbnail_url TEXT,
      
      -- Engagement metrics
      like_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      
      -- Timestamps
      posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      -- AI Analysis
      ai_summary TEXT,
      ai_summary_korean TEXT,
      hashtags TEXT[] DEFAULT '{}',
      mentions TEXT[] DEFAULT '{}',
      topics TEXT[] DEFAULT '{}',
      sentiment TEXT,
      
      -- Relevance scoring
      ai_relevance_score DECIMAL(3,1) DEFAULT 0,
      korea_relevance_score DECIMAL(3,1) DEFAULT 0,
      
      -- Status tracking
      processing_status TEXT DEFAULT 'processed'
    );
  `;
  
  try {
    // 직접 SQL로 테이블 생성 (RPC 함수 사용)
    const { data, error } = await supabase.rpc('exec_sql', { query: createTableSQL });
    
    if (error) {
      console.log('❌ RPC로 테이블 생성 실패. 대안 방법 시도 중...');
      return insertSampleData(); // 테이블이 이미 있을 가능성
    }
    
    console.log('✅ instagram_posts 테이블이 생성되었습니다!');
    return insertSampleData();
    
  } catch (err) {
    console.log('⚠️ 테이블 생성 스킵 (이미 존재할 수 있음). 샘플 데이터 추가를 시도합니다.');
    return insertSampleData();
  }
}

async function insertSampleData() {
  console.log('\n📝 샘플 Instagram 포스트 데이터 추가 중...');
  
  const samplePosts = [
    {
      username: 'fashion_trend_kr',
      full_name: '패션트렌드 코리아',
      caption: '이번 시즌 핫한 아이템들을 소개합니다! 🔥 겨울 패션의 새로운 트렌드를 만나보세요 ✨ #패션 #트렌드 #한국패션 #ootd #겨울패션',
      media_type: 'image',
      like_count: 8432,
      comment_count: 234,
      view_count: 12450,
      posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Fashion trend post showcasing seasonal items with high engagement',
      ai_summary_korean: '최신 패션 트렌드를 소개하며 높은 참여율을 보이는 포스트. 겨울 시즌 아이템에 대한 관심이 집중되고 있음',
      hashtags: ['패션', '트렌드', '한국패션', 'ootd', '겨울패션'],
      sentiment: 'positive',
      ai_relevance_score: 8.5,
      korea_relevance_score: 9.2
    },
    {
      username: 'beauty_insider',
      full_name: '뷰티 인사이더',
      caption: '2025년 뷰티 트렌드 예측! 이런 메이크업이 유행할 예정이에요 💄✨ K-뷰티의 새로운 혁신을 만나보세요 #뷰티 #메이크업 #트렌드 #코스메틱 #K뷰티',
      media_type: 'carousel',
      like_count: 5643,
      comment_count: 189,
      view_count: 8920,
      posted_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      ai_summary: '2025 beauty trend prediction with makeup tips',
      ai_summary_korean: '2025년 뷰티 트렌드 예측과 메이크업 팁을 공유하며, K-뷰티의 글로벌 트렌드 확산을 다룸',
      hashtags: ['뷰티', '메이크업', '트렌드', '코스메틱', 'K뷰티'],
      sentiment: 'positive',
      ai_relevance_score: 7.8,
      korea_relevance_score: 8.6
    },
    {
      username: 'tech_korea',
      full_name: '테크 코리아',
      caption: 'AI 기술의 발전이 우리 일상을 어떻게 바꿀까요? 🤖 한국의 AI 스타트업들이 만드는 혁신적인 변화를 소개합니다 #AI #기술 #미래 #혁신 #스타트업',
      media_type: 'video',
      like_count: 12847,
      comment_count: 567,
      view_count: 24680,
      posted_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'AI technology impact on daily life featuring Korean startups',
      ai_summary_korean: 'AI 기술 발전과 일상 변화에 대한 인사이트를 제공하며, 한국 AI 스타트업의 혁신 사례를 소개',
      hashtags: ['AI', '기술', '미래', '혁신', '스타트업'],
      sentiment: 'neutral',
      ai_relevance_score: 9.2,
      korea_relevance_score: 9.5
    },
    {
      username: 'kfood_global',
      full_name: 'K-Food 글로벌',
      caption: '세계를 사로잡은 K-푸드! 🍲 해외에서 인기 폭발 중인 한국 요리들을 알아보세요 🌎 #K푸드 #한국음식 #글로벌 #맛집 #요리',
      media_type: 'carousel',
      like_count: 6789,
      comment_count: 345,
      view_count: 11230,
      posted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Korean food global popularity and trending dishes',
      ai_summary_korean: 'K-푸드의 글로벌 인기와 해외에서 주목받는 한국 요리 트렌드를 분석한 콘텐츠',
      hashtags: ['K푸드', '한국음식', '글로벌', '맛집', '요리'],
      sentiment: 'positive',
      ai_relevance_score: 8.1,
      korea_relevance_score: 9.8
    },
    {
      username: 'seoul_lifestyle',
      full_name: '서울 라이프스타일',
      caption: '서울의 숨겨진 핫플레이스 발견! 🏙️ 로컬들만 아는 특별한 장소들을 공개합니다 ✨ #서울 #핫플레이스 #로컬 #여행 #라이프스타일',
      media_type: 'image',
      like_count: 4521,
      comment_count: 156,
      view_count: 7890,
      posted_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      ai_summary: 'Hidden Seoul hotspots and local recommendations',
      ai_summary_korean: '서울의 숨겨진 핫플레이스와 로컬 추천 장소를 소개하는 라이프스타일 콘텐츠',
      hashtags: ['서울', '핫플레이스', '로컬', '여행', '라이프스타일'],
      sentiment: 'positive',
      ai_relevance_score: 7.3,
      korea_relevance_score: 9.1
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('instagram_posts')
      .insert(samplePosts)
      .select();
      
    if (error) {
      console.error('❌ 샘플 데이터 삽입 실패:', error.message);
    } else {
      console.log(`✅ ${data.length}개의 샘플 Instagram 포스트가 추가되었습니다!`);
      console.log('\n📊 추가된 포스트들:');
      data.forEach((post, index) => {
        console.log(`${index + 1}. @${post.username}: ${post.like_count} likes`);
      });
    }
  } catch (err) {
    console.error('💥 샘플 데이터 추가 오류:', err.message);
  }
}

// 실행
testInstagramTable().then(() => {
  console.log('\n🏁 Instagram 데이터베이스 설정 완료!');
  process.exit(0);
}).catch(err => {
  console.error('💥 실행 실패:', err);
  process.exit(1);
});