-- Migration: Secure anon permissions
-- Created at: 2024-12-27 00:00:04
-- Description: anon権限を制限してセキュリティを強化

-- 既存のanon権限を確認
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public' AND grantee = 'anon'
-- ORDER BY table_name, privilege_type;

-- 既存のテーブルからanon権限を剥奪
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 今後のデフォルト権限からanon権限を削除
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;

-- 特定のテーブルで必要な場合のみanon権限を付与
-- 例: 公開データ（words, categories）の読み取りのみ許可
GRANT SELECT ON words TO anon;
GRANT SELECT ON categories TO anon;

-- 認証済みユーザーに適切な権限を付与
GRANT SELECT, INSERT, UPDATE, DELETE ON user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_words TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON contact_inquiries TO authenticated;

-- 管理者権限の確認（必要に応じて）
-- CREATE POLICY "Admins can manage all data" ON words
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.uid() = id 
--       AND raw_user_meta_data->>'role' = 'admin'
--     )
--   );

-- セキュリティログの作成（オプション）
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティログのインデックス
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at DESC);

-- セキュリティログのRLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- 管理者のみセキュリティログを閲覧可能
CREATE POLICY "Only admins can view security logs" ON security_audit_log
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- システムのみセキュリティログを挿入可能
CREATE POLICY "System can insert security logs" ON security_audit_log
    FOR INSERT WITH CHECK (true);

-- 権限付与
GRANT SELECT ON security_audit_log TO authenticated;
GRANT INSERT ON security_audit_log TO authenticated;
GRANT ALL ON security_audit_log TO service_role; 