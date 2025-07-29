import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 認証チェックをスキップしてデータベース接続のみテスト
    
    // データベース接続テスト
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, category')
      .limit(5);

    // user_progressテーブルの存在確認
    const { data: userProgress, error: userProgressError } = await supabase
      .from('user_progress')
      .select('id')
      .limit(1);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        words: {
          exists: !wordsError,
          count: words?.length || 0,
          error: wordsError?.message || null,
          sample: words?.slice(0, 2) || []
        },
        userProgress: {
          exists: !userProgressError,
          count: userProgress?.length || 0,
          error: userProgressError?.message || null,
          errorCode: userProgressError?.code || null,
          errorDetails: userProgressError?.details || null,
          errorHint: userProgressError?.hint || null
        }
      },
      envVars: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...' || null
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