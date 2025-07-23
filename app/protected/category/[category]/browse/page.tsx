import { getStaticDataForCategory } from '@/lib/static-data';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Heart, Search, ArrowLeft, Users, Target, LucideIcon, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ReloadButton } from '@/components/reload-button';

// 静的生成の設定
export const revalidate = 1800; // 30分ごとに再生成

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  try {
    const words = await getStaticDataForCategory(decodedCategory);
    
    return {
      title: `${decodedCategory}の単語一覧 - Masa Flash`,
      description: `${decodedCategory}カテゴリーの${words.length}個の単語を一覧で確認。意味や例文をじっくり学習しましょう。`,
      keywords: ['英語学習', '単語一覧', decodedCategory, '英単語', '意味', '例文'],
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return {
      title: `${decodedCategory}の単語一覧 - Masa Flash`,
      description: `${decodedCategory}カテゴリーの単語を学習しましょう。`,
      keywords: ['英語学習', '単語一覧', decodedCategory, '英単語'],
    };
  }
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
  const playAudio = () => {
    if (word.word) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] h-full min-h-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-2 leading-tight">
              {word.word}
            </h3>
            <Badge variant="outline" className="text-sm border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 px-2 py-1">
              {word.phonetic}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={playAudio}
            className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 flex-shrink-0 ml-2 h-8 w-8"
            title="発音を聞く"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <p className="text-amber-800 dark:text-amber-200 text-lg font-semibold text-center">
            {word.japanese}
          </p>
        </div>
        
        {word.example1 && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-amber-25 to-orange-25 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300 italic mb-2 leading-relaxed">
                &ldquo;{word.example1}&rdquo;
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                {word.example1_jp}
              </p>
            </div>
            
            {word.example2 && (
              <div className="bg-gradient-to-r from-amber-25 to-orange-25 dark:from-amber-900/10 dark:to-orange-900/10 rounded-lg p-3 border border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 italic mb-2 leading-relaxed">
                  &ldquo;{word.example2}&rdquo;
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                  {word.example2_jp}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 統計カードコンポーネント
function StatCard({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string | number }) {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700 shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{label}</p>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// エラー状態コンポーネント
function ErrorState({ category, error }: { category: string, error?: string }) {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* ヘッダー */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-amber-200 dark:border-amber-700 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/protected/category/${encodeURIComponent(category)}`}>
              <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                <ArrowLeft className="h-4 w-4 mr-2" />
                カテゴリーに戻る
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2">
              {category}の単語一覧
            </h1>
            <div className="flex items-center justify-center gap-4 text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>データを読み込み中</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            データを読み込み中です
          </h2>
          <p className="text-amber-700 dark:text-amber-300 mb-6">
            {category}カテゴリーの単語データを準備しています。初回アクセス時は少し時間がかかる場合があります。
          </p>
          {error && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                エラー詳細: {error}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              問題が続く場合は、以下をお試しください：
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ReloadButton 
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ページを再読み込み
              </ReloadButton>
              <Link href={`/protected/category/${encodeURIComponent(category)}`}>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                  カテゴリーページに戻る
                </Button>
              </Link>
            </div>
            <div className="mt-6">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                このページは自動的に更新されます。しばらくお待ちください。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function BrowsePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  try {
    const words = await getStaticDataForCategory(decodedCategory);

    // データが空の場合はエラー状態を表示（notFound()は呼ばない）
    if (words.length === 0) {
      return <ErrorState category={decodedCategory} />;
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
          <div className="flex-shrink-0 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <StatCard icon={Users} label="総単語数" value={totalWords} />
              <StatCard icon={Target} label="平均文字数" value={avgLength} />
              <StatCard icon={Heart} label="例文付き" value={withExamples} />
              <StatCard icon={Search} label="カテゴリー" value={decodedCategory} />
            </div>
          </div>

          {/* 学習モードリンク */}
          <div className="flex-shrink-0 mb-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/flashcard`} className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    📚 フラッシュカード学習
                  </Button>
                </Link>
                <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/quiz`} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    🧠 クイズに挑戦
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 単語リスト */}
          <div className="flex-1 min-h-0">
            <div className="h-full scroll-container mobile-scroll pr-2 -mr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-4 max-w-screen-2xl mx-auto">
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
    // エラー時もnotFound()ではなくエラー状態を表示
    return <ErrorState 
      category={decodedCategory} 
      error={error instanceof Error ? error.message : 'データの取得に失敗しました'}
    />;
  }
}