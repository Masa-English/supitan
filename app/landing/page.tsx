import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Clock, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { getStaticData } from '@/lib/static-data';

// 静的生成の設定 - より頻繁な更新で最新情報を提供
export const revalidate = 900; // 15分ごとに再生成

// 静的パラメータ生成（将来的な拡張用）
export async function generateStaticParams() {
  return [{}]; // ランディングページは単一ページ
}

// メタデータ最適化
export async function generateMetadata() {
  const staticData = await getStaticData();
  return {
    title: 'Masa Flash - 効率的な英語学習アプリ',
    description: `${staticData.totalWords}個の単語で効率的に英語を学習。フラッシュカード、クイズ、復習システムで語彙力アップ！`,
    keywords: ['英語学習', 'フラッシュカード', 'クイズ', '復習', '英単語', '語学学習'],
    openGraph: {
      title: 'Masa Flash - 効率的な英語学習アプリ',
      description: `${staticData.totalWords}個の単語で効率的に英語を学習`,
      type: 'website',
    },
  };
}

export default async function LandingPage() {
  // サーバーサイドでデータを取得
  const staticData = await getStaticData();

  return (
    <>
      {/* ヒーローセクション */}
      <div className="text-center mb-8 sm:mb-12 px-4 sm:px-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
          効率的な英語学習を始めましょう
        </h2>
        <p className="text-sm sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          {staticData.totalWords}個の単語で、あなたの英語力を向上させます
        </p>
        <Link href="/auth/sign-up">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-target shadow-lg hover:shadow-xl transition-all duration-200"
          >
            始める
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="mobile-grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1 sm:gap-2">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">総単語数</span>
              <span className="sm:hidden">単語数</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {staticData.totalWords}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1 sm:gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">カテゴリー</span>
              <span className="sm:hidden">カテゴリ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              {staticData.categories.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1 sm:gap-2">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">学習モード</span>
              <span className="sm:hidden">モード</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">
              3
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-2 px-3 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-primary flex items-center gap-1 sm:gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">最終更新</span>
              <span className="sm:hidden">更新</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-xs sm:text-sm text-primary">
              {new Date(staticData.lastUpdated).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリー一覧 */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
          学習カテゴリー
        </h2>
        <div className="mobile-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {staticData.categories.map((category) => (
            <Card key={category.name} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Badge variant="outline" className="text-sm sm:text-lg font-bold border-primary text-primary">
                    {category.pos}
                  </Badge>
                </div>
                <CardTitle className="text-lg sm:text-xl text-foreground">
                  {category.name}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {category.englishName}
                </p>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  {category.count}個の単語
                </p>
                <Link href="/auth/sign-up">
                  <Button 
                    variant="outline" 
                    className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-target w-full sm:w-auto"
                  >
                    学習開始
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 機能紹介 */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
          学習機能
        </h2>
        <div className="mobile-grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-foreground">
                フラッシュカード
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <p className="text-sm sm:text-base text-muted-foreground">
                カードをめくって単語を学習。音声機能付きで発音も学べます。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-foreground">
                クイズ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <p className="text-sm sm:text-base text-muted-foreground">
                選択問題で理解度を確認。間違えた問題は復習リストに自動追加。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <CardTitle className="text-lg sm:text-xl text-foreground">
                復習システム
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-4 sm:px-6">
              <p className="text-sm sm:text-base text-muted-foreground">
                忘却曲線に基づく効率的な復習で、長期記憶に定着させます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-6 sm:p-12 mx-4 sm:mx-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
          今すぐ英語学習を始めましょう
        </h2>
        <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-8">
          無料でアカウントを作成して、効率的な英語学習を体験してください。
        </p>
        <Link href="/auth/sign-up">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm sm:text-lg px-8 sm:px-12 py-3 sm:py-4 touch-target shadow-lg hover:shadow-xl transition-all duration-200"
          >
            無料で始める
          </Button>
        </Link>
      </div>
    </>
  );
} 