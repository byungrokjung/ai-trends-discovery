-- Products 테이블 RLS 정책 설정 (복수형 주의!)
-- RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."products";

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON "public"."products"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- Makers 테이블 RLS 정책 설정 (복수형 주의!)
-- RLS 활성화
ALTER TABLE makers ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."makers";

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON "public"."makers"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 또는 테스트를 위해 RLS 비활성화 (간단한 방법)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE makers DISABLE ROW LEVEL SECURITY;