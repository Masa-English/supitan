'use client';


import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Heart, Mail } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  variant?: 'default' | 'minimal';
  showThemeSwitcher?: boolean;
}

export function Footer({ variant = 'default', showThemeSwitcher = true }: FooterProps) {
  const currentYear = new Date().getFullYear();



  if (variant === 'minimal') {
    return (
      <footer className="w-full border-t border-border bg-card/95 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Masa Flash
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                効率的な英語学習をサポートするフラッシュカードアプリです。 間隔反復アルゴリズムで確実に単語を覚えましょう。
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                機能
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  フラッシュカード学習
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  クイズ形式の確認
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  間隔反復復習
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  学習進捗管理
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  音声機能
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                リンク
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  お問い合わせ
                </Link>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <span className="text-xs text-muted-foreground">テーマ:</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-6">
            <p className="text-center text-xs text-muted-foreground">
              © 2025 Masa Flash - 効率的な英語学習
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-border bg-card/95 backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* アプリ情報 */}
          <div className="space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary rounded-lg flex items-center justify-center">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Masa Flash
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              効率的な英語学習をサポートするフラッシュカードアプリです。
              間隔反復アルゴリズムで確実に単語を覚えましょう。
            </p>
          </div>

          {/* 機能 */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">
              機能
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                フラッシュカード学習
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                クイズ形式の確認
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                間隔反復復習
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                学習進捗管理
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full"></span>
                音声機能
              </li>
            </ul>
          </div>

          {/* リンク */}
          <div className="space-y-2 sm:space-y-4">
            <h4 className="font-semibold text-foreground text-sm sm:text-base">
              リンク
            </h4>
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* お問い合わせ */}
              <Link 
                href="/contact" 
                className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group touch-target py-1"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>お問い合わせ</span>
              </Link>
            </div>
            
            {showThemeSwitcher && (
              <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-4">
                <span className="text-xs text-muted-foreground">テーマ:</span>
                <ThemeSwitcher inline />
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-border mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {currentYear} Masa Flash - 効率的な英語学習
          </p>
        </div>
      </div>
    </footer>
  );
} 