'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Volume2, Heart, Search } from 'lucide-react';

export default function BrowsePage() {
  const params = useParams();
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, { mastery_level: number; is_favorite: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'studying' | 'mastered'>('all');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);
  const category = decodeURIComponent(params.category as string);

  const loadData = useCallback(async (userId: string) => {
    try {
      const [wordsData, progressData] = await Promise.all([
        db.getWordsByCategory(category),
        db.getUserProgress(userId)
      ]);

      setWords(wordsData);
      
      // プログレスデータをマップ形式に変換
      const progressMap: Record<string, { mastery_level: number; is_favorite: boolean }> = {};
      progressData.forEach(progress => {
        progressMap[progress.word_id] = {
          mastery_level: progress.mastery_level,
          is_favorite: progress.is_favorite
        };
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, [category, db]);

  const filterWords = useCallback(() => {
    let filtered = words;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        word.japanese.includes(searchQuery)
      );
    }

    // マスタリーフィルター
    switch (filter) {
      case 'new':
        filtered = filtered.filter(word => !userProgress[word.id]);
        break;
      case 'studying':
        filtered = filtered.filter(word => {
          const progress = userProgress[word.id];
          return progress && progress.mastery_level > 0 && progress.mastery_level < 0.8;
        });
        break;
      case 'mastered':
        filtered = filtered.filter(word => {
          const progress = userProgress[word.id];
          return progress && progress.mastery_level >= 0.8;
        });
        break;
    }

    setFilteredWords(filtered);
  }, [words, searchQuery, filter, userProgress]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      await loadData(user.id);
    };

    getUser();
  }, [loadData, router, supabase.auth]);

  useEffect(() => {
    filterWords();
  }, [filterWords]);

  const handleToggleFavorite = async (wordId: string) => {
    if (!user) return;

    try {
      const currentProgress = userProgress[wordId];
      const newFavoriteState = !(currentProgress?.is_favorite || false);
      
      await db.updateProgress(user.id, wordId, {
        is_favorite: newFavoriteState
      });

      setUserProgress(prev => ({
        ...prev,
        [wordId]: {
          ...prev[wordId],
          is_favorite: newFavoriteState
        }
      }));
    } catch (error) {
      console.error('お気に入りの更新に失敗しました:', error);
    }
  };

  const handleAddToReview = async (wordId: string) => {
    if (!user) return;

    try {
      await db.addToReview(user.id, wordId);
    } catch (error) {
      console.error('復習リストへの追加に失敗しました:', error);
    }
  };

  const playAudio = (word: string) => {
    console.log('音声再生:', word);
  };

  const getMasteryLevel = (wordId: string) => {
    const progress = userProgress[wordId];
    if (!progress) return 'new';
    if (progress.mastery_level >= 0.8) return 'mastered';
    if (progress.mastery_level > 0) return 'studying';
    return 'new';
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'mastered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'studying': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'new': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getMasteryText = (level: string) => {
    switch (level) {
      case 'mastered': return '習得済み';
      case 'studying': return '学習中';
      case 'new': return '未学習';
      default: return '未学習';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/protected/category/${encodeURIComponent(category)}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {category} - 単語一覧
            </h1>
            <Badge variant="secondary" className="ml-4">
              {filteredWords.length}個
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索・フィルター */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="単語や意味で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                すべて
              </Button>
              <Button
                variant={filter === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('new')}
              >
                未学習
              </Button>
              <Button
                variant={filter === 'studying' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('studying')}
              >
                学習中
              </Button>
              <Button
                variant={filter === 'mastered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('mastered')}
              >
                習得済み
              </Button>
            </div>
          </div>
        </div>

        {/* 単語一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const progress = userProgress[word.id];
            const masteryLevel = getMasteryLevel(word.id);
            
            return (
              <Card key={word.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {word.word}
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(word.word)}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(word.id)}
                          className={progress?.is_favorite ? 'text-red-500' : 'text-gray-400'}
                        >
                          <Heart className="h-4 w-4" fill={progress?.is_favorite ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {word.japanese}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getMasteryColor(masteryLevel)}`}
                    >
                      {getMasteryText(masteryLevel)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {word.phonetic}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {word.example1}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {word.example1_jp}
                    </div>
                    {progress && (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          習熟度: {Math.round(progress.mastery_level * 100)}%
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToReview(word.id)}
                          className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          復習に追加
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredWords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              条件に一致する単語が見つかりませんでした
            </p>
          </div>
        )}
      </main>
    </div>
  );
}