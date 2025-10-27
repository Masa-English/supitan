'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/api/supabase/client';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // ハッシュフラグメントからトークンを処理（PKCE flow）
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      
      // ハッシュフラグメントにaccess_tokenが含まれているか確認
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        console.log('🔐 [HomePage] Auth callback detected:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
        });

        if (accessToken) {
          try {
            const supabase = createClient();
            
            // トークンをセッションに設定
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              console.error('❌ [HomePage] Session setup failed:', error);
              // エラーページにリダイレクト
              router.push('/auth/error');
              return;
            }

            console.log('✅ [HomePage] Session established:', {
              user: data.user?.email,
              type,
            });

            // URLからハッシュフラグメントをクリア
            window.history.replaceState(null, '', window.location.pathname);

            // typeに応じて適切なページにリダイレクト
            if (type === 'recovery') {
              // パスワードリセットの場合
              console.log('🔄 [HomePage] Redirecting to password update page');
              router.push('/auth/update-password');
            } else {
              // その他の場合はダッシュボードへ
              console.log('🔄 [HomePage] Redirecting to dashboard');
              router.push('/dashboard');
            }
          } catch (err) {
            console.error('❌ [HomePage] Auth callback error:', err);
            router.push('/auth/error');
          }
        }
      }
    };

    handleAuthCallback();
  }, [router]);

  // 静的ランディングページ
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* シンプルなヘッダー */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">スピ単</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  ログイン
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ - 中央配置 */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          {/* メインタイトル */}
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-center gap-3">
              <Zap className="h-16 w-16 text-primary" />
            </div>
            <h2 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              英単語学習を
              <br />
              <span className="text-primary">もっと効率的に</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              フラッシュカードで覚えて、テストで確認。
              <br />
              あなたのペースで英単語をマスターしよう。
            </p>
          </div>

          {/* CTAボタン */}
          <div className="space-y-4">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                学習を始める
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              無料でアカウントを作成して今すぐ始められます
            </p>
          </div>
        </div>
      </main>

      {/* ミニマルなフッター */}
      <footer className="border-t border-border/50 py-6 bg-background/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 スピ単 - 効率的な英単語学習アプリ
          </p>
        </div>
      </footer>
    </div>
  );
}
