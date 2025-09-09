"use client";

import { LoginForm } from "@/components/features/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* シンプルなヘッダー */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">スピ単</h1>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* ログインフォーム */}
          <LoginForm variant="card" showCard={true} />
        </div>
      </main>

      {/* ミニマルなフッター */}
      <footer className="border-t border-border/50 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2024 スピ単</p>
        </div>
      </footer>
    </div>
  );
}
