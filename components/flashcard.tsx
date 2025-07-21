'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RotateCcw, Volume2, Play, Star, StarOff } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { AudioControls } from '@/components/audio-controls';
import { DatabaseService } from '@/lib/database';
import { createClient } from '@/lib/supabase/client';

interface FlashcardProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  onAddToReview: (wordId: string) => void;
  category?: string;
}

export function Flashcard({
  words,
  onComplete,
  onAddToReview,
  category
}: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [expandedSentences, setExpandedSentences] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sessionId, setSessionId] = useState<string | null>(null);

  const currentWord = words[currentIndex];
  const { speak, isEnabled } = useAudioStore();
  const supabase = createClient();
  const db = useMemo(() => new DatabaseService(), []);

  const loadUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // お気に入り状態を読み込み
        const progress = await db.getWordProgress(user.id, currentWord.id);
        if (progress?.is_favorite) {
          setFavorites(prev => new Set([...prev, currentWord.id]));
        }
      }
    } catch (error) {
      console.error('ユーザーデータの読み込みエラー:', error);
    }
  }, [currentWord.id, supabase, db]);

  const initializeSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && category && !sessionId) {
        const newSessionId = await db.createStudySession({
          user_id: user.id,
          category,
          mode: 'flashcard',
          total_words: words.length,
          completed_words: 0,
          correct_answers: 0,
          start_time: new Date().toISOString()
        });
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error('セッション初期化エラー:', error);
    }
  }, [category, sessionId, words.length, supabase, db]);

  useEffect(() => {
    setExpandedSentences([]);
    loadUserData();
    initializeSession();
  }, [currentIndex, loadUserData, initializeSession]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    try {
      if (sessionId) {
        await db.updateStudySession(sessionId, {
          completed_words: words.length,
          end_time: new Date().toISOString()
        });
      }
      onComplete(results);
    } catch (error) {
      console.error('セッション完了エラー:', error);
      onComplete(results);
    }
  };

  const handleAddToReview = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await db.addToReview(user.id, currentWord.id);
        onAddToReview(currentWord.id);
        
        // 成功メッセージを表示（オプション）
        console.log('復習リストに追加しました');
      }
    } catch (error) {
      console.error('復習リスト追加エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isFavorite = favorites.has(currentWord.id);
        const newFavorites = new Set(favorites);
        
        if (isFavorite) {
          newFavorites.delete(currentWord.id);
        } else {
          newFavorites.add(currentWord.id);
        }
        
        setFavorites(newFavorites);
        
        // DBに保存
        await db.upsertProgress({
          user_id: user.id,
          word_id: currentWord.id,
          mastery_level: 0,
          study_count: 0,
          correct_count: 0,
          incorrect_count: 0,
          last_studied: new Date().toISOString(),
          is_favorite: !isFavorite
        });
      }
    } catch (error) {
      console.error('お気に入り更新エラー:', error);
    }
  };

  const playWordAudio = () => {
    if (isEnabled && currentWord) {
      speak(currentWord.word);
    }
  };

  const playSentenceAudio = (sentence: string) => {
    if (isEnabled) {
      speak(sentence);
    }
  };

  const toggleSentence = (index: number) => {
    setExpandedSentences(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!currentWord) {
    return (
      <div className="text-center">
        <p className="text-amber-700 dark:text-amber-300">単語が見つかりません</p>
      </div>
    );
  }

  const isFavorite = favorites.has(currentWord.id);

  return (
    <div className="max-w-2xl mx-auto">
      {/* 進捗表示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {currentIndex + 1} / {words.length}
          </span>
          <AudioControls showQuickControls={true} />
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* フラッシュカード */}
      <Card className="bg-white dark:bg-gray-800 hover:shadow-lg border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center min-h-[400px] flex flex-col justify-center">
          {/* 英語の単語と発音 */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {currentWord.word}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:bg-yellow-50 dark:hover:bg-yellow-900/20`}
            >
              {isFavorite ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
            </Button>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {currentWord.phonetic}
          </p>
          
          {/* 発音を聞くボタン */}
          <Button
            variant="outline"
            onClick={playWordAudio}
            className="w-full mb-6 bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/20 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/30"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            発音を聞く
          </Button>

          {/* 例文 */}
          <div className="space-y-3">
            <div 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => toggleSentence(0)}
            >
              <div className="flex justify-between items-center">
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                    {currentWord.example1_jp}
                  </p>
                  {expandedSentences.includes(0) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentWord.example1}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSentenceAudio(currentWord.example1);
                  }}
                  className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => toggleSentence(1)}
            >
              <div className="flex justify-between items-center">
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                    {currentWord.example2_jp}
                  </p>
                  {expandedSentences.includes(1) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentWord.example2}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSentenceAudio(currentWord.example2);
                  }}
                  className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div 
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => toggleSentence(2)}
            >
              <div className="flex justify-between items-center">
                <div className="text-left flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1">
                    {currentWord.example3_jp}
                  </p>
                  {expandedSentences.includes(2) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentWord.example3}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSentenceAudio(currentWord.example3);
                  }}
                  className="text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          前へ
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={handleAddToReview}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isLoading ? '追加中...' : '復習'}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          次へ
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
} 