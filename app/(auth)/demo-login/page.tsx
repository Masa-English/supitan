import { LoginForm, InlineLoginForm } from '@/components/features/auth';

export default function DemoLoginPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-center">Login Form Component Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Card Variant */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Original Card Variant</h2>
            <p className="text-muted-foreground text-sm">
              Default card-based login form with backdrop blur and shadow
            </p>
            <LoginForm />
          </div>
          
          {/* Inline Variant */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Inline Variant</h2>
            <p className="text-muted-foreground text-sm">
              Simplified inline form without card styling
            </p>
            <LoginForm variant="inline" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* InlineLoginForm with Title */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">InlineLoginForm (with title)</h2>
            <p className="text-muted-foreground text-sm">
              Dedicated inline component with customizable title
            </p>
            <InlineLoginForm />
          </div>
          
          {/* InlineLoginForm Compact */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">InlineLoginForm (compact, no title)</h2>
            <p className="text-muted-foreground text-sm">
              Compact version without title for minimal layouts
            </p>
            <InlineLoginForm showTitle={false} compact />
          </div>
        </div>
        
        {/* Requirements Check */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Requirements Verification</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>目立つログインフォームまたはログインボタンを表示 (要件 1.1)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>認証ページに直接遷移する機能 (要件 1.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>ミニマルでクリーンなインターフェース (要件 3.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>レスポンシブデザインの維持 (要件 3.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>登録またはログインのための明確なコールトゥアクション</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}