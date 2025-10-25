import Link from 'next/link';
import { dataProvider } from '@/lib/api/services';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
// import { getCategoryNameById } from '@/lib/constants/categories'; // 未使用のためコメントアウト
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
    <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card h-full min-h-[240px]">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 leading-tight">
              {word.word}
            </h3>
            <Badge variant="outline" className="text-xs sm:text-sm border-border text-muted-foreground px-2 py-1">
              {word.phonetic}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3 sm:space-y-4">
        <div className="bg-muted rounded-lg p-3">
          <p className="text-foreground text-base sm:text-lg font-semibold text-center">
            {word.japanese}
          </p>
        </div>
        {word.example1 && (
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground italic mb-1 sm:mb-2 leading-relaxed">
                &ldquo;{word.example1}&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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

// カテゴリーIDから名前を取得（一時的に静的マッピングを使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  const categoryMap: Record<string, string> = {
    'b464ce08-9440-4178-923f-4d251b8dc0ab': '動詞',
    '6effaf5d-619c-4a70-b36d-9464549eadda': '句動詞',
    '659c3f6d-2e93-47b9-9fe3-c6838a82f6b9': '形容詞',
    '71bfd0a1-cc79-4257-bd4a-15d30d37555f': '副詞',
    '618464f6-6c7a-450a-9074-89e6d7becef9': '名詞',
    'db7620f6-7347-4cec-8a88-da3f8a27cc98': 'フレーズ',
    'fd181354-21ea-48d7-b4fa-8b6e1ca0264c': 'イディオム',
    '301aab35-e5ee-4136-98ba-ca272bb813d4': 'リアクション',
    '5a55ffb9-d020-49ac-81be-a256d7a24c8f': 'イディオム (副詞句)',
    '41240a24-458d-4184-9ef6-e8d1c8620d9d': 'イディオム(動詞+名詞句)',
    'ee6355f8-bd2d-46f3-8342-ccb80369c185': 'コロケーション',
    'b4bec9d1-a451-47f4-b1b6-2b1f0ef586f8': 'コロケーション（動詞+前置詞＋名詞)',
    '10d85f98-a88b-4f28-a20f-0a5b9851ff02': 'コロケーション（動詞+名詞型)',
    'c6ab103e-e829-41e0-9482-85e8e0a59b25': 'コロケーション（形容詞+前置詞型）',
    '47f218b0-1a67-4ce3-86bf-503cbcbc4376': '基礎動詞'
  };
  
  return categoryMap[categoryId];
}

export default async function BrowsePage({ params }: { params: Promise<{ category_id: string }> }) {
  const { category_id: category } = await params;
  // カテゴリーIDから名前を取得
  const categoryName = await getCategoryName(category);
  if (!categoryName) throw new Error('Category not found');

  const words = await dataProvider.getWordsByCategory(categoryName);
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
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href={`/learning/${category}`} prefetch>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                カテゴリーに戻る
              </Button>
            </Link>
            <Link href="/learning/categories">
              <Button variant="ghost" className="text-muted-foreground hover:bg-muted text-xs sm:text-sm">
                カテゴリー一覧
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/learning/${category}/options?mode=flashcard`} prefetch>
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                フラッシュカード学習
              </Button>
            </Link>
            <Link href={`/learning/${category}/options?mode=quiz`} prefetch>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs sm:text-sm">
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