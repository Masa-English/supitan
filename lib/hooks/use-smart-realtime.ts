/**
 * スマートリアルタイムフック
 * 過剰な更新を防ぎ、必要な時のみデータを更新
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { useDataStore } from '@/lib/stores/data-store-unified';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseSmartRealtimeOptions {
  /** 監視するテーブル */
  tables: string[];
  /** ユーザーID（ユーザー固有データの場合） */
  userId?: string;
  /** カテゴリー（カテゴリー固有データの場合） */
  category?: string;
  /** 更新間隔（ミリ秒）- 0の場合はリアルタイムのみ */
  refreshInterval?: number;
  /** バッチ更新の間隔（ミリ秒） */
  batchInterval?: number;
  /** 最大バッチサイズ */
  maxBatchSize?: number;
}

interface UseSmartRealtimeReturn {
  /** 接続状態 */
  isConnected: boolean;
  /** 手動でデータをリフレッシュ */
  refresh: () => Promise<void>;
  /** 接続を切断 */
  disconnect: () => void;
  /** 再接続 */
  reconnect: () => void;
  /** 統計情報 */
  stats: {
    totalUpdates: number;
    batchedUpdates: number;
    lastUpdate: Date | null;
  };
}

export function useSmartRealtime(options: UseSmartRealtimeOptions): UseSmartRealtimeReturn {
  const {
    tables,
    userId,
    category,
    refreshInterval = 0, // デフォルトはリアルタイムのみ
    batchInterval = 2000, // 2秒間隔でバッチ処理（1秒から2秒に延長）
    maxBatchSize = 10,
  } = options;

  const supabase = createBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const updateQueueRef = useRef<Set<string>>(new Set());
  const statsRef = useRef({
    totalUpdates: 0,
    batchedUpdates: 0,
    lastUpdate: null as Date | null,
  });

  const { fetchWords, fetchCategories, fetchUserProgress, fetchReviewWords } = useDataStore();

  // バッチ更新の実行
  const processBatchUpdates = useCallback(async () => {
    const updates = Array.from(updateQueueRef.current);
    if (updates.length === 0) return;

    console.log(`[SmartRealtime] Processing ${updates.length} batched updates:`, updates);
    
    try {
      const promises: Promise<void>[] = [];

      // 更新タイプに基づいて適切な関数を呼び出し
      updates.forEach(updateType => {
        switch (updateType) {
          case 'words':
            if (category) {
              promises.push(fetchWords(category, true));
            }
            break;
          case 'categories':
            promises.push(fetchCategories(true));
            break;
          case 'user_progress':
            if (userId) {
              promises.push(fetchUserProgress(userId, true));
            }
            break;
          case 'review_words':
            if (userId) {
              promises.push(fetchReviewWords(userId, true));
            }
            break;
        }
      });

      await Promise.all(promises);
      
      // 統計更新
      statsRef.current.batchedUpdates += updates.length;
      statsRef.current.lastUpdate = new Date();
      
      // キューをクリア
      updateQueueRef.current.clear();
      
    } catch (error) {
      console.error('Failed to process batch updates:', error);
    }
  }, [category, userId, fetchWords, fetchCategories, fetchUserProgress, fetchReviewWords]);

  // 更新をキューに追加
  const queueUpdate = useCallback((updateType: string) => {
    updateQueueRef.current.add(updateType);
    statsRef.current.totalUpdates++;

    // バッチタイムアウトを設定（既存のタイムアウトをクリア）
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // 最大バッチサイズに達した場合は即座に処理
    if (updateQueueRef.current.size >= maxBatchSize) {
      processBatchUpdates();
      return;
    }

    // バッチ間隔後に処理
    batchTimeoutRef.current = setTimeout(() => {
      processBatchUpdates();
    }, batchInterval);
  }, [processBatchUpdates, batchInterval, maxBatchSize]);

  // データリフレッシュ関数
  const refresh = useCallback(async () => {
    try {
      const promises: Promise<void>[] = [];

      if (category) {
        promises.push(fetchWords(category, true));
      }
      promises.push(fetchCategories(true));
      
      if (userId) {
        promises.push(fetchUserProgress(userId, true));
        promises.push(fetchReviewWords(userId, true));
      }

      await Promise.all(promises);
      statsRef.current.lastUpdate = new Date();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [category, userId, fetchWords, fetchCategories, fetchUserProgress, fetchReviewWords]);

  // 接続を切断
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    isConnectedRef.current = false;
  }, [supabase]);

  // 再接続
  const reconnect = useCallback(() => {
    disconnect();
    // 少し遅延してから再接続
    setTimeout(() => {
      // useEffect が再実行される
    }, 1000);
  }, [disconnect]);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') return;

    const setupSmartRealtimeSubscription = async () => {
      try {
        // 既存の接続をクリーンアップ
        disconnect();

        // チャンネルを作成
        const channelName = `smart_realtime_${tables.join('_')}_${userId || 'public'}_${category || 'all'}`;
        const channel = supabase.channel(channelName);

        // 各テーブルの変更を監視
        for (const table of tables) {
          let filter = '';
          
          // ユーザー固有データの場合
          if (userId && (table === 'user_progress' || table === 'study_sessions')) {
            filter = `user_id=eq.${userId}`;
          }
          
          // カテゴリー固有データの場合
          if (category && table === 'words') {
            filter = `category=eq.${encodeURIComponent(category)}`;
          }

          channel.on(
            'postgres_changes',
            {
              event: '*', // INSERT, UPDATE, DELETE
              schema: 'public',
              table,
              filter,
            },
            (payload) => {
              console.log(`[SmartRealtime] ${table} changed:`, payload);
              
              // 更新をキューに追加（バッチ処理）
              queueUpdate(table);
            }
          );
        }

        // チャンネルにサブスクライブ
        const _subscription = channel.subscribe((status) => {
          console.log(`[SmartRealtime] Channel status:`, status);
          isConnectedRef.current = status === 'SUBSCRIBED';
        });

        channelRef.current = channel;

        // 定期更新の設定（オプション）
        if (refreshInterval > 0) {
          refreshIntervalRef.current = setInterval(() => {
            refresh();
          }, refreshInterval);
        }

      } catch (error) {
        console.error('Failed to setup smart realtime subscription:', error);
      }
    };

    setupSmartRealtimeSubscription();

    // クリーンアップ
    return () => {
      disconnect();
    };
  }, [tables, userId, category, refreshInterval, supabase, refresh, disconnect, queueUpdate]);

  return {
    isConnected: isConnectedRef.current,
    refresh,
    disconnect,
    reconnect,
    stats: statsRef.current,
  };
}

/**
 * 単語データのスマートリアルタイム監視
 */
export function useSmartRealtimeWords(category: string, userId?: string) {
  return useSmartRealtime({
    tables: ['words', 'user_progress'],
    category,
    userId,
    refreshInterval: 0, // リアルタイムのみ
    batchInterval: 2000, // 2秒間隔でバッチ処理
    maxBatchSize: 5,
  });
}

/**
 * カテゴリーデータのスマートリアルタイム監視
 */
export function useSmartRealtimeCategories() {
  return useSmartRealtime({
    tables: ['categories', 'words'],
    refreshInterval: 300000, // 5分間隔で定期更新
    batchInterval: 5000, // 5秒間隔でバッチ処理
    maxBatchSize: 3,
  });
}

/**
 * ユーザー進捗のスマートリアルタイム監視
 */
export function useSmartRealtimeUserProgress(userId: string) {
  return useSmartRealtime({
    tables: ['user_progress', 'study_sessions'],
    userId,
    refreshInterval: 0, // リアルタイムのみ
    batchInterval: 1000, // 1秒間隔でバッチ処理
    maxBatchSize: 10,
  });
}
