-- Migration: Complete database schema for English learning app
-- Created at: 2024-12-27 00:00:02

-- 1. words テーブル（英単語データ）
CREATE TABLE IF NOT EXISTS words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  word TEXT NOT NULL,
  japanese TEXT NOT NULL,
  example1 TEXT NOT NULL,
  example2 TEXT NOT NULL,
  example3 TEXT NOT NULL,
  example1_jp TEXT NOT NULL,
  example2_jp TEXT NOT NULL,
  example3_jp TEXT NOT NULL,
  audio_file TEXT,
  phonetic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. user_progress テーブル（ユーザーの学習進捗）
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  mastery_level DECIMAL(3,2) DEFAULT 0,
  study_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- 3. study_sessions テーブル（学習セッション記録）
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('flashcard', 'quiz')),
  total_words INTEGER NOT NULL,
  completed_words INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. review_words テーブル（復習リスト）
CREATE TABLE IF NOT EXISTS review_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE,
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  UNIQUE(user_id, word_id)
);

-- 5. review_sessions テーブル（復習セッション記録）
CREATE TABLE IF NOT EXISTS review_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_words INTEGER NOT NULL,
  completed_words INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_words_user_id ON review_words(user_id);
CREATE INDEX IF NOT EXISTS idx_review_words_next_review ON review_words(next_review);
CREATE INDEX IF NOT EXISTS idx_review_sessions_user_id ON review_sessions(user_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sessions ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの設定

-- words テーブル：すべてのユーザーが閲覧可能
DROP POLICY IF EXISTS "Words are viewable by everyone" ON words;
CREATE POLICY "Words are viewable by everyone" ON words
  FOR SELECT USING (true);

-- user_progress テーブル：自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- study_sessions テーブル：自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own sessions" ON study_sessions;
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON study_sessions;
CREATE POLICY "Users can insert own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON study_sessions;
CREATE POLICY "Users can update own sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON study_sessions;
CREATE POLICY "Users can delete own sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- review_words テーブル：自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own review words" ON review_words;
CREATE POLICY "Users can view own review words" ON review_words
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own review words" ON review_words;
CREATE POLICY "Users can insert own review words" ON review_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review words" ON review_words;
CREATE POLICY "Users can update own review words" ON review_words
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review words" ON review_words;
CREATE POLICY "Users can delete own review words" ON review_words
  FOR DELETE USING (auth.uid() = user_id);

-- review_sessions テーブル：自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own review sessions" ON review_sessions;
CREATE POLICY "Users can view own review sessions" ON review_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own review sessions" ON review_sessions;
CREATE POLICY "Users can insert own review sessions" ON review_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own review sessions" ON review_sessions;
CREATE POLICY "Users can update own review sessions" ON review_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own review sessions" ON review_sessions;
CREATE POLICY "Users can delete own review sessions" ON review_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- コメントの追加
COMMENT ON TABLE words IS '英単語データ';
COMMENT ON TABLE user_progress IS 'ユーザーの学習進捗';
COMMENT ON TABLE study_sessions IS '学習セッション記録';
COMMENT ON TABLE review_words IS '復習リスト';
COMMENT ON TABLE review_sessions IS '復習セッション記録'; 