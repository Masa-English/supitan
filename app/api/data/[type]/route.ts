import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data-provider';
import { createClient } from '@/lib/supabase/server';

// キャッシュ設定
export const revalidate = 300; // 5分

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 認証確認
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // データ型の検証
    const validTypes = ['category', 'quiz', 'flashcard', 'review'] as const;
    type ValidType = typeof validTypes[number];
    
    if (!validTypes.includes(type as ValidType)) {
      return NextResponse.json(
        { error: 'Invalid data type' },
        { status: 400 }
      );
    }

    // 統一データプロバイダーを使用
    const data = await dataProvider.getPageData(type as ValidType, {
      category: category || undefined,
      userId: user.id,
    });

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// プリフライトリクエスト対応
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
} 