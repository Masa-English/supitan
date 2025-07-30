'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { BookOpen, Brain, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 学習モードの定義
const learningModes = [
  {
    id: 'flashcard',
    name: 'フラッシュカード',
    description: '単語を見て意味を覚える',
    icon: BookOpen,
    color: 'primary',
    recommended: true
  },
  {
    id: 'quiz',
    name: 'クイズ',
    description: '選択肢から正解を選ぶ',
    icon: Brain,
    color: 'secondary'
  }
];

export default function StartLearningPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  // ページ読み込み時にセッションストレージから学習モードを復元
  useEffect(() => {
    const savedMode = sessionStorage.getItem('selectedLearningMode');
    if (savedMode) {
      setSelectedMode(savedMode);
      console.log('セッションストレージから復元されたモード:', savedMode);
    }
  }, []);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    // 選択されたモードをセッションストレージに保存
    sessionStorage.setItem('selectedLearningMode', modeId);
    console.log('学習モードが選択されました:', modeId);
    
    // カテゴリー選択ページに遷移
    router.push('/dashboard/start-learning/category');
  };

  return (
    <AuthWrapper>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* ページタイトル - スマホでの高さ削減 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            学習モードを選択
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            学習方法を選んでください
          </p>
        </div>
        
        {/* 学習モード選択 - フレックスレイアウトで画面を埋める */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md sm:max-w-lg">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {learningModes.map((mode) => {
                const IconComponent = mode.icon;
                const isSelected = selectedMode === mode.id;
                
                return (
                  <Card 
                    key={mode.id}
                    className={`group bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-border touch-friendly ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'hover:border-primary/20'
                    }`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-primary/15 rounded-xl group-hover:bg-primary/25 transition-colors">
                            <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-base sm:text-lg font-semibold text-foreground">
                              {mode.name}
                            </span>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {mode.description}
                            </p>
                          </div>
                        </div>
                        {mode.recommended && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                            推奨
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 rounded-full">
                            <IconComponent className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                            <span className="hidden sm:inline">{mode.name}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold text-primary">
                            <Play className="h-5 w-5 sm:h-6 sm:w-6" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* 選択状態の表示 - 固定位置 */}
        {selectedMode && (
          <div className="mt-4 sm:mt-6 text-center p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              選択されたモード: <span className="font-semibold text-primary">
                {learningModes.find(m => m.id === selectedMode)?.name}
              </span>
            </p>
            <p className="text-xs sm:text-sm text-primary">
              カテゴリー選択ページに移動しました
            </p>
          </div>
        )}
      </main>
    </AuthWrapper>
  );
} 