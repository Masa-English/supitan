"use client";

import { createClient as createBrowserClient } from "@/lib/api/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useNavigationStore } from '@/lib/stores';

export function LogoutButton() {
  const router = useRouter();
  const { start, stop } = useNavigationStore.getState ? useNavigationStore.getState() : { start: () => {}, stop: () => {} };

  const logout = async () => {
    const supabase = createBrowserClient();
    try {
      start?.();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      const digest = (error as { digest?: string } | undefined)?.digest || '';
      const message = String((error as Error | undefined)?.message || '');
      if (digest.startsWith('NEXT_REDIRECT') || message.includes('NEXT_REDIRECT')) {
        stop?.();
        return;
      }
      console.error('ログアウトエラー:', error);
      stop?.();
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}