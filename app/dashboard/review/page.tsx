'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';

// 動的インポートでバンドルサイズを最適化
const Review = dynamic(() => import('@/components/learning/review').then(mod => ({ default: mod.Review })), {
  loading: () => (
    <div className="flex items-center justify-center h-48 sm:h-64">
      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function ReviewPage() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [, setUser] = useState<{ id: string; email?: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router, supabase.auth]);

  const handleComplete = () => {
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="h-screen flex flex-col">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full">
            <Review onComplete={handleComplete} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
        <Review
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
} 