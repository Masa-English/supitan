import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { redirectTo = '/auth/login', requireAuth = true } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // セキュリティ上の理由でgetUser()を使用
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          // refresh_token_not_foundエラーは一般的で、ログに出力しない
          if (userError.message?.includes('Refresh Token Not Found') || userError.code === 'refresh_token_not_found') {
            if (requireAuth) {
              // 現在のページURLを保存してからリダイレクト
              const currentPath = window.location.pathname;
              if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
                sessionStorage.setItem('redirectAfterLogin', currentPath);
              }
              router.push(redirectTo);
            }
            return;
          }
          
          // その他のエラーは開発環境でのみログ出力
          if (process.env.NODE_ENV === 'development') {
            console.error('認証エラー:', userError);
          }
          setError('認証に失敗しました');
          
          if (requireAuth) {
            // 現在のページURLを保存してからリダイレクト
            const currentPath = window.location.pathname;
            if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
            router.push(redirectTo);
          }
          return;
        }

        if (!user) {
          if (requireAuth) {
            // 現在のページURLを保存してからリダイレクト
            const currentPath = window.location.pathname;
            if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
            router.push(redirectTo);
          }
          return;
        }

        setUser(user);
        setIsAuthenticated(true);
      } catch (err) {
        // 開発環境でのみログ出力
        if (process.env.NODE_ENV === 'development') {
          console.error('認証チェックエラー:', err);
        }
        setError('認証に失敗しました');
        
        if (requireAuth) {
          // エラー時も現在のページURLを保存
          const currentPath = window.location.pathname;
          if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          router.push(redirectTo);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // イベントタイプに基づいて適切に処理
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          setUser(null);
          setIsAuthenticated(false);
          if (requireAuth) {
            router.push(redirectTo);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
          }
        }
        // その他のイベント（INITIAL_SESSION等）は無視
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth, redirectTo, requireAuth]);

  return {
    user,
    loading,
    error,
    isAuthenticated
  };
} 