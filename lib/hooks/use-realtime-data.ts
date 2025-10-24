/**
 * Supabase Realtime を使用したリアルタイムデータ更新フック
 * データベースの変更を即座に反映
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { useDataStore } from '@/lib/stores/data-store-unified';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeDataOptions {
  /** 監視するテーブル */
  tables: string[];
  /** ユーザーID（ユーザー固有データの場合） */
  userId?: string;
  /** カテゴリー（カテゴリー固有データの場合） */
  category?: string;
  /** 自動リフレッシュを有効にするか */
  autoRefresh?: boolean;
  /** リフレッシュ間隔（ミリ秒） */
  refreshInterval?: number;
}

interface UseRealtimeDataReturn {
  /** 接続状態 */
  isConnected: boolean;
  /** 手動でデータをリフレッシュ */
  refresh: () => Promise<void>;
  /** 接続を切断 */
  disconnect: () => void;
  /** 再接続 */
  reconnect: () => void;
}

export function useRealtimeData(options: UseRealtimeDataOptions): UseRealtimeDataReturn {
  const {
    tables,
    userId,
    category,
    autoRefresh = true,
    refreshInterval = 300000, // 5分（30秒から5分に延長）
  } = options;

  const supabase = createBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const { fetchWords, fetchCategories: _fetchCategories, refreshData } = useDataStore();

  // データリフレッシュ関数
  const refresh = useCallback(async () => {
    try {
      if (category) {
        await fetchWords(category, true); // 強制リフレッシュ
      } else {
        await refreshData();
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  }, [category, fetchWords, refreshData]);

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

    const setupRealtimeSubscription = async () => {
      try {
        // 既存の接続をクリーンアップ
        disconnect();

        // チャンネルを作成
        const channelName = `realtime_${tables.join('_')}_${userId || 'public'}_${category || 'all'}`;
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
            filter = `category=eq.${category}`;
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
              console.log(`[Realtime] ${table} changed:`, payload);
              
              // データをリフレッシュ
              refresh();
            }
          );
        }

        // チャンネルにサブスクライブ
        const _subscription = channel.subscribe((status) => {
          console.log(`[Realtime] Channel status:`, status);
          isConnectedRef.current = status === 'SUBSCRIBED';
        });

        channelRef.current = channel;

        // 自動リフレッシュの設定
        if (autoRefresh && refreshInterval > 0) {
          refreshIntervalRef.current = setInterval(() => {
            refresh();
          }, refreshInterval);
        }

      } catch (error) {
        console.error('Failed to setup realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    // クリーンアップ
    return () => {
      disconnect();
    };
  }, [tables, userId, category, autoRefresh, refreshInterval, supabase, refresh, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    refresh,
    disconnect,
    reconnect,
  };
}

/**
 * 単語データのリアルタイム監視
 */
export function useRealtimeWords(category: string, userId?: string) {
  return useRealtimeData({
    tables: ['words', 'user_progress'],
    category,
    userId,
    autoRefresh: true,
    refreshInterval: 30000, // 30秒
  });
}

/**
 * カテゴリーデータのリアルタイム監視
 */
export function useRealtimeCategories() {
  return useRealtimeData({
    tables: ['categories', 'words'],
    autoRefresh: true,
    refreshInterval: 60000, // 1分
  });
}

/**
 * ユーザー進捗のリアルタイム監視
 */
export function useRealtimeUserProgress(userId: string) {
  return useRealtimeData({
    tables: ['user_progress', 'study_sessions'],
    userId,
    autoRefresh: true,
    refreshInterval: 15000, // 15秒
  });
}
