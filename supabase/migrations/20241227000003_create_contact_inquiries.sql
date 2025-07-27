-- Migration: Create contact_inquiries table
-- Created at: 2024-12-27 00:00:03
-- Description: お問い合わせフォームのデータを格納するテーブル

-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'bug_report', 'feature_request', 'support', 'other')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    CONSTRAINT contact_inquiries_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT contact_inquiries_name_length CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 100),
    CONSTRAINT contact_inquiries_subject_length CHECK (LENGTH(subject) >= 1 AND LENGTH(subject) <= 200),
    CONSTRAINT contact_inquiries_message_length CHECK (LENGTH(message) >= 10 AND LENGTH(message) <= 5000)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_category ON contact_inquiries(category);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_priority ON contact_inquiries(priority);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_user_id ON contact_inquiries(user_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status_priority ON contact_inquiries(status, priority);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_category_status ON contact_inquiries(category, status);

-- Enable RLS
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- ユーザーは自分のお問い合わせのみ閲覧可能
CREATE POLICY "Users can view own inquiries" ON contact_inquiries
    FOR SELECT USING (
        user_id = auth.uid() OR 
        auth.jwt() ->> 'role' = 'admin'
    );

-- 誰でもお問い合わせを送信可能
CREATE POLICY "Anyone can insert inquiries" ON contact_inquiries
    FOR INSERT WITH CHECK (true);

-- 管理者のみ更新可能
CREATE POLICY "Only admins can update inquiries" ON contact_inquiries
    FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- 管理者のみ削除可能
CREATE POLICY "Only admins can delete inquiries" ON contact_inquiries
    FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_contact_inquiries_updated_at
    BEFORE UPDATE ON contact_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_inquiries_updated_at();

-- Create view for admin dashboard
CREATE OR REPLACE VIEW contact_inquiries_summary AS
SELECT 
    category,
    status,
    priority,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d
FROM contact_inquiries
GROUP BY category, status, priority
ORDER BY category, status, priority;

-- Grant permissions
GRANT SELECT, INSERT ON contact_inquiries TO authenticated;
GRANT SELECT ON contact_inquiries_summary TO authenticated;
GRANT ALL ON contact_inquiries TO service_role; 