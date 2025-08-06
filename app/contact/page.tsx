import { Metadata } from 'next';
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/common/contact-form';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'お問い合わせ - スピ単',
  description: 'スピ単へのお問い合わせ、ご質問、バグ報告、機能リクエストなどございましたら、お気軽にお問い合わせください。',
};

const contactInfo = [
  {
    icon: Mail,
    title: 'メール',
    description: 'お問い合わせフォームから送信',
    value: 'support@supitan.com'
  },
  {
    icon: MessageCircle,
    title: 'サポート',
    description: '24時間以内に返信',
    value: '通常24時間以内'
  }
];

export default function ContactPage() {
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
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                お問い合わせ
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground">
            スピ単へのご質問、ご要望、バグ報告などございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* お問い合わせフォーム */}
          <div>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  お問い合わせフォーム
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* 連絡先情報 */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>連絡先情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{info.title}</h3>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                        <p className="text-sm font-medium text-primary">{info.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* よくある質問へのリンク */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>よくある質問</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  よくある質問をご確認ください。お探しの情報が見つかるかもしれません。
                </p>
                <Link href="/faq">
                  <Button variant="outline" className="w-full border-border">
                    よくある質問を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 