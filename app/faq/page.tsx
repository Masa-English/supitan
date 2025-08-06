import { Metadata } from 'next';
import { ArrowLeft, HelpCircle, Zap, Settings, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'よくある質問 - スピ単',
  description: 'スピ単に関するよくある質問と回答をご覧いただけます。',
};

const faqData = [
  {
    category: '学習について',
    icon: Zap,
    questions: [
      {
        question: 'スピ単とは何ですか？',
        answer: 'スピ単は、科学的な学習法に基づいた英単語学習アプリです。フラッシュカード、クイズ、復習システムを組み合わせて、効率的に英単語を学習できます。'
      },
      {
        question: 'どのような学習方法がありますか？',
        answer: 'フラッシュカード、クイズ、復習の3つの学習モードがあります。それぞれ異なるアプローチで単語を覚えることができます。'
      },
      {
        question: '音声機能はありますか？',
        answer: 'はい、音声機能付きで発音も学べます。正しい発音を聞いて学習できます。'
      }
    ]
  },
  {
    category: 'アカウントについて',
    icon: Users,
    questions: [
      {
        question: 'アカウントの作成は必要ですか？',
        answer: 'はい、学習進捗を保存するためにアカウントの作成が必要です。'
      },
      {
        question: 'パスワードを忘れた場合はどうすればいいですか？',
        answer: 'ログインページの「パスワードを忘れた方」から再設定できます。'
      }
    ]
  },
  {
    category: '機能について',
    icon: Settings,
    questions: [
      {
        question: '学習進捗は保存されますか？',
        answer: 'はい、学習進捗は自動的に保存されます。いつでも学習を再開できます。'
      },
      {
        question: 'お気に入り機能はありますか？',
        answer: 'はい、お気に入りの単語を登録して管理できます。'
      }
    ]
  },
  {
    category: 'セキュリティについて',
    icon: Shield,
    questions: [
      {
        question: '個人情報は安全ですか？',
        answer: 'はい、個人情報は適切に保護されています。詳細はプライバシーポリシーをご確認ください。'
      }
    ]
  }
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/landing">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                よくある質問
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            スピ単に関するよくある質問と回答をご覧いただけます。
          </p>
        </div>

        {/* FAQカテゴリー */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category.category}
                  </h2>
                </div>
                
                <div className="grid gap-4">
                  {category.questions.map((item, questionIndex) => (
                    <Card key={questionIndex} className="border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {item.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* お問い合わせセクション */}
        <div className="mt-12 text-center">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                他にご質問がございましたら
              </h3>
              <p className="text-muted-foreground mb-4">
                お気軽にお問い合わせください
              </p>
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  お問い合わせ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 