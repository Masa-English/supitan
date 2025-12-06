'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/navigation/badge';
import { useHeader } from '@/lib/contexts/header-context';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  badge?: string;
}

interface SideMenuProps {
  navigationItems: NavigationItem[];
}

export function SideMenu({ navigationItems }: SideMenuProps) {
  const pathname = usePathname();
  const { toggleSideMenu } = useHeader();

  // 未実装機能の判定
  const isFeatureImplemented = (href: string): boolean => {
    const implementedFeatures = [
      '/learning',
      '/learning/categories',
      '/review',
      '/search',
      '/profile'
    ];
    return implementedFeatures.includes(href);
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (!isFeatureImplemented(href)) {
      e.preventDefault();
      // 未実装機能の場合は何もしない（開発中メッセージは表示しない）
      return;
    }

    // モバイルの場合のみサイドメニューを閉じる（768px基準に変更）
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      console.log('サイドメニューを閉じます（リンククリック時）');
      toggleSideMenu();
    }
  };

  return (
    <div className="h-full flex flex-col safe-top safe-x">
      {/* ヘッダー */}
      <div className="p-4">
        <div className="flex items-center justify-end">
          {/* 閉じるボタン - モバイルでのみ表示 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('サイドメニュー閉じるボタンがクリックされました');
              toggleSideMenu();
            }}
            className="md:hidden text-muted-foreground hover:bg-accent transition-all duration-200 hover:scale-105 p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            
            const isImplemented = isFeatureImplemented(item.href);
            
            return (
              <li key={`${item.href}-${item.label}`}>
                {isImplemented ? (
                  <Link
                    href={item.href}
                    onClick={(e) => handleLinkClick(item.href, e)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 transform ${
                      isActive 
                        ? 'bg-primary/10 text-primary border-r-2 border-primary shadow-sm' 
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-md'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.3s ease-out forwards'
                    }}
                  >
                    <IconComponent className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="transition-all duration-200 flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ) : (
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-not-allowed opacity-60 ${
                      'text-muted-foreground bg-muted/30'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.3s ease-out forwards'
                    }}
                    title="開発中の機能です"
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800"
                    >
                      開発中
                    </Badge>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* フッター */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center transition-opacity duration-200 hover:opacity-80">
          効率的な英語学習
        </p>
      </div>
    </div>
  );
} 