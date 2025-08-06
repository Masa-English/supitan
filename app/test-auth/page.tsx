import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function TestAuthPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Auth test error:', error);
    redirect('/landing');
  }

  if (!user) {
    console.log('No user found, redirecting to landing');
    redirect('/landing');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            認証テストページ
          </h1>
          <p className="text-muted-foreground mb-4">
            このページにアクセスできたということは、認証が正常に動作しています。
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              ユーザー情報
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              認証状態
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Authenticated:</strong> ✅ Yes</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Phone Confirmed:</strong> {user.phone_confirmed_at ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              セッション情報
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Audience:</strong> {user.aud}</p>
              <p><strong>App Metadata:</strong> {JSON.stringify(user.app_metadata, null, 2)}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/dashboard"
            className="text-primary hover:underline"
          >
            ← ダッシュボードに戻る
          </a>
        </div>
      </div>
    </div>
  );
} 