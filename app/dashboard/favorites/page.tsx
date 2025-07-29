'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word, UserProgress } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  ArrowLeft, 
  Star,
  BookOpen,
  Target,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

// 単語カードコンポーネント
function WordCard({ word, progress }: { word: Word; progress?: UserProgress }) {
  const playAudio = () => {
    if (word.word) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const masteryLevel = progress?.mastery_level || 0;
  const studyCount = progress?.study_count || 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border bg-card">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* 単語と発音 */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {word.word}
            </h3>
            {word.phonetic && (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {word.phonetic}
              </Badge>
            )}
          </div>

          {/* 日本語訳 */}
          <p className="text-muted-foreground text-sm">
            {word.japanese}
          </p>

          {/* カテゴリー */}
          <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary-foreground">
            {word.category}
          </Badge>

          {/* 進捗情報 */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>習熟度</span>
                <span>{Math.round(masteryLevel * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${masteryLevel * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                学習回数: {studyCount}回
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              className="text-muted-foreground hover:text-foreground"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FavoritesPage() {
  const [favoriteWords, setFavoriteWords] = useState<Word[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const db = useMemo(() => new DatabaseService(), []);
  const supabase = createClient();

  // お気に入り単語の読み込み
  const loadFavoriteWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // お気に入り単語とユーザー進捗を取得
      // 現在は全単語を表示（お気に入り機能の実装状況に応じて調整）
      const [allWords, userProgressData] = await Promise.all([
        db.getWords(),
        db.getUserProgress(user.id)
      ]);

      setFavoriteWords(allWords);

      // 進捗情報をマップ化
      const progressMap: Record<string, UserProgress> = {};
      userProgressData.forEach(progress => {
        if (progress.word_id) {
          progressMap[progress.word_id] = progress;
        }
      });

      setUserProgress(progressMap);
    } catch (err) {
      console.error('Favorites page error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [db, supabase, router]);

  useEffect(() => {
    loadFavoriteWords();
  }, [loadFavoriteWords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">お気に入り単語を読み込み中...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadFavoriteWords} className="bg-primary hover:bg-primary/90">
              再試行
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:bg-muted mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-8 w-8 text-primary" />
              お気に入り単語
            </h1>
            <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground">
              {favoriteWords.length}個の単語
            </Badge>
          </div>
        </div>

        {/* お気に入り単語一覧 */}
        {favoriteWords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteWords.map((word) => (
              <WordCard 
                key={word.id} 
                word={word} 
                progress={userProgress[word.id]}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              お気に入り単語がありません
            </h3>
            <p className="text-muted-foreground mb-4">
              学習中にお気に入りに追加した単語がここに表示されます
            </p>
            <Link href="/dashboard/start-learning">
              <Button className="bg-primary hover:bg-primary/90">
                <BookOpen className="h-4 w-4 mr-2" />
                学習を開始
              </Button>
            </Link>
          </div>
        )}

        {/* 統計情報 */}
        {favoriteWords.length > 0 && (
          <div className="mt-12">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  お気に入り単語の統計
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {favoriteWords.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      お気に入り単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Object.keys(userProgress).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      学習済み単語数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(
                        Object.values(userProgress).reduce((sum, p) => sum + (p.mastery_level || 0), 0) / 
                        Math.max(Object.values(userProgress).length, 1) * 100
                      )}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      平均習熟度
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Object.values(userProgress).reduce((sum, p) => sum + (p.study_count || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      総学習回数
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
} 