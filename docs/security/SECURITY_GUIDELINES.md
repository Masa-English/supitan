# 🔐 Supabaseセキュリティ対策ガイドライン

## 概要

このドキュメントは、[Zennの記事](https://zenn.dev/k_log24/articles/ff1581de72b0aa)を参考に、Masa FlashアプリケーションのSupabaseセキュリティ対策について説明します。

## 🚨 なぜセキュリティ対策が必要なのか

Supabaseでは、デフォルトでテーブル作成時に`anon`ユーザーがCRUD操作を行えるようになっています。これは`anonkey`（クライアントキー）を使用して誰でもアクセスできてしまう状態です。

このような状態でデータを扱うと、悪意のあるユーザーによるデータ改ざん、削除などのリスクがあります。

## 🛡️ 実装済みセキュリティ対策

### 1. テーブル権限の制限

#### anon権限の剥奪
```sql
-- 既存のテーブルからanon権限を剥奪
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- 今後のデフォルト権限からanon権限を削除
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
```

#### 必要最小限の権限付与
```sql
-- 公開データ（words, categories）の読み取りのみ許可
GRANT SELECT ON words TO anon;
GRANT SELECT ON categories TO anon;

-- 認証済みユーザーに適切な権限を付与
GRANT SELECT, INSERT, UPDATE, DELETE ON user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON study_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_words TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON review_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT ON contact_inquiries TO authenticated;
```

### 2. Row Level Security (RLS)

#### ユーザー固有データの保護
```sql
-- ユーザー進捗データの保護
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);
```

#### 学習セッションデータの保護
```sql
-- 学習セッションデータの保護
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

#### お問い合わせデータの保護
```sql
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
```

### 3. アプリケーションレベルでのセキュリティ

#### 認証チェック
```typescript
// API エンドポイントでの認証確認
const { data: { session }, error: authError } = await supabase.auth.getSession();

if (authError || !session?.user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

#### 入力値検証
```typescript
// データ型の検証（XSS対策）
const validTypes = ['category', 'quiz', 'flashcard', 'review'] as const;
type ValidType = typeof validTypes[number];

if (!type || !validTypes.includes(type as ValidType)) {
  return NextResponse.json(
    { error: 'Invalid data type' },
    { status: 400 }
  );
}

// カテゴリー名の検証
if (category && (typeof category !== 'string' || category.length > 100)) {
  return NextResponse.json(
    { error: 'Invalid category parameter' },
    { status: 400 }
  );
}
```

#### セキュリティヘッダー
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
      ],
    },
  ];
}
```

## 🔍 セキュリティ監査

### 権限確認クエリ
```sql
-- 現在の権限を確認
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY grantee, table_name, privilege_type;

-- anon権限の確認
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND grantee = 'anon'
ORDER BY table_name, privilege_type;
```

### RLSポリシー確認
```sql
-- RLSポリシーの確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🚀 デプロイメント時のセキュリティチェック

### 1. 環境変数の確認
```bash
# 必須環境変数
NEXT_PUBLIC_SUPABASE_URL=✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅
SUPABASE_SERVICE_ROLE_KEY=✅
REVALIDATION_TOKEN=✅
```

### 2. データベース権限の確認
```bash
# マイグレーションの適用
npm run db:migrate

# 権限の確認
npm run db:status
```

### 3. セキュリティテスト
```bash
# ビルドテスト
npm run build

# 型チェック
npm run type-check

# リントチェック
npm run lint
```

## 📋 セキュリティチェックリスト

### ✅ 実装済み
- [x] anon権限の制限
- [x] RLSポリシーの設定
- [x] 認証チェックの実装
- [x] 入力値検証の実装
- [x] セキュリティヘッダーの設定
- [x] 環境変数の適切な管理
- [x] エラーハンドリングの実装

### 🔄 定期的な確認項目
- [ ] 権限設定の確認
- [ ] RLSポリシーの見直し
- [ ] セキュリティログの確認
- [ ] 依存関係の更新
- [ ] セキュリティ監査の実行

## 🆘 トラブルシューティング

### よくある問題

#### 1. RLSエラーが発生する
```sql
-- RLSが有効になっているか確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

#### 2. 権限エラーが発生する
```sql
-- 現在のユーザーの権限を確認
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'authenticated';
```

#### 3. 認証エラーが発生する
```typescript
// セッションの確認
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

## 📚 参考資料

- [Supabaseのセキュリティ対策をまとめてみた](https://zenn.dev/k_log24/articles/ff1581de72b0aa)
- [Supabase Documentation - Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Documentation - Policies](https://supabase.com/docs/guides/auth/policies)

## 🔄 更新履歴

- **2024-12-27**: 初版作成
- **2024-12-27**: anon権限制限の実装
- **2024-12-27**: セキュリティヘッダーの強化 