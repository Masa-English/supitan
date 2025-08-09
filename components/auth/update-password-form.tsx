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
              router.push("/dashboard");
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
          <CardTitle className="text-2xl text-foreground">パスワードをリセット</CardTitle>
          <CardDescription className="text-muted-foreground">
            新しいパスワードを入力してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-foreground">新しいパスワード</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="新しいパスワード"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border focus:border-primary focus:ring-primary bg-background"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
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
