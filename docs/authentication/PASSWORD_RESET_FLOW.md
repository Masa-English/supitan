# パスワードリセットフローの実装ガイド

## 概要

このドキュメントでは、Supabaseを使用したパスワードリセット機能の実装と設定方法について説明します。

## パスワードリセットフロー

### 1. ユーザーがパスワードリセットを要求

ユーザーは `/auth/forgot-password` ページでメールアドレスを入力します。

**実装ファイル:** `components/features/auth/forgot-password-form.tsx`

```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/update-password`,
});
```

### 2. パスワードリセットメールが送信される

Supabaseは以下の形式のリンクを含むメールを送信します：

```
https://your-domain.com/auth/confirm?token_hash=xxx&type=recovery&next=/auth/update-password
```

### 3. ユーザーがメールのリンクをクリック

リンクをクリックすると `/auth/confirm` エンドポイントにアクセスされます。

**実装ファイル:** `app/(auth)/auth/confirm/route.ts`

このエンドポイントは以下の処理を行います：
- トークンハッシュを検証
- `type=recovery` の場合は `/auth/update-password` にリダイレクト
- その他の認証タイプは `next` パラメータまたは `/dashboard` にリダイレクト

```typescript
if (type === 'recovery') {
  redirect('/auth/update-password')
}
```

### 4. パスワード更新フォームを表示

ユーザーは `/auth/update-password` ページで新しいパスワードを入力します。

**実装ファイル:** `components/features/auth/update-password-form.tsx`

このフォームには以下の機能があります：
- パスワード入力フィールド（6文字以上）
- パスワード確認入力フィールド
- パスワード一致確認
- バリデーション

### 5. パスワードを更新

```typescript
await supabase.auth.updateUser({ password });
```

成功すると、ユーザーは自動的に `/dashboard` にリダイレクトされます。

## Supabaseの設定

### 必須設定: リダイレクトURLの登録

Supabaseダッシュボードで以下のURLを登録する必要があります：

1. **Supabase Dashboard** にアクセス
2. **Authentication** → **URL Configuration** を開く
3. **Redirect URLs** に以下を追加：

#### 本番環境
```
https://your-production-domain.com/auth/confirm
https://your-production-domain.com/auth/update-password
```

#### 開発環境
```
http://localhost:3000/auth/confirm
http://localhost:3000/auth/update-password
```

### メールテンプレートの設定（オプション）

Supabase Dashboard → Authentication → Email Templates でパスワードリセットメールのテンプレートをカスタマイズできます：

```html
<h2>パスワードリセット</h2>

<p>以下のリンクをクリックして、パスワードをリセットしてください：</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">
    パスワードをリセット
  </a>
</p>
```

## セキュリティ機能

### 実装されている機能

1. **パスワードの長さ検証**: 6文字以上
2. **パスワード確認**: 入力ミスを防ぐための確認フィールド
3. **トークン検証**: Supabaseが自動的にトークンの有効性を検証
4. **セッション管理**: パスワード更新後は自動的に認証セッションが開始

### セキュリティ推奨事項

- **HTTPS**: 本番環境では必ずHTTPSを使用
- **パスワードポリシー**: より強力なパスワード要件（大文字、小文字、数字、記号など）の実装を検討
- **レート制限**: Supabaseが提供する1時間あたりのメール送信制限を確認
- **トークン有効期限**: パスワードリセットトークンには有効期限があります（デフォルト: 1時間）

## テスト方法

### 1. 開発環境でのテスト

```bash
# アプリケーションを起動
npm run dev
```

### 2. パスワードリセットをテスト

1. ブラウザで `http://localhost:3000/auth/forgot-password` にアクセス
2. 登録済みのメールアドレスを入力
3. メールを確認（Supabaseダッシュボードの Authentication → Users から確認可能）
4. メール内のリンクをクリック
5. パスワード更新フォームが表示されることを確認
6. 新しいパスワードを入力（確認も含む）
7. パスワード更新後、ダッシュボードにリダイレクトされることを確認
8. 新しいパスワードでログインできることを確認

### 3. エラーケースのテスト

- [ ] パスワードが一致しない場合のエラー表示
- [ ] 6文字未満のパスワードのエラー表示
- [ ] 無効なトークンでのアクセス（`/auth/error` にリダイレクト）
- [ ] 期限切れのトークンでのアクセス

## トラブルシューティング

### メールが届かない

1. Supabaseのメール設定を確認
2. スパムフォルダを確認
3. Supabase Dashboard の Authentication → Logs でエラーを確認

### リダイレクトが機能しない

1. Supabase Dashboard の URL Configuration を確認
2. `redirectTo` パラメータが正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認

### パスワード更新が失敗する

1. ブラウザのコンソールでエラーメッセージを確認
2. パスワードがSupabaseのポリシー（最低6文字）を満たしているか確認
3. トークンが有効期限内か確認

## 関連ファイル

- `app/(auth)/auth/confirm/route.ts` - トークン検証とリダイレクト
- `app/(auth)/auth/forgot-password/page.tsx` - パスワードリセット要求ページ
- `app/(auth)/auth/update-password/page.tsx` - パスワード更新ページ
- `components/features/auth/forgot-password-form.tsx` - パスワードリセット要求フォーム
- `components/features/auth/update-password-form.tsx` - パスワード更新フォーム
- `app/(auth)/auth/error/page.tsx` - エラーページ

## 変更履歴

### 2025-10-27
- パスワードリセットフローの実装を修正
- `type=recovery` の場合に正しくパスワード更新ページにリダイレクトするように修正
- パスワード確認フィールドを追加
- パスワードバリデーションを強化

