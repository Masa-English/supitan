'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  BookOpen, 
  Construction,
  AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">認証を確認中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 開発中バナー */}
          <div className="mb-8 p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Construction className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                  開発中のお知らせ
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  プロフィール設定機能は現在開発中です。基本的な設定のみ利用可能です。
                </p>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            プロフィール設定
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 学習設定 */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="h-5 w-5" />
                  学習設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1日の学習目標 */}
                <div className="space-y-2">
                  <Label htmlFor="daily-goal" className="text-sm font-medium text-muted-foreground">
                    1日の学習目標（単語数）
                  </Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    defaultValue="10"
                    className="border-border bg-background"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    1日に学習する単語の目標数を設定します
                  </p>
                </div>

                {/* 言語設定 */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-muted-foreground">
                    表示言語
                  </Label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    disabled
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    アプリケーションの表示言語を設定します
                  </p>
                </div>

                {/* 通知設定 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    通知設定
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="daily-reminder" disabled />
                      <Label htmlFor="daily-reminder" className="text-sm text-muted-foreground">
                        毎日の学習リマインダー
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="progress-notification" disabled />
                      <Label htmlFor="progress-notification" className="text-sm text-muted-foreground">
                        進捗通知
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アカウント情報 */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  アカウント情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* メールアドレス */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    メールアドレス
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    className="border-border bg-background"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    アカウントのメールアドレスです
                  </p>
                </div>

                {/* アカウント作成日 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    アカウント作成日
                  </Label>
                  <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '不明'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    アカウントが作成された日付です
                  </p>
                </div>

                {/* 最終ログイン */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    最終ログイン
                  </Label>
                  <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ja-JP') : '不明'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    最後にログインした日時です
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 開発中メッセージ */}
          <div className="mt-8 p-6 bg-muted border border-border rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  プロフィール機能開発中
                </h3>
                <p className="text-muted-foreground mb-4">
                  プロフィール設定機能は現在開発中です。上記の設定は実際には保存されず、サンプル表示です。
                  実際の設定機能は、機能完成後に利用可能になります。
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                    開発中
                  </Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    サンプル表示
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 