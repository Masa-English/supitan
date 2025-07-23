'use client';

import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ログインページに戻る
            </Button>
          </Link>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
