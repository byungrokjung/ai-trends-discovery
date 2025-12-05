import React, { useState } from 'react';
import { supabase, trendsService } from '../lib/supabase';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test, success, data = null, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 0: Supabase 설정 확인
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addTestResult('환경 변수', true, 
      `URL: ${supabaseUrl ? '설정됨' : '설정 안됨'}, Key: ${supabaseKey ? '설정됨' : '설정 안됨'}`
    );
    
    // Test 1: 간단한 연결 테스트 - auth 상태 확인
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error) {
        addTestResult('Supabase Auth 연결', true, `인증 서비스 연결 성공 - 사용자: ${user ? '로그인됨' : '로그인 안됨'}`);
      } else {
        addTestResult('Supabase Auth 연결', false, null, error.message);
      }
    } catch (error) {
      addTestResult('Supabase Auth 연결', false, null, error.message);
    }

    // Test 2: RLS 비활성화 상태로 테이블 접근 테스트
    try {
      // products 테이블 확인 (복수형)
      const { data: productData, error: productError } = await supabase.from('products').select('*').limit(5);
      if (!productError && productData && productData.length > 0) {
        addTestResult('products 테이블 확인', true, `products 테이블 접근 성공 - ${productData.length}개 데이터`);
        console.log('Products 데이터 샘플:', productData);
        
        // 첫 번째 제품의 모든 컬럼 표시
        const columns = Object.keys(productData[0]);
        addTestResult('products 컬럼 목록', true, `컬럼: ${columns.join(', ')}`);
        console.log('첫 번째 제품 상세:', productData[0]);
        
        // 각 컬럼의 값 타입도 확인
        const columnInfo = columns.map(col => `${col}: ${typeof productData[0][col]}`);
        console.log('컬럼 타입 정보:', columnInfo);
      } else {
        addTestResult('products 테이블 확인', false, null, productError?.message || '데이터 없음');
      }
      
      // makers 테이블 확인 (복수형)
      const { data: makerData, error: makerError } = await supabase.from('makers').select('*').limit(5);
      if (!makerError && makerData && makerData.length > 0) {
        addTestResult('makers 테이블 확인', true, `makers 테이블 접근 성공 - ${makerData.length}개 데이터`);
        console.log('Makers 데이터 샘플:', makerData);
        
        // 첫 번째 메이커의 모든 컬럼 표시
        const makerColumns = Object.keys(makerData[0]);
        addTestResult('makers 컬럼 목록', true, `컬럼: ${makerColumns.join(', ')}`);
      } else {
        addTestResult('makers 테이블 확인', false, null, makerError?.message || '데이터 없음');
      }
      
      // 테이블 구조 확인을 위한 count 쿼리
      const { count: productCount, error: pcError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (!pcError) {
        addTestResult('products 전체 레코드 수', true, `총 ${productCount}개의 제품 데이터`);
      }
    } catch (error) {
      addTestResult('테이블 확인', false, null, error.message);
    }

    // Test 3: 최신 트렌드 가져오기
    try {
      const data = await trendsService.getLatestTrends(5);
      addTestResult('최신 트렌드 조회', true, `${data.length}개의 트렌드 조회됨`, null);
      console.log('최신 트렌드:', data);
    } catch (error) {
      addTestResult('최신 트렌드 조회', false, null, error.message);
    }

    // Test 4: 오늘의 트렌드 가져오기
    try {
      const data = await trendsService.getTodayTrends();
      addTestResult('오늘의 트렌드 조회', true, `${data.length}개의 오늘 트렌드 조회됨`, null);
      console.log('오늘의 트렌드:', data);
    } catch (error) {
      addTestResult('오늘의 트렌드 조회', false, null, error.message);
    }

    // Test 5: 인기 트렌드 가져오기
    try {
      const data = await trendsService.getPopularTrends(5);
      addTestResult('인기 트렌드 조회', true, `${data.length}개의 인기 트렌드 조회됨`, null);
      console.log('인기 트렌드:', data);
    } catch (error) {
      addTestResult('인기 트렌드 조회', false, null, error.message);
    }

    // Test 6: 테스트 데이터 삽입 (선택적)
    try {
      const testData = {
        title: `테스트 트렌드 - ${new Date().toLocaleString()}`,
        summary: '이것은 테스트 트렌드입니다.',
        source: 'Test Source',
        category: '테스트',
        published_at: new Date().toISOString(),
        importance: 5,
        korea_relevance: '테스트를 위한 한국 관련성',
        original_url: 'https://example.com/test'
      };

      const { data, error } = await supabase
        .from('trends')
        .insert([testData])
        .select();

      if (error) throw error;
      addTestResult('테스트 데이터 삽입', true, '테스트 데이터가 성공적으로 삽입됨');
    } catch (error) {
      addTestResult('테스트 데이터 삽입', false, null, error.message);
    }

    setLoading(false);
  };

  const clearTestData = async () => {
    try {
      const { error } = await supabase
        .from('trends')
        .delete()
        .eq('source', 'Test Source');
      
      if (error) throw error;
      addTestResult('테스트 데이터 삭제', true, '테스트 데이터가 삭제됨');
    } catch (error) {
      addTestResult('테스트 데이터 삭제', false, null, error.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Supabase 연동 테스트</h2>
      
      <div className="mb-6 space-x-4">
        <button 
          onClick={runTests} 
          disabled={loading}
          className="btn-primary"
        >
          {loading ? '테스트 중...' : '테스트 실행'}
        </button>
        
        <button 
          onClick={clearTestData}
          className="btn-secondary"
        >
          테스트 데이터 삭제
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">
                {result.test}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm ${
                result.success 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-red-200 text-red-800'
              }`}>
                {result.success ? '성공' : '실패'}
              </span>
            </div>
            
            {result.data && (
              <p className="text-sm text-gray-600">{result.data}</p>
            )}
            
            {result.error && (
              <p className="text-sm text-red-600">에러: {result.error}</p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">{result.timestamp}</p>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">디버깅 정보</h3>
          <p className="text-sm text-gray-600 mb-2">
            브라우저 콘솔을 확인하여 상세 데이터를 확인하세요.
          </p>
          <p className="text-sm text-gray-600">
            환경변수가 올바르게 설정되었는지 확인하세요:
          </p>
          <code className="block mt-2 p-2 bg-gray-200 rounded text-xs">
            VITE_SUPABASE_URL={import.meta.env.VITE_SUPABASE_URL ? '설정됨' : '설정 안됨'}<br/>
            VITE_SUPABASE_ANON_KEY={import.meta.env.VITE_SUPABASE_ANON_KEY ? '설정됨' : '설정 안됨'}
          </code>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">📝 Supabase 설정 확인사항</h4>
            <ol className="text-sm text-yellow-700 space-y-2">
              <li>1. <a href="https://app.supabase.com" target="_blank" className="text-blue-600 underline">Supabase Dashboard</a>에 로그인</li>
              <li>2. 프로젝트 선택 후 Settings → API 확인</li>
              <li>3. <strong>Table Editor</strong>에서 실제 테이블 목록 확인</li>
              <li>4. <strong>Authentication → Policies</strong>에서 RLS(Row Level Security) 설정 확인</li>
              <li>5. 만약 RLS가 활성화되어 있다면:
                <ul className="ml-4 mt-1">
                  <li>• 각 테이블의 RLS 정책을 확인</li>
                  <li>• 읽기 권한이 public으로 설정되어 있는지 확인</li>
                  <li>• 또는 테스트를 위해 RLS를 일시적으로 비활성화</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;