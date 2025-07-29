'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Bell, 
  BookOpen, 
  Settings, 
  Construction,
  AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <div className="container mx-auto px-4 py-8">
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

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            プロフィール設定
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 学習設定 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <BookOpen className="h-5 w-5" />
                  学習設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1日の学習目標 */}
                <div className="space-y-2">
                  <Label htmlFor="daily-goal" className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    1日の学習目標（単語数）
                  </Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    defaultValue="10"
                    className="border-amber-300 dark:border-amber-600 bg-white/50 dark:bg-gray-700/50"
                    disabled
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    1日に学習する単語の目標数を設定します
                  </p>
                </div>

                {/* 言語設定 */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    表示言語
                  </Label>
                  <select
                    id="language"
                    className="w-full px-3 py-2 border border-amber-300 dark:border-amber-600 rounded-md bg-white/50 dark:bg-gray-700/50 text-amber-800 dark:text-amber-200"
                    disabled
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    アプリの表示言語を設定します
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 通知設定 */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Bell className="h-5 w-5" />
                  通知設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 日次リマインダー */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="daily-reminder"
                    defaultChecked
                    disabled
                    className="border-amber-300 dark:border-amber-600"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="daily-reminder"
                      className="text-sm font-medium text-amber-700 dark:text-amber-300"
                    >
                      日次リマインダー
                    </Label>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      毎日の学習を忘れないようリマインダーを送信します
                    </p>
                  </div>
                </div>

                {/* 達成通知 */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="achievement-notification"
                    defaultChecked
                    disabled
                    className="border-amber-300 dark:border-amber-600"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="achievement-notification"
                      className="text-sm font-medium text-amber-700 dark:text-amber-300"
                    >
                      達成通知
                    </Label>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      学習目標達成時に通知を送信します
                    </p>
                  </div>
                </div>

                {/* 復習リマインダー */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="review-reminder"
                    defaultChecked
                    disabled
                    className="border-amber-300 dark:border-amber-600"
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="review-reminder"
                      className="text-sm font-medium text-amber-700 dark:text-amber-300"
                    >
                      復習リマインダー
                    </Label>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      復習が必要な単語がある場合に通知を送信します
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 開発中メッセージ */}
          <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  機能開発中
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  プロフィール設定機能は現在開発中です。上記の設定は現在無効化されており、実際の設定変更はできません。
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                    開発中
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    設定無効
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 