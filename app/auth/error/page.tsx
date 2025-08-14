import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            エラーが発生しました
          </h1>
          <p className="text-muted-foreground">
            申し訳ございません。問題が発生しました。
          </p>
        </div>

        {/* エラーカード */}
        <Card className="border-border bg-card">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl text-destructive">認証エラー</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-lg">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  エラーコード: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  詳細不明なエラーが発生しました。
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  ログインページに戻る
                </Button>
              </Link>
              <Link href="/landing">
                <Button variant="outline" className="w-full border-border">
                  ランディングページに戻る
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-8">
          <Link 
            href="/landing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← ランディングページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
