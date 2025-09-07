import { Badge } from '@/components/ui/navigation/badge';
import { getCategoryConfigByName, getCategoryColor, getCategoryIcon, getCategoryPos } from '@/lib/constants/categories';

interface CategoryBadgeProps {
  categoryName: string;
  showIcon?: boolean;
  showPos?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({ 
  categoryName, 
  showIcon = true, 
  showPos = true,
  variant = 'outline',
  className = ''
}: CategoryBadgeProps) {
  const config = getCategoryConfigByName(categoryName);
  const color = getCategoryColor(categoryName);
  const icon = getCategoryIcon(categoryName);
  const pos = getCategoryPos(categoryName);

  if (!config) {
    return (
      <Badge variant={variant} className={className}>
        {categoryName}
      </Badge>
    );
  }

  return (
    <Badge 
      variant={variant} 
      className={`${className} ${color ? `border-[${color}]/30 text-[${color}] bg-[${color}]/5` : ''}`}
    >
      {showIcon && icon && <span className="mr-1">{icon}</span>}
      <span>{categoryName}</span>
      {showPos && pos && <span className="ml-1 text-sm opacity-70">({pos})</span>}
    </Badge>
  );
}

interface CategoryDisplayProps {
  categoryName: string;
  showEnglishName?: boolean;
  showDescription?: boolean;
  className?: string;
}

export function CategoryDisplay({ 
  categoryName, 
  showEnglishName = true,
  showDescription = false,
  className = ''
}: CategoryDisplayProps) {
  const config = getCategoryConfigByName(categoryName);
  const icon = getCategoryIcon(categoryName);
  const pos = getCategoryPos(categoryName);

  if (!config) {
    return (
      <div className={className}>
        <span className="font-medium">{categoryName}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{config.name}</span>
          {pos && (
            <Badge variant="outline" className="text-sm">
              {pos}
            </Badge>
          )}
        </div>
        {showEnglishName && (
          <span className="text-sm text-muted-foreground">
            {config.englishName}
          </span>
        )}
        {showDescription && (
          <span className="text-sm text-muted-foreground mt-1">
            {config.description}
          </span>
        )}
      </div>
    </div>
  );
}

interface CategoryProgressProps {
  categoryName: string;
  current: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
}

export function CategoryProgress({ 
  categoryName, 
  current, 
  total, 
  showPercentage = true,
  className = ''
}: CategoryProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const color = getCategoryColor(categoryName);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>学習進捗</span>
        <span>{current} / {total}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color || '#3B82F6'
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-muted-foreground">
          {percentage}% 完了
        </div>
      )}
    </div>
  );
}