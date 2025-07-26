'use client';

import dynamic from 'next/dynamic';

// 動的インポートでバンドルサイズを最適化
const UpdatePasswordForm = dynamic(() => import('@/components/auth/update-password-form').then(mod => ({ default: mod.UpdatePasswordForm })), {
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
      <UpdatePasswordForm />
    </div>
  );
}
