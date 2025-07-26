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
    <div className="w-full max-w-md">
      <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
              登録完了！
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              メールを確認してください
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-300">確認メールを送信しました</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                アカウントの登録が完了しました。<br />メールボックスを確認して、アカウントを有効化してからログインしてください。
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="mb-2">
                <Link href="/auth/login">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white">
                    ログインページに移動
                  </Button>
                </Link>
              </div>
              <div className="mb-2">
                <Link href="/landing">
                  <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/20">
                    ランディングページに戻る
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
