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
import { Volume2, Heart, Search } from 'lucide-react';
import { Header } from '@/components/header';

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

  const handleBackToCategory = () => {
    router.push(`/protected/category/${encodeURIComponent(category)}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/landing');
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
      case 'studying': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200';
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-700 dark:text-amber-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex flex-col">
      <Header
        title={`${category} - 単語一覧`}
        showBackButton={true}
        onBackClick={handleBackToCategory}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 flex flex-col w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 min-h-0">
        {/* 統計表示 */}
        <div className="mb-4 flex-shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 3xl:grid-cols-8 gap-3 max-w-screen-2xl mx-auto">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  {words.length}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  総単語数
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {words.filter(word => getMasteryLevel(word.id) === 'mastered').length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  習得済み
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {words.filter(word => getMasteryLevel(word.id) === 'studying').length}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  学習中
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700">
              <CardContent className="p-3 text-center">
                <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                  {words.filter(word => getMasteryLevel(word.id) === 'new').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  未学習
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-4 max-w-screen-2xl mx-auto">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 h-4 w-4" />
              <Input
                placeholder="単語や意味で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20'
                }
              >
                すべて
              </Button>
              <Button
                variant={filter === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('new')}
                className={filter === 'new' 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20'
                }
              >
                未学習
              </Button>
              <Button
                variant={filter === 'studying' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('studying')}
                className={filter === 'studying' 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20'
                }
              >
                学習中
              </Button>
              <Button
                variant={filter === 'mastered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('mastered')}
                className={filter === 'mastered' 
                  ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                  : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20'
                }
              >
                習得済み
              </Button>
            </div>
          </div>
        </div>

        {/* 単語一覧 - スクロール可能なコンテナ */}
        <div className="flex-1 min-h-0">
          <div className="h-full scroll-container mobile-scroll pr-2 -mr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-3 pb-4">
              {filteredWords.map((word) => {
                const progress = userProgress[word.id];
                const masteryLevel = getMasteryLevel(word.id);
                
                return (
                  <Card key={word.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-600">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm truncate">
                              {word.word}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(word.word)}
                                className="text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 h-6 w-6 p-0 touch-friendly"
                              >
                                <Volume2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(word.id)}
                                className={`h-6 w-6 p-0 touch-friendly ${progress?.is_favorite ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20'}`}
                              >
                                <Heart className="h-3 w-3" fill={progress?.is_favorite ? 'currentColor' : 'none'} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300 truncate">
                            {word.japanese}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex-shrink-0 ml-2 ${getMasteryColor(masteryLevel)}`}
                        >
                          {getMasteryText(masteryLevel)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                      <div className="space-y-1">
                        <div className="text-xs text-amber-600 dark:text-amber-400 truncate">
                          {word.phonetic}
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2">
                          {word.example1}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 line-clamp-2">
                          {word.example1_jp}
                        </div>
                        {progress && (
                          <div className="flex items-center justify-between pt-1 border-t border-amber-100 dark:border-amber-700">
                            <div className="text-xs text-amber-600 dark:text-amber-400">
                              習熟度: {Math.round(progress.mastery_level * 100)}%
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToReview(word.id)}
                              className="text-xs text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20 h-6 px-2"
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
                <p className="text-amber-600 dark:text-amber-400">
                  条件に一致する単語が見つかりませんでした
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}