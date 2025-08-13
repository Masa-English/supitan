import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Search
} from 'lucide-react';
import Link from 'next/link';

// サーバーサイドでの認証確認
async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('認証エラー:', error);
      redirect('/landing');
    }
    
    if (!user) {
      redirect('/landing');
    }
    
    return user;
  } catch (error) {
    console.error('認証確認エラー:', error);
    redirect('/landing');
  }
  
  // この行は到達不可能だが、TypeScriptの型チェックのために必要
  throw new Error('認証に失敗しました');
}

// メインアクションカード
function MainActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color, 
  bgColor, 
  stats 
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  stats?: string;
}) {
  return (
    <Link href={href} prefetch className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            {stats && (
              <span className="text-sm font-medium text-muted-foreground">
                {stats}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DashboardPage() {
  try {
    const user = await getAuthenticatedUser();

    return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            ようこそ、{user.email?.split('@')[0]}さん
          </h1>
          <p className="text-muted-foreground">
            スピ単で効率的に英語を学習しましょう
          </p>
        </div>

        {/* メインアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MainActionCard
            title="学習開始"
            description="新しい単語を学習して語彙力を向上させましょう"
            icon={Play}
            href="/dashboard/start-learning"
            color="text-primary"
            bgColor="bg-primary/10"
            stats="新規"
          />
          <MainActionCard
            title="復習"
            description="間隔反復で記憶を定着させましょう"
            icon={RotateCcw}
            href="/dashboard/review"
            color="text-orange-600"
            bgColor="bg-orange-100"
            stats="0個"
          />
          <MainActionCard
            title="単語検索"
            description="特定の単語を検索して学習しましょう"
            icon={Search}
            href="/dashboard/search"
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
        </div>

        {/* TODO: 追加機能（現在は非表示）
        - サイドメニュー
        - お気に入り機能
        - 統計詳細
        - 単語一覧
        - 統計カード（学習単語数、復習待ち、正答率、学習日数）
        */}

        {/* 空の状態 */}
        <div className="text-center py-12">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            学習を始めましょう
          </h3>
          <p className="text-muted-foreground mb-6">
            まだ学習データがありません。学習を開始して進捗を確認しましょう。
          </p>
          <Link href="/dashboard/start-learning">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Play className="w-4 h-4 mr-2" />
              学習を始める
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('ダッシュボードページエラー:', error);
    redirect('/landing');
  }
}
