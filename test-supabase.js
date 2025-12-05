const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://txonxxwdwlyrihplfibo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4b254eHdkd2x5cmlocGxmaWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDcwNDgsImV4cCI6MjA3NDAyMzA0OH0.5ABsPoPaoTvQtNygm0ClllfVYfOCSD56swva8V58YB4'
);

async function testTables() {
  console.log('🔍 Supabase 테이블 접근 테스트 시작...\n');
  
  const tablesToTest = [
    'product_analysis',
    'korean_ai_news', 
    'products',
    'trends',
    'ai_trends',
    'users',
    'profiles'
  ];
  
  for (const table of tablesToTest) {
    try {
      console.log(`📊 테스트 중: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
        
      if (error) {
        console.log(`❌ ${table}: ${error.message}\n`);
      } else {
        console.log(`✅ ${table}: 접근 성공 (총 ${count}개 행)\n`);
        if (data && data.length > 0) {
          console.log('   첫 번째 행 컬럼:', Object.keys(data[0]).join(', '));
          console.log('');
        }
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}\n`);
    }
  }
  
  // 메타데이터 조회 시도
  try {
    console.log('📋 테이블 메타데이터 조회 시도...');
    const { data, error } = await supabase
      .rpc('get_schema_tables') // 이 함수가 있다면
      .select('*');
      
    if (error) {
      console.log('❌ 메타데이터 조회 실패:', error.message);
    } else {
      console.log('✅ 메타데이터:', data);
    }
  } catch (err) {
    console.log('❌ 메타데이터 조회 에러:', err.message);
  }
}

testTables().then(() => {
  console.log('🏁 테스트 완료');
  process.exit(0);
}).catch(err => {
  console.error('💥 테스트 실패:', err);
  process.exit(1);
});