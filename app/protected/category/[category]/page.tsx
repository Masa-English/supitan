import { getStaticDataForCategory } from '@/lib/static-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Play, ArrowLeft, Users, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// 静的生成の設定
export const revalidate = 3600; // 1時間ごとに再生成

// 動的メタデータ生成
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  return {
    title: `${decodedCategory} - Masa Flash`,
    description: `${decodedCategory}カテゴリーの単語を学習しましょう`,
  };
}

// 静的パス生成
export async function generateStaticParams() {
  // カテゴリー一覧を取得して静的パスを生成
  const categories = ['動詞', '形容詞', '副詞', '名詞'];
  
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  
  try {
    const words = await getStaticDataForCategory(decodedCategory);

    // データが空の場合の処理を改善
    if (words.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          {/* ヘッダー */}
          <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-amber-200 dark:border-amber-700 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/protected">
                  <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ダッシュボードに戻る
                  </Button>
                </Link>
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                  {decodedCategory}
                </h1>
                <p className="text-amber-600 dark:text-amber-400">
                  カテゴリー: {decodedCategory}
                </p>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
                データを読み込み中です
              </h2>
              <p className="text-amber-700 dark:text-amber-300 mb-6">
                {decodedCategory}カテゴリーの単語データを準備しています。しばらくお待ちください。
              </p>
              <div className="space-y-4">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  問題が続く場合は、以下をお試しください：
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/protected">
                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                      ダッシュボードに戻る
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    onClick={() => window.location.reload()}
                  >
                    ページを再読み込み
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        {/* ヘッダー */}
        <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-amber-200 dark:border-amber-700 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/protected">
                <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ダッシュボードに戻る
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                {decodedCategory}
              </h1>
              <div className="flex items-center justify-center gap-4 text-amber-600 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{words.length}個の単語</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span>3つの学習モード</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 学習モード選択 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-6 text-center">
              学習モードを選択してください
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 単語一覧 */}
              <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/browse`}>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-blue-200 dark:border-blue-700 h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
                      単語一覧
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-blue-700 dark:text-blue-300 mb-6">
                      すべての単語を一覧で確認できます。意味や例文をじっくり学習しましょう。
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      単語を見る
                    </Button>
                  </CardContent>
                </Card>
              </Link>
              
              {/* フラッシュカード */}
              <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/flashcard`}>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-green-200 dark:border-green-700 h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl text-green-800 dark:text-green-200">
                      フラッシュカード
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-green-700 dark:text-green-300 mb-6">
                      カードをめくって単語を学習します。音声機能付きで効率的に覚えられます。
                    </p>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      学習開始
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* クイズ */}
              <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/quiz`}>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 border-purple-200 dark:border-purple-700 h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-xl text-purple-800 dark:text-purple-200">
                      クイズ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-purple-700 dark:text-purple-300 mb-6">
                      選択問題で理解度を確認します。間違えた問題は自動で復習リストに追加されます。
                    </p>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Play className="h-4 w-4 mr-2" />
                      クイズ開始
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* 単語プレビュー */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-6 text-center">
              単語プレビュー
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {words.slice(0, 8).map((word) => (
                <Card key={word.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                        {word.word}
                      </h3>
                      <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300 mb-3">
                        {word.phonetic}
                      </Badge>
                      <p className="text-amber-700 dark:text-amber-300 text-sm">
                        {word.japanese}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {words.length > 8 && (
              <div className="text-center mt-8">
                <p className="text-amber-600 dark:text-amber-400 text-lg">
                  他 {words.length - 8} 個の単語があります
                </p>
                <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/browse`}>
                  <Button variant="outline" className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                    すべての単語を見る
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Category page error:', error);
    notFound();
  }
} 