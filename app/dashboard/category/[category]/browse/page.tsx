'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { 
  Volume2, 
  Heart, 
  Search, 
  ArrowLeft, 
  Users, 
  Target, 
  LucideIcon, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';

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
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card h-full min-h-[280px] sm:min-h-[320px]">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={playAudio}
            className="text-muted-foreground hover:bg-muted flex-shrink-0 ml-2 h-8 w-8"
            title="発音を聞く"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
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
            
            {word.example2 && (
              <div className="bg-muted/50 rounded-lg p-2 sm:p-3 border border-border">
                <p className="text-xs sm:text-sm text-muted-foreground italic mb-1 sm:mb-2 leading-relaxed">
                  &ldquo;{word.example2}&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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

// ローディング状態コンポーネント
function LoadingState({ category }: { category: string }) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {category}の単語一覧
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-muted-foreground">
              <div className="flex items-center gap-1 sm:gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">読み込み中...</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 min-h-0">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground text-sm sm:text-base">単語を読み込み中...</span>
        </div>
      </main>
    </div>
  );
}

// エラー状態コンポーネント
function ErrorState({ category, error, onRetry }: { category: string, error?: string, onRetry: () => void }) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {category}の単語一覧
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 min-h-0">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            エラーが発生しました
          </h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            {error || 'データの取得に失敗しました'}
          </p>
          <Button onClick={onRetry} className="bg-primary hover:bg-primary/90">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function BrowsePage() {
  const params = useParams();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);

  const withExamples = words.filter(word => word.example1).length;

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allWords = await db.getWords();
      const categoryWords = allWords.filter(word => word.category === category);
      
      if (categoryWords.length === 0) {
        setError(`カテゴリー "${category}" が見つかりませんでした`);
      } else {
        setWords(categoryWords);
      }
    } catch (err) {
      console.error('Browse page error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [db, category]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  if (loading) {
    return <LoadingState category={category} />;
  }

  if (error) {
    return <ErrorState category={category} error={error} onRetry={loadWords} />;
  }

  const totalWords = words.length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="bg-card border-b border-border flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {category}の単語一覧
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
            <Link href={`/dashboard/category/${encodeURIComponent(category)}`}>
              <Button variant="outline" className="border-border text-foreground hover:bg-muted text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                カテゴリーに戻る
              </Button>
            </Link>
            <Link href="/dashboard/category">
              <Button variant="ghost" className="text-muted-foreground hover:bg-muted text-xs sm:text-sm">
                カテゴリー一覧
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/category/${encodeURIComponent(category)}/options?mode=flashcard`}>
              <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                フラッシュカード学習
              </Button>
            </Link>
            <Link href={`/dashboard/category/${encodeURIComponent(category)}/options?mode=quiz`}>
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