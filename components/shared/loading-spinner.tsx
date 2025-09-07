'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text = '読み込み中...',
  showText = true 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {showText && (
        <span className="text-muted-foreground text-sm">
          {text}
        </span>
      )}
    </div>
  );
}

export function FullPageSpinner({ text = '読み込み中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function InlineSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return <LoadingSpinner size={size} showText={false} />;
}