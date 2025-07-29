'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { Mail, User, MessageSquare, AlertTriangle, CheckCircle, Loader2, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ContactFormProps {
  className?: string;
  variant?: 'default' | 'minimal';
  showTitle?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'bug_report' | 'feature_request' | 'support' | 'other';
}

const CATEGORIES = [
  { value: 'general', label: '一般的なお問い合わせ' },
  { value: 'bug_report', label: 'バグ報告' },
  { value: 'feature_request', label: '機能リクエスト' },
  { value: 'support', label: 'サポート' },
  { value: 'other', label: 'その他' },
] as const;

export function ContactForm({ className, variant = 'default', showTitle = true }: ContactFormProps) {
  const { user } = useAuth({ requireAuth: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  // ユーザーの認証状態を確認し、ログイン済みの場合はメールアドレスを自動入力
  useEffect(() => {
    const checkUser = async () => {
      try {
        // URLパラメータでリセットが要求されている場合は状態をリセット
        const reset = searchParams.get('reset');
        if (reset === 'true') {
          setIsSubmitted(false);
          // URLからリセットパラメータを削除
          router.replace('/contact', { scroll: false });
        }

        if (user) {
          setIsLoggedIn(true);
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || ''
          }));
        }
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [user, searchParams, router]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    // ログイン済みユーザーの場合はメールアドレスを変更できないようにする
    if (isLoggedIn && field === 'email') {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // バリデーション
      if (!formData.name.trim()) {
        showToast('お名前を入力してください', { type: 'error' });
        return;
      }
      if (!formData.email.trim()) {
        showToast('メールアドレスを入力してください', { type: 'error' });
        return;
      }
      if (!formData.subject.trim()) {
        showToast('件名を入力してください', { type: 'error' });
        return;
      }
      if (!formData.message.trim()) {
        showToast('メッセージを入力してください', { type: 'error' });
        return;
      }
      if (formData.message.length < 10) {
        showToast('メッセージは10文字以上で入力してください', { type: 'error' });
        return;
      }

      // ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();

      // お問い合わせをデータベースに保存
      const { error } = await supabase
        .from('contact_inquiries')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category,
          user_id: user?.id || null,
          priority: formData.category === 'bug_report' ? 'high' : 'normal',
        });

      if (error) {
        throw error;
      }

      // 成功時の処理
      setIsSubmitted(true);
      showToast('お問い合わせを送信しました。ありがとうございます。', { type: 'success' });
      
      // フォームをリセット（ユーザー情報は保持）
      setFormData({
        name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
        category: 'general',
      });

    } catch (error) {
      console.error('お問い合わせ送信エラー:', error);
      showToast(
        error instanceof Error ? error.message : 'お問い合わせの送信に失敗しました。しばらく時間をおいて再度お試しください。',
        { type: 'error' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    // ユーザー情報を保持してフォームをリセット
    setFormData({
      name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      email: user?.email || '',
      subject: '',
      message: '',
      category: 'general',
    });
  };

  if (variant === 'minimal') {
    return (
      <div className={className}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">読み込み中...</span>
          </div>
        ) : !isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  お名前 *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="山田太郎"
                  required
                  className="border-border focus:border-primary w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス *
                  {isLoggedIn && <Lock className="h-3 w-3 text-muted-foreground" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  required
                  disabled={isLoggedIn}
                  className={`border-border focus:border-primary w-full ${isLoggedIn ? 'bg-muted cursor-not-allowed' : ''}`}
                />
                {isLoggedIn && (
                  <p className="text-xs text-muted-foreground">
                    ログイン済みのため、アカウントのメールアドレスが自動入力されています
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                カテゴリー *
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as ContactFormData['category'])}
                className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                件名 *
              </Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="お問い合わせの件名"
                required
                className="border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                メッセージ *
              </Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="お問い合わせ内容を詳しくお聞かせください（10文字以上）"
                required
                rows={5}
                className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-vertical"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  お問い合わせを送信
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">送信完了</h3>
              <p className="text-sm text-muted-foreground mt-2">
                お問い合わせを送信しました。内容を確認の上、担当者よりご連絡いたします。
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              新しいお問い合わせ
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={`${className} w-full`}>
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5" />
              お問い合わせフォーム
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              ご質問、ご要望、バグ報告などございましたら、お気軽にお問い合わせください。
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">読み込み中...</span>
          </div>
        ) : !isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  お名前 *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="山田太郎"
                  required
                  className="border-border focus:border-primary focus:ring-primary w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  メールアドレス *
                  {isLoggedIn && <Lock className="h-3 w-3 text-muted-foreground" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  required
                  disabled={isLoggedIn}
                  className={`border-border focus:border-primary focus:ring-primary w-full ${isLoggedIn ? 'bg-muted cursor-not-allowed' : ''}`}
                />
                {isLoggedIn && (
                  <p className="text-xs text-muted-foreground">
                    ログイン済みのため、アカウントのメールアドレスが自動入力されています
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                カテゴリー *
              </Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as ContactFormData['category'])}
                className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                件名 *
              </Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="お問い合わせの件名"
                required
                className="border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                メッセージ *
              </Label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="お問い合わせ内容を詳しくお聞かせください（10文字以上）"
                required
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md bg-transparent text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-vertical"
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length}/5000文字
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">ご注意</p>
                <ul className="space-y-1 text-xs">
                  <li>• お問い合わせの内容によっては、回答までにお時間をいただく場合があります</li>
                  <li>• 個人情報は適切に管理し、お問い合わせ対応以外の目的では使用いたしません</li>
                  <li>• 緊急の場合は、別途サポートチャンネルをご利用ください</li>
                </ul>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  お問い合わせを送信
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">送信完了</h3>
              <p className="text-muted-foreground">
                お問い合わせを送信しました。内容を確認の上、担当者よりご連絡いたします。
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={() => router.push('/contact?reset=true')} variant="outline">
                新しいお問い合わせ
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 