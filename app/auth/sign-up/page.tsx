import { SignUpForm } from "@/components/sign-up-form";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/landing" className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            <BookOpen className="h-8 w-8" />
            <span className="text-2xl font-bold">Masa Flash</span>
          </Link>
          <p className="mt-2 text-amber-700 dark:text-amber-300">効率的な英語学習を始めましょう</p>
        </div>
        
        <SignUpForm />
        
        {/* フッター */}
        <div className="mt-8 text-center">
          <Link 
            href="/landing" 
            className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 underline underline-offset-4"
          >
            ← ランディングページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
