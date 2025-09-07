import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

export async function GET(_request: NextRequest) {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug API is not available in production' },
      { status: 404 }
    );
  }
  try {
    const supabase = await createServerClient();
    
    // 認証状態の確認
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Authentication required',
        authError: authError?.message || 'No session found',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const userId = session.user.id;
    
    // 1. 基本的なuser_progressクエリテスト
    const { data: basicQuery, error: basicError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    // 2. 特定のword_idでのクエリテスト
    const { data: specificQuery, error: specificError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', 'd530f274-f964-48bb-bbac-54b01da681b7');

    // 3. 認証情報の詳細確認（エラーハンドリング付き）
    let user = null;
    let userError: Error | null = null;
    try {
      const { data: { user: userData }, error } = await supabase.auth.getUser();
      if (!error && userData) {
        user = userData;
      } else {
        userError = error;
      }
    } catch (error) {
      // セッションエラーは静かに処理
      console.debug('Session check skipped for RLS test API');
      userError = error as Error;
    }
    
    // 4. JWTトークンの確認
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail: session.user.email,
      auth: {
        hasSession: !!session,
        sessionExpiresAt: session?.expires_at,
        userError: userError?.message || null,
        currentUser: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null
      },
      queries: {
        basic: {
          success: !basicError,
          count: basicQuery?.length || 0,
          error: basicError ? {
            message: basicError.message,
            code: basicError.code,
            details: basicError.details,
            hint: basicError.hint
          } : null
        },
        specific: {
          success: !specificError,
          count: specificQuery?.length || 0,
          error: specificError ? {
            message: specificError.message,
            code: specificError.code,
            details: specificError.details,
            hint: specificError.hint
          } : null
        }
      },
      jwt: {
        hasToken: !!currentSession?.access_token,
        tokenLength: currentSession?.access_token?.length || 0,
        expiresAt: currentSession?.expires_at
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'RLS Test API error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 