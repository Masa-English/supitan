# 英単語学習アプリケーション

Next.jsとSupabaseを使用したモダンな英単語学習アプリケーションです。SSG（Static Site Generation）とISR（Incremental Static Regeneration）を活用して、高速なパフォーマンスと定期的なデータ更新を実現しています。

## 機能

- **ログイン機能**: Supabase Authを使用したユーザー認証
- **フラッシュカード学習**: 日本語→英語の順で単語を学習
- **クイズ機能**: 4択クイズで理解度を確認（正解音・不正解音対応予定）
- **単語一覧**: 検索・フィルター機能付きの単語一覧
- **復習機能**: 学習中に追加した単語を復習
- **学習進捗管理**: 各単語の習熟度を追跡
- **お気に入り機能**: 単語をお気に入りに追加
- **統計表示**: 学習状況の可視化

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **UI コンポーネント**: Radix UI, Lucide React
- **バックエンド**: Supabase (PostgreSQL, Auth, Real-time)
- **認証**: Supabase Auth
- **パフォーマンス**: SSG, ISR, キャッシュ戦略

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# アプリケーション設定
# 開発環境でのみ必要（Vercel環境では自動的にVERCEL_URLが設定される）
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Vercel環境での自動URL取得について
# 本アプリケーションは、Vercel環境では自動的にVERCEL_URL環境変数を使用して
# デプロイURLを取得します。そのため、Vercelでのデプロイ時には
# NEXT_PUBLIC_BASE_URLの設定は不要です。

# ISR再検証用トークン（セキュリティのため強力なトークンを使用）
REVALIDATION_TOKEN=your_secure_revalidation_token_here
```

### 3. Supabaseデータベースの設定

#### 3.1 テーブルの作成

Supabaseダッシュボードで以下の手順を実行してください：

1. Supabaseダッシュボードにアクセス
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」をクリック
4. 「New query」をクリック
5. `database-schema.sql`ファイルの内容をコピー&ペースト
6. 「Run」ボタンをクリック

または、以下のSQLを直接実行してください：

```sql
-- 1. words テーブル（単語データ）
CREATE TABLE words (
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
CREATE TABLE user_progress (
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
CREATE TABLE study_sessions (
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
CREATE TABLE review_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- インデックスの作成
CREATE INDEX idx_words_category ON words(category);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_word_id ON user_progress(word_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_review_words_user_id ON review_words(user_id);

-- RLS（Row Level Security）の有効化
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_words ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの設定
CREATE POLICY "Words are viewable by everyone" ON words
  FOR SELECT USING (true);

CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own review words" ON review_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own review words" ON review_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own review words" ON review_words
  FOR DELETE USING (auth.uid() = user_id);
```

#### 3.2 サンプルデータの挿入

1. Supabaseダッシュボードで「SQL Editor」をクリック
2. 「New query」をクリック
3. `sample-data.sql`ファイルの内容をコピー&ペースト
4. 「Run」ボタンをクリック

または、以下のSQLを直接実行してください：

```sql
INSERT INTO words (category, word, japanese, example1, example2, example3, example1_jp, example2_jp, example3_jp, audio_file, phonetic) VALUES
('動詞', 'run', '走る', 'I run every morning.', 'She runs faster than me.', 'They ran to catch the bus.', '私は毎朝走ります。', '彼女は私より速く走ります。', '彼らはバスに乗るために走りました。', 'run.mp3', '/rʌn/'),
('動詞', 'walk', '歩く', 'Let''s walk to the park.', 'He walks slowly.', 'We walked for an hour.', '公園まで歩きましょう。', '彼はゆっくり歩きます。', '私たちは1時間歩きました。', 'walk.mp3', '/wɔːk/'),
('動詞', 'speak', '話す', 'Can you speak English?', 'She speaks three languages.', 'He spoke at the meeting.', '英語を話せますか？', '彼女は3つの言語を話します。', '彼は会議で話しました。', 'speak.mp3', '/spiːk/'),
('動詞', 'write', '書く', 'Please write your name here.', 'She writes novels.', 'I wrote a letter yesterday.', 'ここにお名前を書いてください。', '彼女は小説を書きます。', '私は昨日手紙を書きました。', 'write.mp3', '/raɪt/'),
('動詞', 'read', '読む', 'I read books every day.', 'She reads the newspaper.', 'He read the entire book.', '私は毎日本を読みます。', '彼女は新聞を読みます。', '彼は本を全部読みました。', 'read.mp3', '/riːd/'),
('動詞', 'eat', '食べる', 'What did you eat for lunch?', 'She eats vegetables daily.', 'We ate dinner together.', '昼食に何を食べましたか？', '彼女は毎日野菜を食べます。', '私たちは一緒に夕食を食べました。', 'eat.mp3', '/iːt/'),
('動詞', 'drink', '飲む', 'I drink coffee in the morning.', 'She drinks a lot of water.', 'They drank tea after dinner.', '私は朝にコーヒーを飲みます。', '彼女はたくさん水を飲みます。', '彼らは夕食後にお茶を飲みました。', 'drink.mp3', '/drɪŋk/'),
('動詞', 'sleep', '眠る', 'I need to sleep early tonight.', 'She sleeps eight hours daily.', 'The baby slept peacefully.', '今夜は早く眠る必要があります。', '彼女は毎日8時間眠ります。', '赤ちゃんは静かに眠りました。', 'sleep.mp3', '/sliːp/'),
('動詞', 'work', '働く', 'I work at a tech company.', 'She works from home.', 'He worked late yesterday.', '私はテック会社で働いています。', '彼女は在宅で働いています。', '彼は昨日遅くまで働きました。', 'work.mp3', '/wɜːrk/'),
('動詞', 'study', '勉強する', 'I study English every day.', 'She studies at the library.', 'We studied for the exam.', '私は毎日英語を勉強します。', '彼女は図書館で勉強します。', '私たちは試験のために勉強しました。', 'study.mp3', '/ˈstʌdi/'),
('形容詞', 'big', '大きい', 'This is a big house.', 'The elephant is very big.', 'She has big dreams.', 'これは大きな家です。', '象はとても大きいです。', '彼女は大きな夢を持っています。', 'big.mp3', '/bɪɡ/'),
('形容詞', 'small', '小さい', 'I have a small car.', 'The room is too small.', 'She wore a small ring.', '私は小さな車を持っています。', '部屋が小さすぎます。', '彼女は小さな指輪をつけていました。', 'small.mp3', '/smɔːl/'),
('形容詞', 'good', '良い', 'This is a good book.', 'She has good manners.', 'The weather is good today.', 'これは良い本です。', '彼女は良いマナーを持っています。', '今日は天気が良いです。', 'good.mp3', '/ɡʊd/'),
('形容詞', 'bad', '悪い', 'That''s a bad idea.', 'The weather is bad today.', 'He has a bad cold.', 'それは悪いアイデアです。', '今日は天気が悪いです。', '彼はひどい風邪を引いています。', 'bad.mp3', '/bæd/'),
('形容詞', 'happy', '幸せな', 'I''m happy to see you.', 'She looks very happy.', 'They had a happy marriage.', 'お会いできて嬉しいです。', '彼女はとても幸せそうに見えます。', '彼らは幸せな結婚生活を送りました。', 'happy.mp3', '/ˈhæpi/'),
('形容詞', 'sad', '悲しい', 'The movie made me sad.', 'She felt sad about leaving.', 'It was a sad ending.', 'その映画は私を悲しくさせました。', '彼女は去ることを悲しく思いました。', 'それは悲しい結末でした。', 'sad.mp3', '/sæd/'),
('形容詞', 'beautiful', '美しい', 'The sunset is beautiful.', 'She has beautiful eyes.', 'It''s a beautiful day.', '夕日が美しいです。', '彼女は美しい瞳を持っています。', '美しい日です。', 'beautiful.mp3', '/ˈbjuːtɪfəl/'),
('形容詞', 'ugly', '醜い', 'The building is ugly.', 'That''s an ugly color.', 'He made an ugly face.', 'その建物は醜いです。', 'それは醜い色です。', '彼は醜い顔をしました。', 'ugly.mp3', '/ˈʌɡli/'),
('形容詞', 'hot', '暑い', 'Today is very hot.', 'The coffee is too hot.', 'Summer is hot in Japan.', '今日はとても暑いです。', 'コーヒーが熱すぎます。', '日本の夏は暑いです。', 'hot.mp3', '/hɑːt/'),
('形容詞', 'cold', '寒い', 'It''s cold outside today.', 'The water is cold.', 'Winter is very cold here.', '今日は外が寒いです。', '水が冷たいです。', 'ここの冬はとても寒いです。', 'cold.mp3', '/koʊld/'),
('副詞', 'quickly', '素早く', 'Please walk quickly.', 'She answered quickly.', 'He quickly finished his work.', '素早く歩いてください。', '彼女は素早く答えました。', '彼は素早く仕事を終わらせました。', 'quickly.mp3', '/ˈkwɪkli/'),
('副詞', 'slowly', 'ゆっくりと', 'Drive slowly on this road.', 'She speaks slowly and clearly.', 'The clock moves slowly.', 'この道ではゆっくり運転してください。', '彼女はゆっくりとはっきりと話します。', '時計はゆっくりと動きます。', 'slowly.mp3', '/ˈsloʊli/'),
('副詞', 'carefully', '注意深く', 'Drive carefully in the rain.', 'She listened carefully.', 'He carefully opened the box.', '雨の中では注意深く運転してください。', '彼女は注意深く聞きました。', '彼は注意深く箱を開けました。', 'carefully.mp3', '/ˈkerfəli/'),
('副詞', 'loudly', '大声で', 'Don''t speak so loudly.', 'The music plays loudly.', 'He laughed loudly at the joke.', 'そんなに大声で話さないでください。', '音楽が大音量で流れています。', '彼はそのジョークに大声で笑いました。', 'loudly.mp3', '/ˈlaʊdli/'),
('副詞', 'quietly', '静かに', 'Please speak quietly.', 'She quietly left the room.', 'The cat walked quietly.', '静かに話してください。', '彼女は静かに部屋を出ました。', '猫は静かに歩きました。', 'quietly.mp3', '/ˈkwaɪətli/'),
('副詞', 'often', 'しばしば', 'I often visit my grandmother.', 'She often works late.', 'We often eat out on weekends.', '私はよく祖母を訪ねます。', '彼女はよく遅くまで働きます。', '私たちは週末によく外食します。', 'often.mp3', '/ˈɔːfən/'),
('副詞', 'sometimes', '時々', 'Sometimes I feel lonely.', 'She sometimes forgets her keys.', 'We sometimes go to the movies.', '時々寂しく感じます。', '彼女は時々鍵を忘れます。', '私たちは時々映画を見に行きます。', 'sometimes.mp3', '/ˈsʌmtaɪmz/'),
('副詞', 'always', 'いつも', 'I always brush my teeth.', 'She always arrives on time.', 'He always helps his friends.', '私はいつも歯を磨きます。', '彼女はいつも時間通りに到着します。', '彼はいつも友達を助けます。', 'always.mp3', '/ˈɔːlweɪz/'),
('副詞', 'never', '決して', 'I never eat fast food.', 'She never complains.', 'He never gives up easily.', '私は決してファストフードを食べません。', '彼女は決して文句を言いません。', '彼は決して簡単に諦めません。', 'never.mp3', '/ˈnevər/'),
('副詞', 'very', 'とても', 'The test was very difficult.', 'She is very kind.', 'It''s very important to study.', 'そのテストはとても難しかったです。', '彼女はとても親切です。', '勉強することはとても重要です。', 'very.mp3', '/ˈveri/'),
('名詞', 'book', '本', 'I''m reading a good book.', 'She bought three books.', 'The book is on the table.', '私は良い本を読んでいます。', '彼女は3冊の本を買いました。', '本はテーブルの上にあります。', 'book.mp3', '/bʊk/'),
('名詞', 'car', '車', 'My car is red.', 'She drives a new car.', 'The car needs gas.', '私の車は赤いです。', '彼女は新しい車を運転します。', '車はガソリンが必要です。', 'car.mp3', '/kɑːr/'),
('名詞', 'house', '家', 'We live in a big house.', 'The house has a garden.', 'She painted the house white.', '私たちは大きな家に住んでいます。', 'その家には庭があります。', '彼女は家を白く塗りました。', 'house.mp3', '/haʊs/'),
('名詞', 'school', '学校', 'I go to school every day.', 'The school is near my house.', 'She teaches at a local school.', '私は毎日学校に行きます。', '学校は私の家の近くにあります。', '彼女は地元の学校で教えています。', 'school.mp3', '/skuːl/'),
('名詞', 'teacher', '先生', 'My teacher is very kind.', 'The teacher explained the lesson.', 'She wants to be a teacher.', '私の先生はとても親切です。', '先生は授業を説明しました。', '彼女は先生になりたいです。', 'teacher.mp3', '/ˈtiːtʃər/'),
('名詞', 'student', '学生', 'I am a university student.', 'The student asked a question.', 'All students must study hard.', '私は大学生です。', 'その学生は質問をしました。', 'すべての学生は一生懸命勉強しなければなりません。', 'student.mp3', '/ˈstuːdənt/'),
('名詞', 'friend', '友達', 'She is my best friend.', 'I met my friend yesterday.', 'Friends are very important.', '彼女は私の親友です。', '昨日友達に会いました。', '友達はとても大切です。', 'friend.mp3', '/frend/'),
('名詞', 'family', '家族', 'I love my family.', 'Family is most important.', 'We have a big family dinner.', '私は家族を愛しています。', '家族が最も大切です。', '私たちは大きな家族での夕食をします。', 'family.mp3', '/ˈfæməli/'),
('名詞', 'water', '水', 'I drink a lot of water.', 'The water is very clean.', 'Plants need water to grow.', '私はたくさん水を飲みます。', '水はとても綺麗です。', '植物は成長するために水が必要です。', 'water.mp3', '/ˈwɔːtər/'),
('名詞', 'food', '食べ物', 'Japanese food is delicious.', 'I like spicy food.', 'We need food to survive.', '日本の食べ物は美味しいです。', '私は辛い食べ物が好きです。', '私たちは生きるために食べ物が必要です。', 'food.mp3', '/fuːd/');
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ISR監視スクリプトの起動（オプション）

データベースの変更を監視して自動的にISRをトリガーするスクリプトを起動できます：

```bash
npm run revalidate
```

このスクリプトは以下の機能を提供します：
- データベースの変更をリアルタイムで監視
- 変更検出時に自動的にISRをトリガー
- 24時間ごとの定期再検証（バックアップ）

## 使用方法

1. アプリケーションにアクセス
2. アカウントを作成またはログイン
3. カテゴリーを選択
4. 学習モードを選択（フラッシュカード、クイズ、単語一覧）
5. 学習を開始
6. 復習が必要な単語は「復習に追加」ボタンで復習リストに追加
7. ホーム画面で学習進捗を確認

## 学習モード

### フラッシュカード
- 日本語→英語の順で表示
- カードをタップして英語を確認
- 「わかる」「わからない」で回答
- 復習に追加機能

### クイズ
- 4択クイズ形式
- 意味を問う問題と例文を問う問題
- 正解音・不正解音（実装予定）
- 不正解の場合は復習に自動追加

### 単語一覧
- 検索機能
- 習熟度フィルター（未学習、学習中、習得済み）
- お気に入り機能
- 復習に追加機能

## SSG/ISR機能

### 静的サイト生成（SSG）
- **ランディングページ**: ビルド時に静的HTMLを生成
- **カテゴリーページ**: 各カテゴリーの静的ページを事前生成
- **メタデータ**: 動的にメタデータを生成

### インクリメンタル静的再生成（ISR）
- **再検証間隔**: 1時間ごとに自動再検証
- **データ更新**: データベース変更時に自動更新
- **キャッシュ戦略**: 効率的なキャッシュ管理

### パフォーマンス最適化
- **静的データAPI**: `/api/static-data`でデータを事前生成
- **キャッシュタグ**: 効率的なキャッシュ無効化
- **Webhook**: データベース変更時の自動再検証

## 開発

### ディレクトリ構造

```
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   ├── landing/           # 静的ランディングページ
│   ├── protected/         # 保護されたページ
│   ├── api/               # APIルート
│   │   ├── static-data/   # 静的データAPI
│   │   └── revalidate/    # ISR再検証API
│   └── layout.tsx         # ルートレイアウト
├── components/            # React コンポーネント
│   ├── ui/               # UI コンポーネント
│   ├── flashcard.tsx     # フラッシュカードコンポーネント
│   └── quiz.tsx          # クイズコンポーネント
├── lib/                  # ユーティリティ
│   ├── database.ts       # データベース操作
│   ├── static-data.ts    # 静的データ管理
│   ├── types.ts          # TypeScript型定義
│   └── supabase/         # Supabase設定
├── scripts/              # スクリプト
│   └── revalidate-on-change.js  # ISR監視スクリプト
├── samples/              # サンプルデータ
│   └── chunks.csv        # CSVサンプルデータ
├── database-schema.sql   # データベーススキーマ
└── sample-data.sql       # サンプルデータ
```

### 追加予定機能

- 音声再生機能
- 正解音・不正解音
- 学習統計の詳細表示
- 学習目標設定
- 学習リマインダー
- 単語の追加・編集機能

## ライセンス

MIT License
