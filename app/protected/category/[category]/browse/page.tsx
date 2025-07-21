import { getStaticDataForCategory } from '@/lib/static-data';
import { notFound } from 'next/navigation';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Heart, Search, ArrowLeft, Users, Target, LucideIcon } from 'lucide-react';
import Link from 'next/link';

// 静的生成の設定
export const revalidate = 1800; // 30分ごとに再生成

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const words = await getStaticDataForCategory(decodedCategory);
  
  return {
    title: `${decodedCategory}の単語一覧 - Masa Flash`,
    description: `${decodedCategory}カテゴリーの${words.length}個の単語を一覧で確認。意味や例文をじっくり学習しましょう。`,
    keywords: ['英語学習', '単語一覧', decodedCategory, '英単語', '意味', '例文'],
  };
}

// 静的パス生成
export async function generateStaticParams() {
  const categories = ['動詞', '形容詞', '副詞', '名詞'];
  
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

// 単語カードコンポーネント
function WordCard({ word }: { word: Word }) {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:scale-105 h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-1 truncate">
              {word.word}
            </h3>
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 mb-2">
              {word.phonetic}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 flex-shrink-0 ml-2"
          >
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-amber-700 dark:text-amber-300 text-sm mb-3 font-medium">
          {word.japanese}
        </p>
        {word.example1 && (
          <div className="space-y-2">
            <p className="text-xs text-amber-600 dark:text-amber-400 italic">
              &ldquo;{word.example1}&rdquo;
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {word.example1_jp}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 統計カードコンポーネント
function StatCard({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string | number }) {
  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-400">{label}</p>
            <p className="text-xl font-bold text-amber-800 dark:text-amber-200">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function BrowsePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  try {
    const words = await getStaticDataForCategory(decodedCategory);

    if (words.length === 0) {
      notFound();
    }

    // 統計データの計算
    const totalWords = words.length;
    const avgLength = Math.round(words.reduce((sum, word) => sum + word.word.length, 0) / totalWords);
    const withExamples = words.filter(word => word.example1).length;

    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        {/* ヘッダー */}
        <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-amber-200 dark:border-amber-700 flex-shrink-0">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}`}>
                <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  カテゴリーに戻る
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                {decodedCategory}の単語一覧
              </h1>
              <div className="flex items-center justify-center gap-4 text-amber-600 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{totalWords}個の単語</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>学習準備完了</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0">
          {/* 統計セクション */}
          <div className="flex-shrink-0 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 3xl:grid-cols-8 gap-3 max-w-screen-2xl mx-auto">
              <StatCard icon={Users} label="総単語数" value={totalWords} />
              <StatCard icon={Target} label="平均文字数" value={avgLength} />
              <StatCard icon={Heart} label="例文付き" value={withExamples} />
              <StatCard icon={Search} label="カテゴリー" value={decodedCategory} />
            </div>
          </div>

          {/* 学習モードリンク */}
          <div className="flex-shrink-0 mb-4">
            <div className="max-w-screen-2xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <div className="flex-1 flex gap-2">
                  <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/flashcard`} className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white touch-friendly">
                      フラッシュカード学習
                    </Button>
                  </Link>
                  <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/quiz`} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white touch-friendly">
                      クイズに挑戦
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 単語リスト */}
          <div className="flex-1 min-h-0">
            <div className="h-full scroll-container mobile-scroll pr-2 -mr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-3 pb-4 max-w-screen-2xl mx-auto">
                {words.map((word) => (
                  <WordCard key={word.id} word={word} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Browse page error:', error);
    notFound();
  }
}