'use client';

import dynamic from 'next/dynamic';
import { Zap } from 'lucide-react';
import Link from 'next/link';

// 動的インポートでバンドルサイズを最適化
const SignUpForm = dynamic(() => import('@/components/auth/sign-up-form').then(mod => ({ default: mod.SignUpForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false
});

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">スピ単</h1>
          <p className="text-muted-foreground">新しいアカウントを作成します</p>
        </div>

        <SignUpForm />

        {/* フッター */}
        <div className="text-center mt-8">
          <Link href="/landing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← ランディングページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
