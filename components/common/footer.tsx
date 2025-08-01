'use client';


import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Heart, Mail, BookOpen, MessageCircle } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  variant?: 'default' | 'minimal';
  showThemeSwitcher?: boolean;
}

export function Footer({ variant = 'default', showThemeSwitcher = true }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* アプリ情報 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Masa Flash</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              効率的な英語学習をサポートするフラッシュカードアプリです。
              間隔反復アルゴリズムで確実に単語を覚えましょう。
            </p>
          </div>

          {/* 機能 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">機能</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>フラッシュカード学習</li>
              <li>クイズ形式の確認</li>
              <li>間隔反復復習</li>
              <li>学習進捗管理</li>
              <li>音声機能</li>
            </ul>
          </div>

          {/* リンク */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">リンク</h4>
            <div className="space-y-2">
              <Link 
                href="/contact" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                お問い合わせ
              </Link>
              {showThemeSwitcher && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">テーマ:</span>
                  <ThemeSwitcher />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* コピーライト */}
        <div className="border-t border-border mt-6 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Masa Flash - 効率的な英語学習
          </p>
        </div>
      </div>
    </footer>
  );
} 