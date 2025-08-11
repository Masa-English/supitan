import { login } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            スピ単
          </h1>
          <p className="text-muted-foreground">
            効率的な英語学習を始めましょう
          </p>
        </div>

        {/* ログインフォーム */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">ログイン</CardTitle>
            <CardDescription className="text-center">
              アカウントにログインして学習を続けましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="パスワードを入力"
                  required
                  className="border-border"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  formAction={login}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  ログイン
                </Button>
              </div>
            </form>
            
            <div className="text-center space-y-2">
              <Link 
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                パスワードを忘れた方
              </Link>
              <div className="text-xs text-muted-foreground">
                アカウントをお持ちでない方は
                <Link href="/auth/sign-up" className="text-primary hover:underline ml-1">
                  新規登録
                </Link>
                してください
              </div>
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
