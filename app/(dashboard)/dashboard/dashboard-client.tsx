'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigationStore, useLearningSessionStore } from '@/lib/stores';

interface DashboardClientProps {
  children: React.ReactNode;
}

export default function DashboardClient({ children }: DashboardClientProps) {
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);
  const clearSession = useLearningSessionStore((s) => s.clearSession);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
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
  }, [isClient, router, startNavigating, clearSession]);

  // クライアントサイドでのみレンダリング
  if (!isClient) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return <>{children}</>;
} 