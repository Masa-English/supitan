"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      const digest = (error as { digest?: string } | undefined)?.digest || '';
      const message = String((error as Error | undefined)?.message || '');
      if (digest.startsWith('NEXT_REDIRECT') || message.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error('ログアウトエラー:', error);
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}
