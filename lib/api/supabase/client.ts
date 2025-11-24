import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

export function createClient() {
  // 既存のインスタンスがあれば返す
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 環境変数の検証
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const errorMessage = `Supabase環境変数が設定されていません: ${missingVars.join(', ')}`;
    console.error('[SupabaseClient]', errorMessage);
    
    // 開発環境ではエラーを投げる
    if (process.env.NODE_ENV === 'development') {
      throw new Error(errorMessage);
    }
    
    // 本番環境では、ダミークライアントを返す（エラーを防ぐため）
    // ただし、実際のAPI呼び出しは失敗する
    console.warn('[SupabaseClient] 環境変数が設定されていないため、ダミークライアントを使用します');
  }

  // 新しいインスタンスを作成
  // @supabase/ssr の createBrowserClient は、ブラウザ環境では自動的にクッキーを使用します
  supabaseInstance = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );

  return supabaseInstance;
}

/**
 * Supabaseクライアントインスタンスを強制的にリセット
 * ログアウト時に使用
 */
export function resetSupabaseClient() {
  console.log('[SupabaseClient] クライアントインスタンスをリセット');
  supabaseInstance = null;
}