'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">エラーが発生しました</CardTitle>
              <CardDescription>
                申し訳ございません。予期しないエラーが発生しました。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-muted-foreground">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} variant="default" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  再試行
                </Button>
                
                <Button onClick={this.handleReload} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  ページを再読み込み
                </Button>
                
                <Button onClick={this.handleGoHome} variant="ghost" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  ホームに戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// 関数コンポーネント版のエラーバウンダリー（React 18+）
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-destructive">エラーが発生しました</CardTitle>
          <CardDescription>
            申し訳ございません。予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono text-muted-foreground">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} variant="default" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              再試行
            </Button>
            
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              ページを再読み込み
            </Button>
            
            <Button onClick={() => window.location.href = '/'} variant="ghost" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}