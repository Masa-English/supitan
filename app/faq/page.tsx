import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, BookOpen, Settings, Shield, Users, Brain, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'よくある質問 - Masa Flash',
  description: 'Masa Flashに関するよくある質問と回答をご覧いただけます。',
};

// FAQアイテムの型定義
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

// FAQデータ（将来的にDB管理に移行予定）
const faqData: FAQItem[] = [
  {
    id: 'account-delete',
    question: 'アカウントの削除はできますか？',
    answer: 'はい、プロフィール設定画面からアカウントの削除が可能です。削除前に学習データのバックアップをお勧めします。削除後はデータの復元ができません。',
    category: 'アカウント管理',
    icon: Settings
  },
  {
    id: 'data-storage',
    question: '学習データはどこに保存されますか？',
    answer: '学習データはクラウドに安全に保存され、複数のデバイスからアクセスできます。データは暗号化され、プライバシーを保護しています。',
    category: 'データ管理',
    icon: Shield
  },
  {
    id: 'new-categories',
    question: '新しい単語カテゴリーの追加は可能ですか？',
    answer: '現在は開発中です。機能リクエストとしてお問い合わせフォームからお送りいただければ、優先的に検討いたします。',
    category: '機能',
    icon: BookOpen
  },
  {
    id: 'learning-methods',
    question: 'どのような学習方法がありますか？',
    answer: 'フラッシュカード学習とクイズ学習の2つの方法があります。フラッシュカードはじっくり学習、クイズは理解度確認に適しています。',
    category: '学習方法',
    icon: Brain
  },
  {
    id: 'progress-tracking',
    question: '学習進捗はどのように管理されますか？',
    answer: '各単語の習熟度、学習回数、正答率などを自動で記録し、ダッシュボードで確認できます。復習が必要な単語も自動で管理されます。',
    category: '学習管理',
    icon: Target
  },
  {
    id: 'multiple-devices',
    question: '複数のデバイスで学習できますか？',
    answer: 'はい、同じアカウントで複数のデバイスからアクセスできます。学習データは同期されるため、どこからでも学習を継続できます。',
    category: 'アカウント管理',
    icon: Users
  },
  {
    id: 'offline-learning',
    question: 'オフラインでも学習できますか？',
    answer: '現在はオンラインでの学習のみ対応しています。PWA機能によるオフライン対応は開発中です。',
    category: '機能',
    icon: BookOpen
  },
  {
    id: 'data-export',
    question: '学習データのエクスポートは可能ですか？',
    answer: '現在は開発中です。データのバックアップやエクスポート機能は今後のアップデートで追加予定です。',
    category: 'データ管理',
    icon: Shield
  }
];

// カテゴリー別にFAQをグループ化
const faqByCategory = faqData.reduce((acc, faq) => {
  if (!acc[faq.category]) {
    acc[faq.category] = [];
  }
  acc[faq.category].push(faq);
  return acc;
}, {} as Record<string, FAQItem[]>);

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/contact">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              お問い合わせに戻る
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <HelpCircle className="h-10 w-10 text-primary" />
              よくある質問
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Masa Flashに関するよくある質問と回答をご覧いただけます。
              お探しの情報が見つからない場合は、お問い合わせフォームからご連絡ください。
            </p>
          </div>
        </div>

        {/* カテゴリー別FAQ */}
        <div className="space-y-8">
          {Object.entries(faqByCategory).map(([category, faqs]) => (
            <Card key={category} className="bg-card/90 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {category}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {category}に関するよくある質問
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full mt-1">
                          <faq.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">
                            Q: {faq.question}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            A: {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* お問い合わせへの誘導 */}
        <div className="mt-12">
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                お探しの情報が見つかりませんでしたか？
              </h3>
              <p className="text-muted-foreground mb-6">
                その他のご質問やご要望がございましたら、お気軽にお問い合わせください。
                迅速かつ丁寧にご対応いたします。
              </p>
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  お問い合わせフォームへ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 注意事項 */}
        <div className="mt-8">
          <Card className="bg-card/90 backdrop-blur-sm border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full mt-1">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">ご注意</h4>
                  <p className="text-sm text-muted-foreground">
                    このFAQは随時更新されます。最新の情報については、お問い合わせフォームからご確認ください。
                    将来的にはデータベース管理による動的なFAQ更新機能を追加予定です。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 