-- Migration: Create user_profiles table
-- Created at: 2024-12-27 00:00:01

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    study_goal INTEGER DEFAULT 10, -- 1日の学習目標（単語数）
    preferred_language TEXT DEFAULT 'ja' CHECK (preferred_language IN ('ja', 'en')),
    timezone TEXT DEFAULT 'Asia/Tokyo',
    notification_settings JSONB DEFAULT '{"daily_reminder": true, "achievement": true, "review_reminder": true}'::jsonb,
    study_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE user_profiles IS 'ユーザープロフィール情報';
COMMENT ON COLUMN user_profiles.display_name IS '表示名';
COMMENT ON COLUMN user_profiles.avatar_url IS 'アバター画像のURL';
COMMENT ON COLUMN user_profiles.bio IS '自己紹介';
COMMENT ON COLUMN user_profiles.study_goal IS '1日の学習目標（単語数）';
COMMENT ON COLUMN user_profiles.preferred_language IS '優先言語（ja/en）';
COMMENT ON COLUMN user_profiles.timezone IS 'タイムゾーン';
COMMENT ON COLUMN user_profiles.notification_settings IS '通知設定（JSON）';
COMMENT ON COLUMN user_profiles.study_streak IS '学習連続日数';
COMMENT ON COLUMN user_profiles.last_study_date IS '最後の学習日'; 