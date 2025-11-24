/**
 * 認証状態の一元管理プロバイダー
 * 重複した認証チェックを防ぎ、API消費を削減
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    // 初期認証状態の確認
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          const message = String(error.message || '');
          const code = String(error.code || '');
          const isExpected =
            message.includes('Refresh Token Not Found') ||
            message.includes('Invalid Refresh Token') ||
            message.includes('Auth session missing') ||
            code === 'refresh_token_not_found';
          
          // JSONパースエラーの場合、環境変数の問題を疑う
          if (message.includes('not valid JSON') || message.includes('Unexpected token')) {
            console.error('[AuthProvider] JSONパースエラーが発生しました。Supabase環境変数が正しく設定されているか確認してください。', {
              hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              error: error
            });
            setError('認証サーバーへの接続に失敗しました。環境設定を確認してください。');
          } else if (!isExpected) {
            if (process.env.NODE_ENV === 'development') {
              console.error('認証エラー:', error);
            }
            setError(error.message);
          }
        } else {
          setUser(user);
        }
      } catch (err) {
        // JSONパースエラーを特別に処理
        if (err instanceof SyntaxError && err.message.includes('not valid JSON')) {
          console.error('[AuthProvider] JSONパースエラー:', {
            message: err.message,
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          });
          setError('認証サーバーへの接続に失敗しました。環境設定を確認してください。');
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('認証初期化エラー:', err);
          }
          setError(err instanceof Error ? err.message : '認証エラーが発生しました');
        }
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
        setError(null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
