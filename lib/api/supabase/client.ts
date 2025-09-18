import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null;

export function createClient() {
  // 既存のインスタンスがあれば返す
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 新しいインスタンスを作成
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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