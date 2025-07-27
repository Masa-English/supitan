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
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-amber-200 dark:border-amber-700 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-amber-800 dark:text-amber-200">新規登録</CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            新しいアカウントを作成してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
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
                  className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-600 dark:focus:border-amber-400"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
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
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-600 dark:focus:border-amber-400 pr-10"
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
                        <EyeOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
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
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-600 dark:focus:border-amber-400 pr-10"
                  />
                  {isMounted && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "アカウント作成中..." : "アカウントを作成"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-amber-700 dark:text-amber-300">すでにアカウントをお持ちですか？</span>{" "}
              <Link 
                href="/auth/login" 
                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-4 font-medium"
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
