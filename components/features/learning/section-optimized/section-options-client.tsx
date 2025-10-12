/**
 * 最適化されたセクション選択クライアントコンポーネント
 * リアルタイム更新とパフォーマンス最適化を実装
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// import { redirect } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
import { ArrowRight, Layers, BookOpen, Brain, ArrowLeft, RefreshCw } from 'lucide-react';
import { SectionLink } from '@/app/(dashboard)/learning/[category]/options/section-link';
import { RandomInput } from '@/app/(dashboard)/learning/[category]/options/random-input';
import { useSmartRealtimeWords } from '@/lib/hooks/use-smart-realtime';
import { useDataStore } from '@/lib/stores/data-store-unified';
// import type { Word } from '@/lib/types';

interface SectionInfo {
  section: string;
  count: number;
}

interface SectionOptionsClientProps {
  category: string;
  mode: 'quiz' | 'flashcard';
  initialData: {
    totalCount: number;
    sections: SectionInfo[];
    wordsCount: number;
  };
}

export function SectionOptionsClient({ 
  category, 
  mode, 
  initialData 
}: SectionOptionsClientProps) {
  const [sectionData, setSectionData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { refreshData: _storeRefreshData } = useDataStore();
  
  // スマートリアルタイム更新の設定
  const { isConnected, refresh: _realtimeRefresh, stats } = useSmartRealtimeWords(category);

  // データリフレッシュ関数
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // サーバーアクションを呼び出してデータを更新
      const response = await fetch(`/api/sections/${encodeURIComponent(category)}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300', // 5分キャッシュ
        },
      });
      
      if (response.ok) {
        const newData = await response.json();
        setSectionData(newData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to refresh section data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [category]);

  // スマートリアルタイム更新の監視
  useEffect(() => {
    if (isConnected) {
      console.log('[SectionOptions] Smart realtime connection established');
      console.log('[SectionOptions] Stats:', stats);
    }
  }, [isConnected, stats]);

  // リアルタイム更新時の処理
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      console.log('[SectionOptions] Realtime update received');
      refreshData();
    };

    // カスタムイベントリスナーを設定（必要に応じて）
    window.addEventListener('sectionDataUpdated', handleRealtimeUpdate);
    
    return () => {
      window.removeEventListener('sectionDataUpdated', handleRealtimeUpdate);
    };
  }, [refreshData]);

  const base = `/learning/${encodeURIComponent(category)}/${mode}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Link
              href="/learning/categories"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
              aria-label="カテゴリー選択に戻る"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              カテゴリー選択に戻る
            </Link>
            
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">学習オプション</h1>
              
              {/* リアルタイム状態とリフレッシュボタン */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={isConnected ? 'リアルタイム接続中' : '接続なし'}
                  />
                  {isConnected ? 'リアルタイム' : 'オフライン'}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshData}
                  disabled={isRefreshing}
                  className="h-8 w-8 p-0"
                  title="データを更新"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* 最終更新時刻 */}
            <div className="text-xs text-muted-foreground mt-1">
              最終更新: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Layers className="h-3 w-3 mr-1" /> カテゴリー
              </Badge>
              <span className="text-sm font-medium text-foreground">{category}</span>
              <span className="text-muted-foreground">·</span>
              <Badge variant="secondary" className="text-xs">
                {mode === 'quiz' ? <Brain className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />} モード
              </Badge>
              <span className="text-sm font-medium text-foreground">{mode}</span>
            </div>
            <Link href={`/learning/${encodeURIComponent(category)}/browse`}>
              <Button variant="outline" size="sm" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                単語一覧
              </Button>
            </Link>
          </div>
          
          <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
            {/* ❶ 順番通り */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">❶ 順番通り</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionData.totalCount === 0 ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">このカテゴリーにはまだ単語がありません。</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href="/learning/categories"
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        カテゴリー選択に戻る
                      </Link>
                      <Link
                        href={`/learning/${encodeURIComponent(category)}/browse`}
                        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                      >
                        一覧を見る
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      単語を順番通りに学習します。セクション別に分かれている場合は、セクションを選択してください。
                    </p>
                    {sectionData.sections.length === 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">セクションがない場合は、全ての単語を順番通りに学習します。</p>
                        <Link href={`${base}`}>
                          <Button className="bg-primary hover:bg-primary/90">
                            全ての単語を順番通りに開始 ({sectionData.totalCount}個)
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {sectionData.sections.map((sectionInfo) => {
                          const href = `${base}/section/${encodeURIComponent(sectionInfo.section)}`;
                          return (
                            <SectionLink 
                              key={sectionInfo.section} 
                              href={href} 
                              section={sectionInfo.section}
                              count={sectionInfo.count}
                            />
                          );
                        })}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-3" aria-live="polite">
                      総単語: {sectionData.totalCount} / セクション数: {sectionData.sections.length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ❷ ランダム */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">❷ ランダム</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionData.totalCount === 0 ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">このカテゴリーにはまだ単語がありません。</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href="/learning/categories"
                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                      >
                        カテゴリー選択に戻る
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      指定した件数を{category}からランダムに出題します。
                    </p>
                    
                    {/* クイック選択ボタン */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Link href={`${base}?random=1&count=10`}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          10問
                        </Button>
                      </Link>
                      <Link href={`${base}?random=1&count=20`}>
                        <Button size="sm" variant="outline">
                          20問
                        </Button>
                      </Link>
                      <Link href={`${base}?random=1&count=50`}>
                        <Button size="sm" variant="outline">
                          50問
                        </Button>
                      </Link>
                      {sectionData.totalCount >= 100 && (
                        <Link href={`${base}?random=1&count=100`}>
                          <Button size="sm" variant="outline">
                            100問
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* カスタム件数入力 */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div>
                          <label className="text-sm font-medium" htmlFor="random-count">カスタム件数</label>
                          <RandomInput 
                            wordsCount={sectionData.totalCount}
                            defaultValue={Math.min(10, sectionData.totalCount)}
                          />
                        </div>
                        <Link href={`${base}?random=1&count=10`}>
                          <Button aria-label="カスタム件数で開始" disabled={sectionData.totalCount === 0} size="sm">
                            開始 <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                      
                      {/* 制約情報 */}
                      <div className="text-xs text-muted-foreground">
                        設定可能範囲: 1 ～ {sectionData.totalCount}問
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
