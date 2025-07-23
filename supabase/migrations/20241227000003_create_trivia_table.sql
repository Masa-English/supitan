-- Migration: Create trivia table for interesting facts
-- Created at: 2024-12-27 00:00:03

-- trivia テーブル（豆知識データ）
CREATE TABLE IF NOT EXISTS trivia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_jp TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 3),
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_trivia_progress テーブル（ユーザーの豆知識閲覧進捗）
CREATE TABLE IF NOT EXISTS user_trivia_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trivia_id UUID REFERENCES trivia(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trivia_id)
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_trivia_word_id ON trivia(word_id);
CREATE INDEX IF NOT EXISTS idx_trivia_category ON trivia(category);
CREATE INDEX IF NOT EXISTS idx_trivia_is_featured ON trivia(is_featured);
CREATE INDEX IF NOT EXISTS idx_trivia_difficulty_level ON trivia(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_trivia_progress_user_id ON user_trivia_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trivia_progress_trivia_id ON user_trivia_progress(trivia_id);
CREATE INDEX IF NOT EXISTS idx_user_trivia_progress_is_bookmarked ON user_trivia_progress(is_bookmarked);

-- RLS（Row Level Security）の有効化
ALTER TABLE trivia ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trivia_progress ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの設定

-- trivia テーブル：すべてのユーザーが閲覧可能
DROP POLICY IF EXISTS "Trivia are viewable by everyone" ON trivia;
CREATE POLICY "Trivia are viewable by everyone" ON trivia
  FOR SELECT USING (true);

-- user_trivia_progress テーブル：自分のデータのみアクセス可能
DROP POLICY IF EXISTS "Users can view own trivia progress" ON user_trivia_progress;
CREATE POLICY "Users can view own trivia progress" ON user_trivia_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own trivia progress" ON user_trivia_progress;
CREATE POLICY "Users can insert own trivia progress" ON user_trivia_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trivia progress" ON user_trivia_progress;
CREATE POLICY "Users can update own trivia progress" ON user_trivia_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trivia progress" ON user_trivia_progress;
CREATE POLICY "Users can delete own trivia progress" ON user_trivia_progress
  FOR DELETE USING (auth.uid() = user_id);

-- トリガー関数：updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
DROP TRIGGER IF EXISTS update_trivia_updated_at ON trivia;
CREATE TRIGGER update_trivia_updated_at
    BEFORE UPDATE ON trivia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_trivia_progress_updated_at ON user_trivia_progress;
CREATE TRIGGER update_user_trivia_progress_updated_at
    BEFORE UPDATE ON user_trivia_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- view_count自動更新のトリガー関数
CREATE OR REPLACE FUNCTION increment_trivia_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE trivia 
    SET view_count = view_count + 1 
    WHERE id = NEW.trivia_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 豆知識閲覧時にview_countを自動増加するトリガー
DROP TRIGGER IF EXISTS increment_view_count_on_read ON user_trivia_progress;
CREATE TRIGGER increment_view_count_on_read
    AFTER INSERT OR UPDATE OF is_read ON user_trivia_progress
    FOR EACH ROW
    WHEN (NEW.is_read = true AND (TG_OP = 'INSERT' OR OLD.is_read = false))
    EXECUTE FUNCTION increment_trivia_view_count();

-- コメントの追加
COMMENT ON TABLE trivia IS '豆知識データ';
COMMENT ON TABLE user_trivia_progress IS 'ユーザーの豆知識閲覧進捗';
COMMENT ON COLUMN trivia.word_id IS '関連する単語のID（オプション）';
COMMENT ON COLUMN trivia.difficulty_level IS '難易度レベル（1:初級、2:中級、3:上級）';
COMMENT ON COLUMN trivia.tags IS 'タグ配列（検索・分類用）';
COMMENT ON COLUMN trivia.is_featured IS '注目の豆知識フラグ';
COMMENT ON COLUMN trivia.view_count IS '閲覧回数';
COMMENT ON COLUMN user_trivia_progress.is_read IS '閲覧済みフラグ';
COMMENT ON COLUMN user_trivia_progress.is_bookmarked IS 'ブックマークフラグ'; 