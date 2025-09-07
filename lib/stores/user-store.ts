'use client';

import { create } from 'zustand';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { DatabaseService } from '@/lib/api/database';
import type { User, UserProfile, UserProgress, AppStats } from '@/lib/types';

interface UserState {
  // 認証状態
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // プロフィール情報
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  
  // 学習進捗
  userProgress: Record<string, UserProgress>;
  progressLoading: boolean;
  progressError: string | null;
  
  // 統計情報
  stats: AppStats | null;
  statsLoading: boolean;
  statsError: string | null;
  
  // アクション
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshStats: () => Promise<void>;
  updateWordProgress: (wordId: string, progress: Partial<UserProgress>) => Promise<void>;
  toggleFavorite: (wordId: string) => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // 初期状態
  user: null,
  loading: true,
  error: null,
  profile: null,
  profileLoading: false,
  profileError: null,
  userProgress: {},
  progressLoading: false,
  progressError: null,
  stats: null,
  statsLoading: false,
  statsError: null,

  // 初期化
  initialize: async () => {
    const supabase = createBrowserClient();
    
    try {
      set({ loading: true, error: null });
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        const message = String((error as { message?: string }).message || '');
        const code = String((error as { code?: string }).code || '');
        const isExpected =
          message.includes('Refresh Token Not Found') ||
          message.includes('Invalid Refresh Token') ||
          message.includes('Auth session missing') ||
          code === 'refresh_token_not_found';
        
        if (!isExpected && process.env.NODE_ENV === 'development') {
          console.error('認証エラー:', error);
        }
        set({ user: null, loading: false });
        return;
      }

      if (user) {
        set({ user, loading: false });
        // ユーザー情報が取得できたら、プロフィールと進捗を読み込み
        await Promise.all([
          get().refreshProfile(),
          get().refreshProgress(),
          get().refreshStats()
        ]);
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('ユーザー初期化エラー:', error);
      set({ 
        error: error instanceof Error ? error.message : '認証に失敗しました',
        loading: false 
      });
    }
  },

  // サインアウト
  signOut: async () => {
    const supabase = createBrowserClient();
    try {
      await supabase.auth.signOut();
      get().clearUserData();
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  },

  // プロフィール更新
  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) return;

    try {
      set({ profileLoading: true, profileError: null });
      const db = new DatabaseService();
      await db.updateUserProfile(user.id, updates);
      
      // プロフィールを再取得
      await get().refreshProfile();
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      set({ 
        profileError: error instanceof Error ? error.message : 'プロフィールの更新に失敗しました',
        profileLoading: false 
      });
    }
  },

  // プロフィール再取得
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      set({ profileLoading: true, profileError: null });
      const db = new DatabaseService();
      const profile = await db.getUserProfile(user.id);
      set({ profile, profileLoading: false });
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      set({ 
        profileError: error instanceof Error ? error.message : 'プロフィールの取得に失敗しました',
        profileLoading: false 
      });
    }
  },

  // 進捗再取得
  refreshProgress: async () => {
    const { user } = get();
    if (!user) return;

    try {
      set({ progressLoading: true, progressError: null });
      const db = new DatabaseService();
      const progressData = await db.getUserProgress(user.id);
      
      const progressMap: Record<string, UserProgress> = {};
      progressData.forEach((progress: UserProgress) => {
        if (progress.word_id) {
          progressMap[progress.word_id] = progress;
        }
      });
      
      set({ userProgress: progressMap, progressLoading: false });
    } catch (error) {
      console.error('進捗取得エラー:', error);
      set({ 
        progressError: error instanceof Error ? error.message : '進捗の取得に失敗しました',
        progressLoading: false 
      });
    }
  },

  // 統計再取得
  refreshStats: async () => {
    const { user } = get();
    if (!user) return;

    try {
      set({ statsLoading: true, statsError: null });
      const db = new DatabaseService();
      const stats = await db.getAppStats(user.id);
      set({ stats, statsLoading: false });
    } catch (error) {
      console.error('統計取得エラー:', error);
      set({ 
        statsError: error instanceof Error ? error.message : '統計の取得に失敗しました',
        statsLoading: false 
      });
    }
  },

  // 単語進捗更新
  updateWordProgress: async (wordId: string, progress: Partial<UserProgress>) => {
    const { user } = get();
    if (!user) return;

    try {
      const db = new DatabaseService();
      await db.updateProgress(user.id, wordId, progress);
      
      // 進捗を再取得
      await get().refreshProgress();
      // 統計も更新
      await get().refreshStats();
    } catch (error) {
      console.error('進捗更新エラー:', error);
    }
  },

  // お気に入り切り替え
  toggleFavorite: async (wordId: string) => {
    const { user, userProgress } = get();
    if (!user) return;

    try {
      const currentProgress = userProgress[wordId];
      const newFavoriteState = !(currentProgress?.is_favorite || false);
      
      await get().updateWordProgress(wordId, { is_favorite: newFavoriteState });
    } catch (error) {
      console.error('お気に入り切り替えエラー:', error);
    }
  },

  // ユーザーデータクリア
  clearUserData: () => {
    set({
      user: null,
      profile: null,
      userProgress: {},
      stats: null,
      loading: false,
      error: null,
      profileLoading: false,
      profileError: null,
      progressLoading: false,
      progressError: null,
      statsLoading: false,
      statsError: null,
    });
  },
}));
