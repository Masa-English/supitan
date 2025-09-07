"use client";

import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/api/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

interface InlineLoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  showTitle?: boolean;
  compact?: boolean;
}

export function InlineLoginForm({
  className,
  showTitle = true,
  compact = false,
  ...props
}: InlineLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createBrowserClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // 保存されたリダイレクト先がある場合はそこに遷移、なければダッシュボード
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
      {showTitle && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">ログイン</h2>
          <p className="text-muted-foreground">
            アカウントにログインして学習を始めましょう
          </p>
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
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
            className="border-border focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              パスワード
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
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
              className="border-border focus:border-primary focus:ring-primary pr-10"
            />
            {isMounted && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
          className={cn(
            "w-full bg-primary hover:bg-primary/90 text-primary-foreground",
            compact ? "py-2" : "py-3"
          )}
          disabled={isLoading}
        >
          {isLoading ? "ログイン中..." : "学習を始める"}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-muted-foreground">アカウントをお持ちでないですか？</span>{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
          >
            新規登録
          </Link>
        </div>
      </form>
    </div>
  );
}