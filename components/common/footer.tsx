'use client';

import { useState, useEffect } from 'react';
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { Heart, Github, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  variant?: 'default' | 'minimal';
  showThemeSwitcher?: boolean;
}

export function Footer({ variant = 'default', showThemeSwitcher = true }: FooterProps) {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  if (variant === 'minimal') {
    return (
      <footer className="w-full border-t border-border bg-card/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary rounded-lg flex items-center justify-center">
                <Heart className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Masa Flash
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {showThemeSwitcher && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">テーマ:</span>
                  <ThemeSwitcher inline />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                © {currentYear} Masa Flash
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-border bg-card/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* アプリ情報 */}
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
              効率的な英語学習をサポートするフラッシュカードアプリです。
              間隔反復アルゴリズムで確実に単語を覚えましょう。
            </p>
          </div>

          {/* 機能 */}
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

          {/* リンク */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              リンク
            </h4>
            <div className="flex flex-col gap-3">
              <Link 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors group"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link 
                href="mailto:support@masaflash.com" 
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors group"
              >
                <Mail className="h-4 w-4" />
                <span>お問い合わせ</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
            
            {showThemeSwitcher && (
              <div className="flex items-center gap-3 pt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">テーマ:</span>
                <ThemeSwitcher inline />
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            © {currentYear} Masa Flash - 効率的な英語学習
          </p>
        </div>
      </div>
    </footer>
  );
} 