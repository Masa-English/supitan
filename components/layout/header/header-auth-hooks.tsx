/**
 * ヘッダー用の認証フック
 * 認証状態の管理とサインアウト処理
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { signOut } from '@/app/(auth)/auth/actions';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UseHeaderAuthReturn {
  currentUser: SupabaseUser | null;
  isClient: boolean;
  handleSignOut: () => Promise<void>;
}

export function useHeaderAuth(): UseHeaderAuthReturn {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [isClient, setIsClient] = useState(false);
  const supabase = createBrowserClient();

  // ハイドレーションエラーを防ぐため、クライアントサイドでのみ実行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 認証状態の監視
  useEffect((): (() => void) | undefined => {
    // クライアントサイドでのみ実行
    if (!isClient) return;

    const getCurrentUser = async () => {
      try {
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
        } else if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ユーザー取得エラー:', error);
        }
      }
    };

    getCurrentUser();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [isClient, supabase.auth]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // redirect('/landing') はサーバーアクション側で発火
    } catch (error) {
      // Next.js は redirect 時に特殊なエラーを投げるため無視する
      const digest = (error as { digest?: string } | undefined)?.digest || '';
      const message = String((error as Error | undefined)?.message || '');
      if (digest.startsWith('NEXT_REDIRECT') || message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error('ログアウトエラー:', error);
    }
  };

  return {
    currentUser,
    isClient,
    handleSignOut,
  };
}
