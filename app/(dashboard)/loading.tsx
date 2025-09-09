import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Brain, Target } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-xl text-foreground">
            読み込み中...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            ダッシュボードを準備しています。しばらくお待ちください。
          </p>
          
          {/* プログレスバー */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          
          {/* ガイダンス */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>フラッシュカードで効率的に学習</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Brain className="h-3 w-3" />
              <span>クイズで理解度を確認</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Target className="h-3 w-3" />
              <span>間隔反復で確実に定着</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}