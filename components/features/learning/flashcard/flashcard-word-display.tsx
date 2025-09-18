/**
 * フラッシュカードの単語表示コンポーネント
 * 単語の表示とお気に入り機能を管理
 */

'use client';

import { Heart, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '@/lib/types';

interface FlashcardWordDisplayProps {
  word: Word;
  showJapanese: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPlayAudio: () => void;
  isAudioLoading?: boolean;
}

export function FlashcardWordDisplay({
  word,
  showJapanese,
  isFavorite,
  onToggleFavorite,
  onPlayAudio,
  isAudioLoading = false,
}: FlashcardWordDisplayProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="text-center space-y-4">
        {/* 英単語 */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-primary">{word.word}</h2>
          
          {/* 発音記号 */}
          {word.phonetic && (
            <p className="text-lg text-muted-foreground font-mono">
              /{word.phonetic}/
            </p>
          )}
        </div>

        {/* 音声再生ボタン */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayAudio}
            disabled={isAudioLoading}
            className="flex items-center gap-2 hover:bg-primary/10"
          >
            <Volume2 className={`h-4 w-4 ${isAudioLoading ? 'animate-pulse' : ''}`} />
            {isAudioLoading ? '読み込み中...' : '音声を再生'}
          </Button>
        </div>

        {/* 日本語意味（条件付き表示） */}
        {showJapanese && (
          <div className="pt-4 border-t border-primary/20">
            <p className="text-xl text-foreground">{word.japanese}</p>
            
            {/* 品詞 - 将来実装予定 */}
          </div>
        )}

        {/* お気に入りボタン */}
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className={`flex items-center gap-2 transition-colors ${
              isFavorite 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-red-400'
            }`}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} 
            />
            {isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
