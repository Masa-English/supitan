import { getStaticDataForCategory } from '@/lib/static-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Play } from 'lucide-react';
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
  const words = await getStaticDataForCategory(decodedCategory);

  if (words.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      {/* ヘッダー */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-amber-200 dark:border-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/protected">
              <Button variant="ghost" className="text-amber-700 dark:text-amber-300">
                ← 戻る
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
              {decodedCategory} ({words.length}個の単語)
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 単語一覧 */}
          <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/browse`}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                  単語一覧
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  すべての単語を確認しましょう
                </p>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  表示
                </Button>
              </CardContent>
            </Card>
          </Link>
          
          {/* フラッシュカード */}
          <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/flashcard`}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                  フラッシュカード
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  カードをめくって単語を学習しましょう
                </p>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  開始
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* クイズ */}
          <Link href={`/protected/category/${encodeURIComponent(decodedCategory)}/quiz`}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Brain className="h-6 w-6 text-amber-600" />
                  クイズ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  選択問題で理解度を確認しましょう
                </p>
                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  開始
                </Button>
              </CardContent>
            </Card>
          </Link>

          
        </div>

        {/* 単語プレビュー */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-4">
            単語プレビュー
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.slice(0, 6).map((word) => (
              <Card key={word.id} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-200 dark:border-amber-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                      {word.word}
                    </h3>
                    <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                      {word.phonetic}
                    </Badge>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    {word.japanese}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {words.length > 6 && (
            <p className="text-center text-amber-600 dark:text-amber-400 mt-4">
              他 {words.length - 6} 個の単語があります
            </p>
          )}
        </div>
      </main>
    </div>
  );
} 