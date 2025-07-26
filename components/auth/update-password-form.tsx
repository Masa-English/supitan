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
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">パスワードをリセット</CardTitle>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            新しいパスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-amber-800 dark:text-amber-200">新しいパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="新しいパスワード"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-amber-200 dark:border-amber-700 focus:border-amber-500 dark:focus:border-amber-400 bg-white/50 dark:bg-amber-950/30"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "保存中..." : "新しいパスワードを保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
