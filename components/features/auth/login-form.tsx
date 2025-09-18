"use client";

import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/api/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigationStore } from '@/lib/stores';

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "card" | "inline";
  showCard?: boolean;
}

export function LoginForm({
  className,
  variant = "card",
  showCard = true,
  ...props
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const startNavigating = useNavigationStore((s) => s.start);
  const stopNavigating = useNavigationStore((s) => s.stop);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [LoginForm] ログイン処理開始', {
      email,
      currentPath: window.location.pathname,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // ローディング状態とエラーをリセット
    setIsLoading(true);
    setError(null);

    // 認証処理の開始をUIに反映
    startNavigating();
    console.log('🔄 [LoginForm] ナビゲーション開始');

    // 新しいSupabaseクライアントインスタンスを取得
    const supabase = createBrowserClient();
    console.log('📡 [LoginForm] Supabaseクライアント作成完了');

    try {
      console.log('🔐 [LoginForm] Supabase認証リクエスト開始');
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('🔐 [LoginForm] Supabase認証レスポンス', {
        hasError: !!error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userId: data?.user?.id,
        error: error?.message
      });
      
      if (error) throw error;
      
      // ログイン成功時にキャッシュをクリア（古いセッションデータを削除）
      if (typeof window !== 'undefined') {
        // 古いリダイレクト情報以外のセッションストレージをクリア
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.clear();
        if (redirectPath) {
          sessionStorage.setItem('redirectAfterLogin', redirectPath);
        }
      }
      
      console.log('✅ [LoginForm] ログイン成功 - リダイレクト処理開始', {
        currentPath: window.location.pathname,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      // 少し待ってからリダイレクト（Supabaseの認証状態が確定するまで）
      setTimeout(() => {
        console.log('⏰ [LoginForm] リダイレクトタイマー実行', {
          currentPath: window.location.pathname,
          currentUrl: window.location.href,
          timestamp: new Date().toISOString()
        });
        
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        console.log('📍 [LoginForm] リダイレクト先確認', {
          savedRedirectPath: redirectPath,
          willRedirectTo: redirectPath && redirectPath !== '/' ? redirectPath : '/dashboard'
        });
        
        if (redirectPath && redirectPath !== '/') {
          console.log('🔄 [LoginForm] 保存されたリダイレクト先に遷移:', redirectPath);
          sessionStorage.removeItem('redirectAfterLogin');
          
          // router.replace() と window.location.href の両方を試行
          console.log('🔄 [LoginForm] router.replace() 実行中...');
          router.replace(redirectPath);
          
          // フォールバックとして window.location.href も使用
          setTimeout(() => {
            console.log('🔄 [LoginForm] フォールバック: window.location.href 使用');
            window.location.href = redirectPath;
          }, 1000);
          
        } else {
          console.log('🏠 [LoginForm] デフォルトのダッシュボードに遷移');
          
          // router.replace() と window.location.href の両方を試行
          console.log('🏠 [LoginForm] router.replace("/dashboard") 実行中...');
          router.replace("/dashboard");
          
          // フォールバックとして window.location.href も使用
          setTimeout(() => {
            console.log('🏠 [LoginForm] フォールバック: window.location.href 使用');
            window.location.href = "/dashboard";
          }, 1000);
        }
        
        // リダイレクト実行後の状態をログ
        setTimeout(() => {
          console.log('📍 [LoginForm] リダイレクト実行後の状態', {
            currentPath: window.location.pathname,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString()
          });
        }, 100);
        
      }, 500); // 500ms待機してSupabaseの状態変更を待つ
      
      // ナビゲーション状態は NavigationEvents で自動的に停止される
    } catch (error: unknown) {
      console.error('[LoginForm] ログインエラー:', error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
      // 遷移しないのでオーバーレイを閉じる
      stopNavigating();
    } finally {
      // 必ずローディング状態を解除
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleLogin}>
      <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border focus:border-primary focus:ring-primary touch-target"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    パスワード
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline touch-target"
                  >
                    パスワードを忘れましたか？
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={isMounted && showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-border focus:border-primary focus:ring-primary pr-10 touch-target"
                  />
                  {isMounted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent touch-target"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground touch-target py-3" 
          disabled={isLoading}
        >
          {isLoading ? "ログイン中..." : "学習を始める"}
        </Button>
      </div>
      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">アカウントをお持ちでないですか？</span>{" "}
        <Link
          href="/auth/sign-up"
          className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium touch-target"
        >
          新規登録
        </Link>
      </div>
    </form>
  );

  if (!showCard || variant === "inline") {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        {formContent}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">ログイン</CardTitle>
          <CardDescription className="text-muted-foreground">
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    </div>
  );
}