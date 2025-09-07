'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient as createBrowserClient } from '@/lib/api/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  // 安全なリダイレクト先かチェックする関数
  const isSafeRedirectPath = (path: string): boolean => {
    const safePaths = [
      '/dashboard',
      '/learning',
      '/review',
      '/learning/categories',
      '/search',
      '/favorites',
      '/statistics',
      '/profile',
      '/contact',
      '/faq'
    ];
    
    // 完全一致またはdashboard配下のパスを許可
    return safePaths.includes(path) || path.startsWith('/dashboard/');
  };

  // 現在のURLを保存する関数
  const saveCurrentPath = useCallback(() => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = currentSearch ? `${currentPath}${currentSearch}` : currentPath;
    
    // 安全なパスのみ保存
    if (isSafeRedirectPath(currentPath)) {
      sessionStorage.setItem('redirectAfterLogin', fullPath);
      console.log('リダイレクト先を保存:', fullPath);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // getUser() を使用: リフレッシュトークン欠如時は静かにスルーしリダイレクト
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
            console.error('認証チェックエラー:', error);
          }
          saveCurrentPath();
          router.push('/');
          return;
        }

        if (!user) {
          saveCurrentPath();
          router.push('/');
          return;
        }
        
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('認証チェックエラー:', error);
        saveCurrentPath();
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAuthenticated(false);
          router.push('/');
        } else if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth, saveCurrentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-4" />
          <p className="text-amber-700 dark:text-amber-300">認証を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // リダイレクト中
  }

  return (
    <div className="auth-context" data-user-email={user?.email || ''}>
      {children}
    </div>
  );
}