'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthWrapper } from '@/components/auth';
import { BookOpen, Brain, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNavigationStore } from '@/lib/navigation-store';

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
  const startNavigating = useNavigationStore((s) => s.start);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ハイドレーションエラーを防ぐため、クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ページ読み込み時にセッションストレージから学習モードを復元
  useEffect(() => {
    if (isClient) {
      const savedMode = sessionStorage.getItem('selectedLearningMode');
      if (savedMode) {
        setSelectedMode(savedMode);
        console.log('セッションストレージから復元されたモード:', savedMode);
      }
    }
  }, [isClient]);

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    // 選択されたモードをセッションストレージに保存
    if (isClient) {
      sessionStorage.setItem('selectedLearningMode', modeId);
    }
    console.log('学習モードが選択されました:', modeId);
    
    // カテゴリー選択ページに遷移
    startNavigating();
    router.push('/dashboard/start-learning/category');
  };

  return (
    <AuthWrapper>
      <div className="container mx-auto px-4 py-6">
        {/* ページタイトル */}
        <div className="mb-6 animate-fadeIn">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            学習モードを選択
          </h1>
          <p className="text-sm text-muted-foreground">
            学習方法を選んでください
          </p>
        </div>
        
        {/* 学習モード選択 */}
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            {learningModes.map((mode, index) => {
              const IconComponent = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <Card 
                  key={mode.id}
                  className={`group bg-card hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-border transform ${
                    isSelected 
                      ? 'border-primary ring-2 ring-primary/20 scale-105' 
                      : 'hover:border-primary/20'
                  }`}
                  onClick={() => handleModeSelect(mode.id)}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: 'slideInUp 0.5s ease-out forwards'
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/15 rounded-lg group-hover:bg-primary/25 transition-all duration-200 group-hover:scale-110">
                          <IconComponent className="h-5 w-5 text-primary transition-transform duration-200 group-hover:rotate-12" />
                        </div>
                        <div>
                          <span className="text-lg font-semibold text-foreground transition-colors duration-200">
                            {mode.name}
                          </span>
                          <p className="text-sm text-muted-foreground transition-colors duration-200">
                            {mode.description}
                          </p>
                        </div>
                      </div>
                      {mode.recommended && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs animate-pulse">
                          推奨
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-end">
                      <Play className="h-5 w-5 text-primary transition-all duration-200 group-hover:scale-110 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* 選択状態の表示 */}
        {selectedMode && (
          <div className="mt-6 text-center p-4 bg-primary/5 rounded-lg border border-primary/20 animate-fadeIn">
            <p className="text-sm text-muted-foreground mb-2">
              選択されたモード: <span className="font-semibold text-primary">
                {learningModes.find(m => m.id === selectedMode)?.name}
              </span>
            </p>
            <p className="text-sm text-primary">
              カテゴリー選択ページに移動しました
            </p>
          </div>
        )}

        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </AuthWrapper>
  );
} 