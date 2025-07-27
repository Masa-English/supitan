'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // getSession()を使用してセッションを確認
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('認証チェックエラー:', error);
          // エラー時も現在のページURLを保存
          const currentPath = window.location.pathname;
          if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          router.push('/landing');
          return;
        }

        if (!session || !session.user) {
          // 現在のページURLを保存してからリダイレクト
          const currentPath = window.location.pathname;
          if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
          router.push('/landing');
          return;
        }
        
        setUser(session.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('認証チェックエラー:', error);
        // エラー時も現在のページURLを保存
        const currentPath = window.location.pathname;
        if (currentPath !== '/landing' && currentPath !== '/auth/login' && currentPath !== '/auth/sign-up') {
          sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        router.push('/landing');
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
          router.push('/landing');
        } else if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

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