import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { RotateCcw, Wrench } from 'lucide-react';

const isDueForReview = (progress: UserProgress, now: Date) => {
  if (progress.next_review_at) {
    return new Date(progress.next_review_at) <= now;
  }

  if (!progress.last_studied) return false;

  const lastReview = new Date(progress.last_studied);
  const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
  const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1; // 1-5
  const reviewInterval = {
    1: 1,  // 1日
    2: 3,  // 3日
    3: 7,  // 1週間
    4: 14, // 2週間
    5: 30  // 1ヶ月
  }[masteryLevel] || 1;

  return daysSinceReview >= reviewInterval;
};

async function getAuthenticatedUser() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      redirect('/auth/login');
    }
    
    return user;
  } catch (error) {
    console.error('認証確認エラー:', error);
    redirect('/auth/login');
  }
}

export default async function ReviewPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Card className="border border-border bg-card/90">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Wrench className="w-5 h-5" />
              復習機能は改修中です
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              現在、復習機能の不具合対応を進めています。改修完了まで復習セッションの利用を停止しています。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/learning">
                <Button>学習を続ける</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">ダッシュボードに戻る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}