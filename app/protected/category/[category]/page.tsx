'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Play } from 'lucide-react';
import { Header } from '@/components/header';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

  const category = decodeURIComponent(params.category as string);

  const loadWords = useCallback(async () => {
    try {
      const wordsData = await db.getWordsByCategory(category);
      setWords(wordsData);
    } catch (error) {
      console.error('単語の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      await loadWords();
    };

    getUser();
  }, [loadWords, router, supabase.auth]);

  const handleBack = () => {
    router.push('/protected');
  };

  const handleStartFlashcard = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}/flashcard`);
  };

  const handleStartQuiz = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}/quiz`);
  };

  const handleBrowseWords = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}/browse`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700 dark:text-amber-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
      <Header 
        title={`${category} (${words.length}個の単語)`}
        showBackButton={true}
        onBackClick={handleBack}
        showUserInfo={false}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* フラッシュカード */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700" onClick={handleStartFlashcard}>
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

          {/* クイズ */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700" onClick={handleStartQuiz}>
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

          {/* 単語一覧 */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 border-amber-200 dark:border-amber-700" onClick={handleBrowseWords}>
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