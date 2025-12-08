import Link from 'next/link';
import { dataProvider } from '@/lib/api/services';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
import { getCategoryIdByName, getCategoryNameById } from '@/lib/constants/categories';
import { 
  Heart, 
  Search, 
  ArrowLeft, 
  Users, 
  Target, 
  LucideIcon
} from 'lucide-react';

// 単語カードコンポーネント
function WordCard({ word }: { word: Word }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card h-full flex flex-col">
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 leading-tight break-words">
              {word.word}
            </h3>
            <Badge variant="outline" className="text-xs sm:text-sm border-border text-muted-foreground px-2 py-0.5 inline-flex">
              {word.phonetic}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col gap-3 sm:gap-4">
        <div className="bg-muted rounded-lg p-3 flex-shrink-0">
          <p className="text-foreground text-base sm:text-lg font-semibold text-center break-words">
            {word.japanese}
          </p>
        </div>
        {word.example1 && (
          <div className="flex-1 flex flex-col">
            <div className="bg-muted/50 rounded-lg p-3 border border-border flex-1">
              <p className="text-sm text-muted-foreground italic mb-2 leading-relaxed">
                &ldquo;{word.example1}&rdquo;
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {word.example1_jp}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 統計カードコンポーネント
function StatCard({ icon: Icon, label, value }: { icon: LucideIcon, label: string, value: string | number }) {
  return (
    <Card className="bg-card border-border shadow-md">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-lg sm:text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const revalidate = 300; // 5分

// カテゴリーIDから名前を取得（動的取得を使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  try {
    return await getCategoryNameById(categoryId);
  } catch (error) {
    console.error('Error getting category name:', error);
    return undefined;
  }
}

export default async function BrowsePage({ params }: { params: Promise<{ category_id: string }> }) {
  const { category_id: category } = await params;
  // カテゴリーIDから名前を取得
  const categoryName = await getCategoryName(category);
  if (!categoryName) throw new Error('Category not found');

  const categoryId = await getCategoryIdByName(categoryName);
  if (!categoryId) throw new Error('Category not found');

  const words = await dataProvider.getWordsByCategory(categoryId);
  const totalWords = words.length;
  const withExamples = words.filter(w => w.example1).length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {categoryName}の単語一覧
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">{totalWords}個の単語</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">学習準備完了</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 min-h-0">
        {/* 統計セクション */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <StatCard icon={Users} label="総単語数" value={totalWords} />
            <StatCard icon={Target} label="例文付き" value={withExamples} />
            <StatCard icon={Search} label="学習可能" value={totalWords} />
            <StatCard icon={Heart} label="お気に入り" value="0" />
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="mb-4 sm:mb-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Link href={`/learning/${category}`} prefetch className="flex-1 lg:flex-none">
              <Button variant="outline" className="w-full lg:w-auto border-border text-foreground hover:bg-muted text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                カテゴリーに戻る
              </Button>
            </Link>
            <Link href="/learning/categories" className="flex-1 lg:flex-none">
              <Button variant="ghost" className="w-full lg:w-auto text-muted-foreground hover:bg-muted text-xs sm:text-sm">
                カテゴリー一覧
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
            <Link href={`/learning/${category}/options?mode=flashcard`} prefetch className="w-full">
              <Button className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm h-10">
                フラッシュカード
              </Button>
            </Link>
            <Link href={`/learning/${category}/options?mode=quiz`} prefetch className="w-full">
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted text-xs sm:text-sm h-10">
                クイズ学習
              </Button>
            </Link>
          </div>
        </div>

        {/* 単語一覧 */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {words.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}