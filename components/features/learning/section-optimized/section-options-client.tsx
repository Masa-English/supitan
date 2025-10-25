/**
 * 最適化されたセクション選択クライアントコンポーネント
 * リアルタイム更新とパフォーマンス最適化を実装
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { redirect } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/navigation/badge';
import { ArrowRight, Layers, BookOpen, Brain, ArrowLeft, RefreshCw } from 'lucide-react';
import { SectionLink } from '@/app/(dashboard)/learning/[category_id]/options/section-link';
import { RandomInput } from '@/app/(dashboard)/learning/[category_id]/options/random-input';
import { useSmartRealtimeWords } from '@/lib/hooks/use-smart-realtime';
import { useDataStore } from '@/lib/stores/data-store-unified';
import { getCategoryNameById } from '@/lib/constants/categories';
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
  error?: string;
}

export function SectionOptionsClient({
  category,
  mode,
  initialData,
  error
}: SectionOptionsClientProps) {
  const [sectionData, setSectionData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [randomCount, setRandomCount] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const { refreshData: _storeRefreshData } = useDataStore();

  // スマートリアルタイム更新の設定
  const { isConnected, refresh: _realtimeRefresh, stats } = useSmartRealtimeWords(category);

  // データリフレッシュ関数
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // サーバーアクションを呼び出してデータを更新
      const response = await fetch(`/api/sections/${category}`, {
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

  // ランダム件数変更ハンドラー
  const handleRandomCountChange = useCallback((count: number) => {
    setRandomCount(count);
  }, []);

  // ランダム開始ハンドラー
  const handleRandomStart = useCallback(() => {
    // エラーメッセージをクリア
    setErrorMessage(null);
    
    if (randomCount > 0 && randomCount <= sectionData.totalCount) {
      // URLパラメータを正しくエンコード
      const params = new URLSearchParams({
        random: '1',
        count: randomCount.toString()
      });
      // 正しいパス: /learning/{category}/{mode} (quiz または flashcard)
      const url = `/learning/${category}/${mode}?${params.toString()}`;
      console.log('ランダム機能開始:', { url, randomCount, category, mode });
      
      // Next.jsのuseRouterを使用して適切に遷移
      router.push(url);
    } else {
      const errorMsg = `無効な件数です。1〜${sectionData.totalCount}の範囲で指定してください。`;
      console.error('ランダム機能: 無効な件数', { randomCount, totalCount: sectionData.totalCount });
      setErrorMessage(errorMsg);
    }
  }, [category, mode, randomCount, sectionData.totalCount, router]);

  const base = `/learning/${category}/${mode}`;

  // 初期ランダム件数の設定
  useEffect(() => {
    const validCount = Math.min(10, sectionData.totalCount);
    setRandomCount(validCount);
  }, [sectionData.totalCount]);

  // ランダム件数の検証と調整（無限ループを防ぐため、sectionData.totalCountの変更時のみ実行）
  useEffect(() => {
    if (randomCount > sectionData.totalCount) {
      setRandomCount(sectionData.totalCount);
    }
    if (randomCount < 1) {
      setRandomCount(1);
    }
  }, [sectionData.totalCount, randomCount]); // randomCountを依存配列に追加

  // クイック選択ボタンの選択状態を調整（無効化されたボタンが選択状態にならないように）
  // 無限ループを防ぐため、sectionData.totalCountの変更時のみ実行
  useEffect(() => {
    if (sectionData.totalCount < 10 && randomCount === 10) {
      setRandomCount(Math.min(10, sectionData.totalCount));
    }
    if (sectionData.totalCount < 20 && randomCount === 20) {
      setRandomCount(Math.min(20, sectionData.totalCount));
    }
    if (sectionData.totalCount < 50 && randomCount === 50) {
      setRandomCount(Math.min(50, sectionData.totalCount));
    }
    if (sectionData.totalCount < 100 && randomCount === 100) {
      setRandomCount(Math.min(100, sectionData.totalCount));
    }
  }, [sectionData.totalCount, randomCount]); // randomCountを依存配列に追加

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
              <span className="text-sm font-medium text-foreground">{getCategoryNameById(category) || category}</span>
              <span className="text-muted-foreground">·</span>
              <Badge variant="secondary" className="text-xs">
                {mode === 'quiz' ? <Brain className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />} モード
              </Badge>
              <span className="text-sm font-medium text-foreground">{mode}</span>
            </div>
            <Link href={`/learning/${category}/browse`}>
              <Button variant="outline" size="sm" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                単語一覧
              </Button>
            </Link>
          </div>
          
          {/* エラーメッセージ表示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error === 'no_words' && '単語が見つかりません'}
                    {error === 'no_params' && 'パラメータが不正です'}
                    {error === 'data_error' && 'データの取得に失敗しました'}
                    {error === 'auth_error' && '認証に失敗しました'}
                    {!['no_words', 'no_params', 'data_error', 'auth_error'].includes(error) && 'エラーが発生しました'}
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error === 'no_words' && 'このカテゴリーには単語が存在しないか、条件に合う単語がありません。'}
                    {error === 'no_params' && 'ランダムモードのパラメータが正しくありません。'}
                    {error === 'data_error' && 'データベースからの情報取得に失敗しました。'}
                    {error === 'auth_error' && 'ログインが必要です。'}
                    {!['no_words', 'no_params', 'data_error', 'auth_error'].includes(error) && '予期しないエラーが発生しました。'}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                        href={`/learning/${category}/browse`}
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
                          const href = `${base}/section/${sectionInfo.section}`;
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
                    {/* エラーメッセージの表示 */}
                    {errorMessage && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{errorMessage}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      指定した件数を{getCategoryNameById(category) || category}からランダムに出題します。
                    </p>

                    {/* 現在の選択数表示 */}
                    <div className="mb-4 p-3 bg-muted/50 rounded-md border border-border">
                      <div className="text-sm">
                        <span className="font-medium">現在の選択: </span>
                        <span className="text-primary font-bold text-lg">{randomCount}問</span>
                        <span className="text-muted-foreground ml-2">
                          ({Math.round((randomCount / sectionData.totalCount) * 100)}%単語)
                        </span>
                        {randomCount >= sectionData.totalCount && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            全単語出題
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* クイック選択ボタン */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        size="sm"
                        className={`${randomCount === 10 ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
                        onClick={() => handleRandomCountChange(10)}
                      >
                        10問
                      </Button>
                      <Button
                        size="sm"
                        variant={randomCount === 20 ? "default" : "outline"}
                        onClick={() => handleRandomCountChange(20)}
                      >
                        20問
                      </Button>
                      <Button
                        size="sm"
                        variant={randomCount === 50 ? "default" : "outline"}
                        onClick={() => handleRandomCountChange(50)}
                      >
                        50問
                      </Button>
                      {sectionData.totalCount >= 100 && (
                        <Button
                          size="sm"
                          variant={randomCount === 100 ? "default" : "outline"}
                          onClick={() => handleRandomCountChange(100)}
                        >
                          100問
                        </Button>
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
                            value={randomCount}
                            onChange={setRandomCount}
                          />
                        </div>
                        <Button
                          aria-label="カスタム件数で開始"
                          size="sm"
                          onClick={() => handleRandomStart()}
                        >
                          開始 <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
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
