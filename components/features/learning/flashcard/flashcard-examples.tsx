/**
 * フラッシュカードの例文表示コンポーネント
 * 例文の表示と音声再生を管理
 */

'use client';

import { useState } from 'react';
import { Volume2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Word } from '@/lib/types';

interface FlashcardExamplesProps {
  word: Word;
  flippedExamples: Set<string>;
  onExampleClick: (exampleKey: string) => void;
  onPlayExampleAudio: (text: string, index: 1 | 2 | 3, lang: 'en' | 'ja') => void;
}

interface ExampleItemProps {
  exampleKey: string;
  englishText: string;
  japaneseText: string;
  isFlipped: boolean;
  onToggle: () => void;
  onPlayAudio: (text: string, lang: 'en' | 'ja') => void;
  index: 1 | 2 | 3;
}

function ExampleItem({ 
  exampleKey: _, 
  englishText, 
  japaneseText, 
  isFlipped, 
  onToggle, 
  onPlayAudio,
  index 
}: ExampleItemProps) {
  const [isPlayingEn, setIsPlayingEn] = useState(false);
  const [isPlayingJa, setIsPlayingJa] = useState(false);

  const handlePlayAudio = async (text: string, lang: 'en' | 'ja') => {
    const setLoading = lang === 'en' ? setIsPlayingEn : setIsPlayingJa;
    
    try {
      setLoading(true);
      await onPlayAudio(text, lang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* 英語例文 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              例文 {index}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePlayAudio(englishText, 'en')}
              disabled={isPlayingEn}
              className="h-6 w-6 p-0"
            >
              <Volume2 className={`h-3 w-3 ${isPlayingEn ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
          <p className="text-foreground leading-relaxed">{englishText}</p>
        </div>

        {/* 日本語訳の表示/非表示切り替え */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="flex items-center gap-2 h-6 text-xs"
            >
              {isFlipped ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  日本語を隠す
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  日本語を表示
                </>
              )}
            </Button>
            
            {isFlipped && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAudio(japaneseText, 'ja')}
                disabled={isPlayingJa}
                className="h-6 w-6 p-0"
              >
                <Volume2 className={`h-3 w-3 ${isPlayingJa ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
          
          {isFlipped && (
            <p className="text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
              {japaneseText}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function FlashcardExamples({
  word,
  flippedExamples,
  onExampleClick,
  onPlayExampleAudio,
}: FlashcardExamplesProps) {
  const examples = [
    { key: 'example1', en: word.example1, ja: word.example1_jp, index: 1 as const },
    { key: 'example2', en: word.example2, ja: word.example2_jp, index: 2 as const },
    { key: 'example3', en: word.example3, ja: word.example3_jp, index: 3 as const },
  ].filter((example): example is { key: string; en: string; ja: string; index: 1 | 2 | 3 } => 
    Boolean(example.en && example.ja)
  );

  if (examples.length === 0) {
    return (
      <Card className="p-4 text-center">
        <p className="text-muted-foreground">この単語には例文がありません</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground mb-3">例文</h3>
      
      {examples.map(({ key, en, ja, index }) => (
        <ExampleItem
          key={key}
          exampleKey={key}
          englishText={en}
          japaneseText={ja}
          isFlipped={flippedExamples.has(key)}
          onToggle={() => onExampleClick(key)}
          onPlayAudio={(text: string, lang: 'en' | 'ja') => onPlayExampleAudio(text, index, lang)}
          index={index}
        />
      ))}
    </div>
  );
}
