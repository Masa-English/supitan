'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeader } from '@/lib/contexts/header-context';

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

interface SideMenuProps {
  navigationItems: NavigationItem[];
}

export function SideMenu({ navigationItems }: SideMenuProps) {
  const pathname = usePathname();
  const { toggleSideMenu } = useHeader();

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
              <span className="text-primary-foreground font-bold text-sm">ス</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">スピ単</h2>
          </div>
          {/* 閉じるボタン - モバイルでのみ表示 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSideMenu}
            className="lg:hidden text-muted-foreground hover:bg-accent transition-all duration-200 hover:scale-105 p-2"
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
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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
                  <span className="transition-all duration-200">{item.label}</span>
                </Link>
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 