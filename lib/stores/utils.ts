'use client';

import { useUserStore } from './user-store';
import { useDataStore } from './data-store';
import { useAudioStore } from './audio-store';
import { useSettingsStore } from './settings-store';

/**
 * アプリケーション全体のストアを初期化するユーティリティ
 */
export async function initializeStores() {
  try {
    // 並行して初期化を実行
    await Promise.all([
      useUserStore.getState().initialize(),
      useDataStore.getState().loadWords(),
      useDataStore.getState().loadCategories(),
      useAudioStore.getState().initializeAudio(),
    ]);

    console.log('✅ すべてのストアが正常に初期化されました');
  } catch (error) {
    console.error('❌ ストア初期化エラー:', error);
    throw error;
  }
}

/**
 * ストアの状態をリセットするユーティリティ
 */
export function resetStores() {
  useUserStore.getState().clearUserData();
  useDataStore.getState().clearData();
  useAudioStore.getState().cleanup();
  
  console.log('🔄 すべてのストアがリセットされました');
}

/**
 * ストアの状態をデバッグ用に出力するユーティリティ
 */
export function debugStores() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 ストア状態デバッグ');
    console.log('User Store:', useUserStore.getState());
    console.log('Data Store:', useDataStore.getState());
    console.log('Audio Store:', useAudioStore.getState());
    console.log('Settings Store:', useSettingsStore.getState());
    console.groupEnd();
  }
}
