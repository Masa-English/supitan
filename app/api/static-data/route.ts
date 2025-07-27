import { NextResponse } from 'next/server';
import { getStaticData } from '@/lib/static-data';

// キャッシュ設定
export const revalidate = 900; // 15分間キャッシュ

export async function GET() {
  console.log('静的データAPI呼び出し開始');
  
  try {
    // 環境変数の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase環境変数が設定されていません');
      return NextResponse.json(
        { 
          error: 'Supabase環境変数が設定されていません',
          details: 'NEXT_PUBLIC_SUPABASE_URL または NEXT_PUBLIC_SUPABASE_ANON_KEY が見つかりません'
        },
        { status: 500 }
      );
    }

    const staticData = await getStaticData();
    console.log('静的データ取得成功:', {
      categoriesCount: staticData.categories.length,
      totalWords: staticData.totalWords,
      lastUpdated: staticData.lastUpdated
    });

    return NextResponse.json(staticData, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('静的データの生成エラー:', error);
    
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