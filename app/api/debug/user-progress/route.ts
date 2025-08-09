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
    
    // 特定のword_idでuser_progressをテスト
    const testWordIds = [
      'd530f274-f964-48bb-bbac-54b01da681b7',
      '23b27ec0-852e-4dc3-a95a-4451b66cab14',
      '940d7c37-fece-48b7-ac8f-7545b16e64a2'
    ];

    const results = [];

    for (const wordId of testWordIds) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('word_id', wordId);

        results.push({
          wordId,
          success: !error,
          data: data || [],
          error: error ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          } : null
        });
      } catch (err) {
        results.push({
          wordId,
          success: false,
          data: [],
          error: {
            message: err instanceof Error ? err.message : 'Unknown error',
            code: 'UNKNOWN',
            details: null,
            hint: null
          }
        });
      }
    }

    // 全体的なuser_progress取得テスト
    const { data: allProgress, error: allProgressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail: session.user.email,
      individualTests: results,
      allProgress: {
        success: !allProgressError,
        count: allProgress?.length || 0,
        error: allProgressError ? {
          message: allProgressError.message,
          code: allProgressError.code,
          details: allProgressError.details,
          hint: allProgressError.hint
        } : null
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug API error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 