import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// キャッシュ設定
export const revalidate = 300; // 5分

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 単語データを取得
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
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