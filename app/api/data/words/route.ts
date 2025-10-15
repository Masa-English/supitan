import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

// 動的レンダリングを強制（cookies()を使用するため）
export const dynamic = 'force-dynamic';

// キャッシュ設定
export const revalidate = 300; // 5分

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // 単語データを取得（カテゴリー情報もJOIN）
    const { data: words, error } = await supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          icon,
          color,
          sort_order,
          is_active
        )
      `)
      .order('category_id', { ascending: true })
      .order('category', { ascending: true })
      .order('word', { ascending: true });

    if (error) {
      console.error('Words fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch words' },
        { status: 500 }
      );
    }

    return NextResponse.json(words || [], {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Words API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 