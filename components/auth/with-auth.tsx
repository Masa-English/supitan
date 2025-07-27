'use client';

import { useAuth } from '@/lib/hooks/use-auth';

interface WithAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; fallback?: React.ReactNode } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { redirectTo = '/auth/login', fallback } = options;
    const { user, loading, error, isAuthenticated } = useAuth({ redirectTo });

    if (loading) {
      return fallback || (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">認証を確認中...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">認証エラー: {error}</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !user) {
      return null; // リダイレクト中
    }

    return <Component {...props} />;
  };
}

// 認証状態を子コンポーネントに渡すためのコンポーネント
export function WithAuth({ children, redirectTo = '/auth/login', fallback }: WithAuthProps) {
  const { user, loading, error, isAuthenticated } = useAuth({ redirectTo });

  if (loading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">認証を確認中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">認証エラー: {error}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // リダイレクト中
  }

  return <>{children}</>;
} 