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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createBrowserClient();
    setIsLoading(true);
    setError(null);

    try {
      // パスワードの一致確認
      if (password !== confirmPassword) {
        throw new Error("パスワードが一致しません");
      }

      // パスワードの長さチェック
      if (password.length < 6) {
        throw new Error("パスワードは6文字以上である必要があります");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      // 成功メッセージを表示
      setSuccess(true);
      
      // 2秒後にダッシュボードにリダイレクト
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">パスワードを更新しました</CardTitle>
            <CardDescription className="text-muted-foreground">
              新しいパスワードでログインできます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ パスワードの更新が完了しました。<br />
                  ダッシュボードに移動します...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">パスワードをリセット</CardTitle>
            <CardDescription className="text-muted-foreground">
              新しいパスワードを入力してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-foreground">新しいパスワード</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isMounted && showPassword ? "text" : "password"}
                      placeholder="6文字以上のパスワード"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-border focus:border-primary focus:ring-primary bg-background pr-10"
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
                  <p className="text-xs text-muted-foreground">6文字以上で入力してください</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">パスワードの確認</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={isMounted && showConfirmPassword ? "text" : "password"}
                      placeholder="パスワードを再入力"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-border focus:border-primary focus:ring-primary bg-background pr-10"
                    />
                    {isMounted && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
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
      )}
    </div>
  );
}