import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug API is not available in production' },
      { status: 404 }
    );
  }
  try {
    const supabase = await createClient();
    
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
    
    // RLSを無効にしてテスト（注意: 本番環境では使用しない）
    const { data: rlsDisabledQuery, error: rlsDisabledError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    // 通常のクエリ（RLS有効）
    const { data: normalQuery, error: normalError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail: session.user.email,
      warning: 'This endpoint is for debugging only. Do not use in production.',
      queries: {
        rlsDisabled: {
          success: !rlsDisabledError,
          count: rlsDisabledQuery?.length || 0,
          error: rlsDisabledError ? {
            message: rlsDisabledError.message,
            code: rlsDisabledError.code,
            details: rlsDisabledError.details,
            hint: rlsDisabledError.hint
          } : null
        },
        normal: {
          success: !normalError,
          count: normalQuery?.length || 0,
          error: normalError ? {
            message: normalError.message,
            code: normalError.code,
            details: normalError.details,
            hint: normalError.hint
          } : null
        }
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'RLS Disable Test API error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 