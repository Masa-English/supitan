"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, Lock, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { getRedirectUrl } from "@/lib/utils";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("パスワードが一致しません");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl("/dashboard"),
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">新規登録</CardTitle>
          <CardDescription className="text-muted-foreground">
            新しいアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
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
                <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  パスワード
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isMounted && showPassword ? "text" : "password"}
                    placeholder="6文字以上"
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
                      className="absolute right-0 top-2 h-full px-3 py-2 hover:bg-transparent touch-target"
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
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-foreground flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4" />
                  パスワード（確認）
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={isMounted && showRepeatPassword ? "text" : "password"}
                    placeholder="パスワードを再入力"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="border-border focus:border-primary focus:ring-primary pr-10 touch-target"
                  />
                  {isMounted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-2 h-full px-3 py-2 hover:bg-transparent touch-target"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    >
                      {showRepeatPassword ? (
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
                {isLoading ? "アカウント作成中..." : "アカウントを作成"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">すでにアカウントをお持ちですか？</span>{" "}
              <Link 
                href="/auth/login" 
                className="text-primary hover:text-primary/80 underline underline-offset-4 font-medium touch-target"
              >
                ログイン
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
