import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { User } from '@supabase/supabase-js';

export interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { redirectTo = '/login', requireAuth = true } = options;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // パブリックページの場合は認証チェックをスキップ
        const publicPaths = [
          '/',
          '/landing',
          '/contact',
          '/login',
          '/auth/login',
          '/auth/sign-up',
          '/auth/forgot-password',
          '/auth/sign-up-success',
          '/auth/update-password',
          '/auth/confirm',
          '/auth/error',
          '/faq'
        ];

        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));

        // パブリックページで認証が不要な場合は早期リターン
        if (isPublicPath && !requireAuth) {
          setLoading(false);
          return;
        }

        // セッション状態の維持を強化 - getSession()とgetUser()の組み合わせ
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // 認証が不要なページではエラーを無視
          if (!requireAuth) {
            setLoading(false);
            return;
          }
          throw sessionError;
        }

        // セッションが存在する場合、ユーザー情報を取得
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          return;
        }

        // セッションがない場合、getUser()で最終確認
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          // 認証が不要なページではエラーを無視
          if (!requireAuth) {
            setLoading(false);
            return;
          }
          
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
          
          // JSONパースエラーの場合、環境変数の問題を疑う
          if (userError.message?.includes('not valid JSON') || userError.message?.includes('Unexpected token')) {
            console.error('[useAuth] JSONパースエラーが発生しました。Supabase環境変数が正しく設定されているか確認してください。', {
              hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
              hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              error: userError
            });
            setError('認証サーバーへの接続に失敗しました。環境設定を確認してください。');
          } else {
            // その他のエラーは開発環境でのみログ出力
            if (process.env.NODE_ENV === 'development') {
              console.error('認証エラー:', userError);
            }
            setError('認証に失敗しました');
          }
          
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
        // 認証が不要なページではエラーを無視
        if (!requireAuth) {
          setLoading(false);
          return;
        }
        
        // JSONパースエラーを特別に処理
        if (err instanceof SyntaxError && err.message.includes('not valid JSON')) {
          console.error('[useAuth] JSONパースエラー:', {
            message: err.message,
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          });
          setError('認証サーバーへの接続に失敗しました。環境設定を確認してください。');
        } else {
          // 開発環境でのみログ出力
          if (process.env.NODE_ENV === 'development') {
            console.error('認証チェックエラー:', err);
          }
          setError('認証に失敗しました');
        }
        
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

    // 認証状態の変更を監視（セッション状態維持の強化）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] 認証状態変更:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        // イベントタイプに基づいて適切に処理
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          console.log('[useAuth] ログアウト状態を検出');
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
          
          // ストレージを再度クリア（念のため）
          if (typeof window !== 'undefined') {
            sessionStorage.clear();
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('sb-')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
          
          if (requireAuth) {
            const currentPath = window.location.pathname;
            // ログインページやルートページ以外にいる場合のみリダイレクト
            if (!currentPath.startsWith('/login') && !currentPath.startsWith('/auth') && currentPath !== '/') {
              router.push(redirectTo);
            }
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log('[useAuth] ログイン状態を検出');
            setUser(session.user);
            setIsAuthenticated(true);
            setError(null);
            
            // ルートページにいる認証済みユーザーを自動リダイレクト（SIGNED_INイベント時のみ）
            const currentPath = window.location.pathname;
            if (currentPath === '/' && event === 'SIGNED_IN') {
              // 少し待ってからリダイレクト（認証状態が完全に確定するまで）
              setTimeout(() => {
                const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                if (savedRedirect && savedRedirect !== '/') {
                  sessionStorage.removeItem('redirectAfterLogin');
                  router.replace(savedRedirect);
                } else {
                  router.replace('/dashboard');
                }
              }, 100);
            }
          }
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // 初期セッション時の処理を追加
          console.log('[useAuth] 初期セッション検出');
          setUser(session.user);
          setIsAuthenticated(true);
          setError(null);
        } else if (event === 'INITIAL_SESSION' && !session) {
          // 初期セッションがない場合
          console.log('[useAuth] 初期セッションなし');
          setUser(null);
          setIsAuthenticated(false);
        }
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