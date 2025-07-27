'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { MessageSquare, Clock, User, Mail } from 'lucide-react';

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  user_id?: string;
}

const CATEGORY_LABELS = {
  general: '一般的なお問い合わせ',
  bug_report: 'バグ報告',
  feature_request: '機能リクエスト',
  support: 'サポート',
  other: 'その他',
};

const PRIORITY_LABELS = {
  low: '低',
  normal: '通常',
  high: '高',
  urgent: '緊急',
};

const STATUS_LABELS = {
  pending: '未対応',
  in_progress: '対応中',
  resolved: '解決済み',
  closed: '完了',
};

export default function AdminContactPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchInquiries = useCallback(async () => {
    try {
      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('お問い合わせの取得に失敗しました');
      }
      const data = await response.json();
      setInquiries(data.data || []);
    } catch (error) {
      console.error('お問い合わせ取得エラー:', error);
      showToast('お問い合わせの取得に失敗しました', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'in_progress':
        return 'bg-blue-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'closed':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            お問い合わせ管理
          </h1>
          <p className="text-muted-foreground">
            ユーザーからのお問い合わせを管理します
          </p>
        </div>

        <div className="grid gap-6">
          {inquiries.length === 0 ? (
            <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  お問い合わせがありません
                </h3>
                <p className="text-muted-foreground">
                  まだお問い合わせが送信されていません
                </p>
              </CardContent>
            </Card>
          ) : (
            inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="bg-card/90 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg text-foreground">
                          {inquiry.subject}
                        </CardTitle>
                        <Badge className={getPriorityColor(inquiry.priority)}>
                          {PRIORITY_LABELS[inquiry.priority as keyof typeof PRIORITY_LABELS]}
                        </Badge>
                        <Badge className={getStatusColor(inquiry.status)}>
                          {STATUS_LABELS[inquiry.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {inquiry.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">カテゴリー</h4>
                      <Badge variant="outline">
                        {CATEGORY_LABELS[inquiry.category as keyof typeof CATEGORY_LABELS]}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">メッセージ</h4>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                        {inquiry.message}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        返信
                      </Button>
                      <Button size="sm" variant="outline">
                        ステータス更新
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={fetchInquiries} variant="outline">
            更新
          </Button>
        </div>
      </div>
    </div>
  );
} 