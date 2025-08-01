import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Clock, RotateCcw, ArrowRight } from 'lucide-react';
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
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24">
      {/* ヒーローセクション */}
      <section className="text-center py-8 sm:py-12 lg:py-16 xl:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8 leading-tight">
            効率的な英語学習を
            <span className="text-primary block mt-2">始めましょう</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 leading-relaxed max-w-3xl mx-auto">
            {staticData.totalWords}個の単語で、あなたの英語力を向上させます
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-200 group w-full sm:w-auto"
              >
                無料で始める
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button 
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px] border-2 hover:bg-muted/50 transition-all duration-200 w-full sm:w-auto"
              >
                ログイン
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 統計カード */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6">
                <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-primary flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>総単語数</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary">
                  {staticData.totalWords}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6">
                <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-primary flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>カテゴリー</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary">
                  {staticData.categories.length}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6">
                <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-primary flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>学習モード</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-primary">
                  3
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 lg:px-6">
                <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-primary flex items-center gap-1 sm:gap-2 lg:gap-3">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span>最終更新</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 lg:px-6 pt-0">
                <div className="text-xs sm:text-sm lg:text-base text-primary font-medium">
                  {new Date(staticData.lastUpdated).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* カテゴリー一覧 */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              学習カテゴリー
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto">
              文法カテゴリー別に効率的に学習できます
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {staticData.categories.map((category) => (
              <Card key={category.name} className="bg-card/80 backdrop-blur-sm border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 lg:mb-6 group-hover:bg-primary/20 transition-colors">
                    <Badge variant="outline" className="text-sm sm:text-base lg:text-lg font-bold border-primary text-primary">
                      {category.pos}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl text-foreground">
                    {category.name}
                  </CardTitle>
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                    {category.englishName}
                  </p>
                </CardHeader>
                <CardContent className="text-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
                  <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-4 lg:mb-6">
                    {category.count}個の単語
                  </p>
                  <Link href="/auth/sign-up" className="block">
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/10 text-xs sm:text-sm lg:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto min-h-[40px] sm:min-h-[48px] w-full group-hover:border-primary/60 transition-all duration-200"
                    >
                      学習開始
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-3 sm:mb-4 lg:mb-6">
              学習機能
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground max-w-3xl mx-auto">
              科学的に設計された学習システムで効率的に英語を習得
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-foreground">
                  フラッシュカード
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                  カードをめくって単語を学習。音声機能付きで発音も学べます。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-foreground">
                  クイズ
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                  選択問題で理解度を確認。間違えた問題は復習リストに自動追加。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary/20 transition-colors">
                  <RotateCcw className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-foreground">
                  復習システム
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                  忘却曲線に基づく効率的な復習で、長期記憶に定着させます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 xl:p-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 lg:mb-8">
              今すぐ英語学習を始めましょう
            </h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed">
              無料でアカウントを作成して、効率的な英語学習を体験してください。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px] shadow-lg hover:shadow-xl transition-all duration-200 group w-full sm:w-auto"
                >
                  無料で始める
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 lg:px-10 py-3 sm:py-4 h-auto min-h-[48px] sm:min-h-[56px] border-2 hover:bg-muted/50 transition-all duration-200 w-full sm:w-auto"
                >
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 