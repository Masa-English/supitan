'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationStore, useLearningSessionStore } from '@/lib/stores';

// リダイレクト処理を行うコンポーネント
function RedirectHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);
  const clearSession = useLearningSessionStore((s) => s.clearSession);
  
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== 'undefined') {
      // ダッシュボードに戻った時に学習セッションをクリア
      clearSession();
      
      // 保存されたリダイレクト先がある場合はそこに遷移
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath && window.location.pathname !== redirectPath) {
        console.log('ダッシュボードから保存されたリダイレクト先に遷移:', redirectPath);
        sessionStorage.removeItem('redirectAfterLogin');
        startNavigating();
        router.push(redirectPath);
      }
    }
  }, [router, startNavigating, clearSession]);

  return <>{children}</>;
}

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  return (
    <RedirectHandler>
      {children}
    </RedirectHandler>
  );
} 