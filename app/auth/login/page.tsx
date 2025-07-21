import { LoginForm } from '@/components/login-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// 静的生成の設定 - 認証ページは頻繁に変更されないため長めのキャッシュ
export const revalidate = 86400; // 24時間ごとに再生成

// メタデータ最適化
export async function generateMetadata() {
  return {
    title: 'ログイン - Masa Flash',
    description: 'Masa Flashにログインして英語学習を続けましょう。',
    robots: {
      index: true,
      follow: true,
    },
  };
}

// 静的パラメータ生成
export async function generateStaticParams() {
  return [{}];
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link href="/landing">
            <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ランディングページに戻る
            </Button>
          </Link>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-amber-200 dark:border-amber-700 shadow-xl">
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
