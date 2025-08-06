import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Zap, Target, Trophy, Clock, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'スピ単 - 効率的な英語学習アプリ',
  description: 'フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。音声機能付きで発音も学べます。',
  keywords: ['英語学習', 'フラッシュカード', 'クイズ', '復習', '英単語', '語学学習'],
  openGraph: {
    title: 'スピ単 - 効率的な英語学習アプリ',
    description: 'フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。音声機能付きで発音も学べます。',
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* ロゴとタイトル */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Zap className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 text-primary" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-2">
                    スピ単
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    効率的な英語学習アプリ
                  </p>
                </div>
              </div>
            </div>

            {/* サブタイトル */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-foreground mb-8 leading-relaxed">
              科学的な学習法で<br className="sm:hidden" />
              <span className="text-primary font-semibold">英単語を効率的に</span><br className="sm:hidden" />
              マスターしましょう
            </p>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Zap className="h-5 w-5 mr-2" />
                  学習を始める
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 border-border">
                  お問い合わせ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 sm:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              スピ単の特徴
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              科学的な学習法に基づいた効率的な英単語学習システム
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 特徴1 */}
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                高速学習
              </h3>
              <p className="text-muted-foreground">
                フラッシュカードとクイズで効率的に単語を覚えられます
              </p>
            </div>

            {/* 特徴2 */}
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                間隔反復
              </h3>
              <p className="text-muted-foreground">
                科学的な間隔反復システムで確実に記憶に定着
              </p>
            </div>

            {/* 特徴3 */}
            <div className="text-center p-6 bg-background rounded-xl border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                進捗管理
              </h3>
              <p className="text-muted-foreground">
                詳細な進捗と統計で学習成果を可視化
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 学習方法セクション */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              学習方法
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              3つの学習モードで効率的に英単語をマスター
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* フラッシュカード */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  フラッシュカード
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                単語と意味を素早く確認し、記憶を定着させます。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  高速な単語確認
                </li>
                <li className="flex items-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  音声機能付き
                </li>
                <li className="flex items-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  例文で理解促進
                </li>
              </ul>
            </div>

            {/* クイズ */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  クイズ
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                選択式クイズで理解度を確認し、弱点を特定します。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  4択問題形式
                </li>
                <li className="flex items-center">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  即座のフィードバック
                </li>
                <li className="flex items-center">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  正答率の追跡
                </li>
              </ul>
            </div>

            {/* 復習 */}
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <RotateCcw className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  復習
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                間隔反復システムで記憶を確実に定着させます。
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  科学的な間隔反復
                </li>
                <li className="flex items-center">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  自動復習スケジュール
                </li>
                <li className="flex items-center">
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-primary" />
                  記憶定着の促進
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            今すぐ学習を始めましょう
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            科学的な学習法で効率的に英単語をマスターし、英語力を向上させましょう
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground">
              <ArrowRight className="h-5 w-5 mr-2" />
              さっそく始める
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
} 