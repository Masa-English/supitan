import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BookOpen, Layers, Zap } from 'lucide-react';

export default function LearningLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle className="text-xl text-foreground">
            学習データを読み込み中...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            カテゴリーと単語データを準備しています。
          </p>
          
          {/* プログレスバー */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full animate-pulse" style={{ width: '75%' }} />
          </div>
          
          {/* ガイダンス */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Layers className="h-3 w-3" />
              <span>カテゴリーを読み込み中</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>単語データを準備中</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-3 w-3" />
              <span>学習環境を最適化中</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}