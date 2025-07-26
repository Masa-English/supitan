'use client';

import dynamic from 'next/dynamic';

// 動的インポートでバンドルサイズを最適化
const SignUpForm = dynamic(() => import('@/components/auth/sign-up-form').then(mod => ({ default: mod.SignUpForm })), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>
  ),
  ssr: false
});

export default function Page() {
  return (
    <div className="w-full">
      <SignUpForm />
    </div>
  );
}
