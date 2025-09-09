import { NextResponse } from 'next/server';
import { getStaticData } from '@/lib/constants/static-data';

// ISR設定 - 1時間ごとに再生成
export const revalidate = 3600;

export async function GET() {
  // 開発環境でのみログ出力
  if (process.env.NODE_ENV === 'development') {
    console.log('静的データAPI呼び出し開始');
  }
  
  try {
    // 環境変数の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Supabase環境変数が設定されていません');
      }
      return NextResponse.json(
        { 
          error: 'Supabase環境変数が設定されていません',
          details: 'NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が見つかりません'
        },
        { status: 500 }
      );
    }

    const staticData = await getStaticData();
    if (process.env.NODE_ENV === 'development') {
      console.log('静的データ取得成功:', {
        categoriesCount: staticData.categories.length,
        totalWords: staticData.totalWords,
        lastUpdated: staticData.lastUpdated
      });
    }

    return NextResponse.json(staticData, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        'CDN-Cache-Control': 'public, max-age=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('静的データの生成エラー:', error);
    }
    
    // エラーの詳細情報を含める
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: '静的データの生成に失敗しました',
        ...(process.env.NODE_ENV === 'development' && { 
          message: errorMessage,
          stack: errorStack 
        })
      },
      { status: 500 }
    );
  }
} 