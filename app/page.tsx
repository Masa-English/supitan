import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  
  // セッションが存在するかチェック（エラーハンドリング付き）
  let user = null;
  try {
    const { data: { user: userData }, error } = await supabase.auth.getUser();
    if (!error && userData) {
      user = userData;
    }
     } catch {
     // セッションエラーは静かに処理
     console.debug('Session check skipped for home page');
   }

  if (!user) {
    redirect('/landing');
  }

  redirect('/dashboard');
} 