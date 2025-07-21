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
import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
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
          <CardTitle className="text-2xl text-amber-800 dark:text-amber-200">ログイン</CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    パスワード
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline-offset-4 hover:underline"
                  >
                    パスワードを忘れましたか？
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 dark:border-amber-600 dark:focus:border-amber-400"
                />
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
                {isLoading ? "ログイン中..." : "ログイン"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              <span className="text-amber-700 dark:text-amber-300">アカウントをお持ちでないですか？</span>{" "}
              <Link
                href="/auth/sign-up"
                className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-4 font-medium"
              >
                新規登録
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
