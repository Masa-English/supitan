'use client';

import { Button } from '@/components/ui/button';

interface ReloadButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  children: React.ReactNode;
}

export function ReloadButton({ variant = 'outline', className = '', children }: ReloadButtonProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Button 
      variant={variant}
      className={className}
      onClick={handleReload}
    >
      {children}
    </Button>
  );
}