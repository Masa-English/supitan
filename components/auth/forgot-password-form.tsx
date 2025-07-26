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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">メールを確認してください</CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">パスワードリセットの手順をお送りしました</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              メールアドレスとパスワードで登録されている場合、パスワードリセット用のメールが送信されます。
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">パスワードをリセット</CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              メールアドレスを入力すると、パスワードリセット用のリンクをお送りします
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-amber-800 dark:text-amber-200">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-amber-200 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-400 bg-white/50 dark:bg-amber-950/30"
                  />
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                <Button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "送信中..." : "リセットメールを送信"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                <span className="text-amber-700 dark:text-amber-300">アカウントをお持ちですか？ </span>
                <Link
                  href="/auth/login"
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-4"
                >
                  ログイン
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
