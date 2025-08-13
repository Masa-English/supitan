'use client';

import Link from 'next/link';
import { useNavigationStore } from '@/lib/navigation-store';

interface SectionLinkProps {
  href: string;
  section: string;
}

export function SectionLink({ href, section }: SectionLinkProps) {
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
      <div className="mt-2 text-xs text-primary underline">開始</div>
    </Link>
  );
}
