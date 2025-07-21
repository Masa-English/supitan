import { getStaticData } from '@/lib/static-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Clock, RotateCcw } from 'lucide-react';
import Link from 'next/link';

// 静的生成の設定
export const revalidate = 3600; // 1時間ごとに再生成

export default async function LandingPage() {
  const staticData = await getStaticData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              Masa Flash
            </h1>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  新規登録
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヒーローセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            効率的な英語学習を始めましょう
          </h2>
          <p className="text-xl text-amber-700 dark:text-amber-300 mb-8">
            {staticData.totalWords}個の単語で、あなたの英語力を向上させます
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white text-lg px-8 py-3">
              無料で始める
            </Button>
          </Link>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                総単語数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                {staticData.totalWords}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Target className="h-4 w-4" />
                カテゴリー数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {staticData.categories.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                学習モード
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                3
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                更新日時
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {new Date(staticData.lastUpdated).toLocaleDateString('ja-JP')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* カテゴリー一覧 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-6">
            学習カテゴリー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticData.categories.map((category) => (
              <Card 
                key={category.name}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 border-amber-200 dark:border-amber-700"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      {category.pos}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 dark:text-amber-300 mb-4">
                    {category.count}個の単語
                  </p>
                  <div className="space-y-2">
                    {staticData.categoryWords
                      .find(cw => cw.category === category.name)
                      ?.words.slice(0, 3)
                      .map((word) => (
                        <div key={word.id} className="text-sm text-amber-600 dark:text-amber-400">
                          {word.word} - {word.japanese}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 機能紹介 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-6">
            学習機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                  フラッシュカード
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  カードをめくって単語を学習しましょう。音声機能付きで効率的に覚えられます。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Target className="h-6 w-6 text-amber-600" />
                  クイズ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  選択問題で理解度を確認しましょう。間違えた問題は自動で復習リストに追加されます。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <RotateCcw className="h-6 w-6 text-amber-600" />
                  復習システム
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300">
                  間隔反復学習で効率的に記憶を定着させましょう。忘れやすい単語を自動で復習します。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-lg text-amber-700 dark:text-amber-300 mb-8">
            無料でアカウントを作成して、効率的な英語学習を始めませんか？
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
                無料で始める
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-amber-200 dark:border-amber-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-amber-700 dark:text-amber-300">
            <p>&copy; 2024 Masa Flash. All rights reserved.</p>
            <p className="mt-2 text-sm">
              最終更新: {new Date(staticData.lastUpdated).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 