const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'demo_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'demo_service_key';

console.log('[Supabase] Initializing with URL:', supabaseUrl);
if (supabaseUrl === 'https://demo.supabase.co') {
  console.log('[WARNING] Using demo URL! Please set SUPABASE_URL in .env file!');
}

// 클라이언트 옵션
const clientOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
};

// 클라이언트용 (Row Level Security 적용)
const supabase = createClient(supabaseUrl, supabaseKey, clientOptions);

// 서비스용 (모든 권한)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, clientOptions);

module.exports = { supabase, supabaseAdmin };