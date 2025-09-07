import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            登録完了！
          </h1>
          <p className="text-muted-foreground">
            メールを確認してください
          </p>
        </div>

        {/* メインカード */}
        <Card className="border-border bg-card">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">アカウント登録完了</CardTitle>
            <CardDescription>
              確認メールを送信いたしました
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">確認メールを送信しました</span>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              アカウントの登録が完了しました。<br />
              メールボックスを確認して、アカウントを有効化してからログインしてください。
            </p>
            
            <Link href="/auth/login">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                ログインページに移動
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
