'use client';

import Link from 'next/link';
import { useNavigationStore } from '@/lib/stores';

interface SectionLinkProps {
  href: string;
  section: string;
  count?: number;
}

export function SectionLink({ href, section, count }: SectionLinkProps) {
  const startNavigating = useNavigationStore((s) => s.start);

  const handleClick = () => {
    startNavigating();
  };

  return (
    <Link 
      href={href} 
      onClick={handleClick}
      className="border border-border rounded-lg p-3 bg-card hover:shadow-md hover:border-primary/40 transition-colors" 
      aria-label={`セクション${section}で開始`}
    >
      <div className="text-sm font-semibold text-foreground">セクション {section}</div>
      {count !== undefined && (
        <div className="text-xs text-muted-foreground mt-1">{count}個の単語</div>
      )}
      <div className="mt-2 text-xs text-primary underline">開始</div>
    </Link>
  );
}
