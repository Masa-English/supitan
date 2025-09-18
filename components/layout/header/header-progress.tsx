/**
 * ヘッダーのプログレスバーコンポーネント
 * 学習進捗の表示
 */

'use client';

interface HeaderProgressProps {
  showProgress?: boolean;
  progress?: number;
  currentIndex?: number;
  totalCount?: number;
}

export function HeaderProgress({
  showProgress = false,
  progress = 0,
  currentIndex = 0,
  totalCount = 0,
}: HeaderProgressProps) {
  if (!showProgress || totalCount === 0) {
    return null;
  }

  const clampedProgress = Math.max(0, Math.min(100, progress));
  const displayIndex = Math.max(1, currentIndex + 1);
  const displayTotal = Math.max(1, totalCount);

  return (
    <div className="flex-1 max-w-md mx-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
        <span>進捗</span>
        <span>{displayIndex} / {displayTotal}</span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
          style={{ 
            width: `${clampedProgress}%`,
            minWidth: clampedProgress > 0 ? '8px' : '0px'
          }}
        />
      </div>
      
      <div className="flex justify-center mt-1">
        <span className="text-xs text-muted-foreground">
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
}
