import { Metadata } from 'next';
import { ContactForm } from '@/components/common/contact-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Mail, Clock, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Masa Flashへのお問い合わせ、ご質問、バグ報告、機能リクエストなどございましたら、お気軽にお問い合わせください。',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            お問い合わせ
          </h1>
          <p className="text-lg text-muted-foreground mx-auto">
            Masa Flashへのご質問、ご要望、バグ報告などございましたら、お気軽にお問い合わせください。
            迅速かつ丁寧にご対応いたします。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* サイドバー情報 */}
          <div className="space-y-6">
            {/* お問い合わせ情報 */}
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MessageSquare className="h-5 w-5" />
                  お問い合わせについて
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">対応時間</h4>
                    <p className="text-sm text-muted-foreground">
                      平日 9:00-18:00（土日祝日除く）
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">返信方法</h4>
                    <p className="text-sm text-muted-foreground">
                      運営で確認させていただき、必要に応じてご連絡いたします
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">プライバシー</h4>
                    <p className="text-sm text-muted-foreground">
                      個人情報は適切に管理し、お問い合わせ対応以外では使用いたしません
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* よくある質問へのリンク */}
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-foreground">よくある質問</CardTitle>
                <CardDescription className="text-muted-foreground">
                  よくいただくご質問と回答
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  よくいただくご質問と回答は別ページでご確認いただけます。
                </p>
                <a 
                  href="/faq" 
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  よくある質問を見る
                </a>
              </CardContent>
            </Card>

            {/* 緊急時の連絡先 */}
            <Card className="bg-card/90 backdrop-blur-sm border-red-500/20 border">
              <CardHeader>
                <CardTitle className="text-red-600">緊急時の連絡先</CardTitle>
                <CardDescription className="text-muted-foreground">
                  システム障害や緊急の場合はこちら
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    システム障害や緊急の場合は、以下の方法でお問い合わせください：
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• カテゴリー: 「バグ報告」を選択</li>
                    <li>• 優先度: 「緊急」を選択</li>
                    <li>• 件名に「緊急」と記載</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 