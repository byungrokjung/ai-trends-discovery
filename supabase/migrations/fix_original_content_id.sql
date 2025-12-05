-- 기존 테이블 수정: original_content_id를 TEXT로 변경
ALTER TABLE daily_recommendations 
ALTER COLUMN original_content_id TYPE TEXT;
