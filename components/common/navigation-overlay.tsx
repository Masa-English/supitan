'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigationStore } from '@/lib/stores';

export function NavigationOverlay() {
  const isNavigating = useNavigationStore((s) => s.isNavigating);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    if (isNavigating) {
      // 100ms デバウンスして小さなチラつきを抑制
      timer = window.setTimeout(() => setVisible(true), 100);
    } else {
      setVisible(false);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-busy={true}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="rounded-xl border border-border bg-card/95 px-6 py-5 shadow-xl text-center">
        <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <p className="text-sm text-foreground font-medium">読み込み中…</p>
        <p className="text-xs text-muted-foreground mt-1">少々お待ちください</p>
      </div>
    </div>
  );
}


