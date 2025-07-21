import { NextResponse } from 'next/server';
import { getStaticData } from '@/lib/static-data';

// キャッシュ設定
export const revalidate = 900; // 15分間キャッシュ

export async function GET() {
  try {
    const staticData = await getStaticData();

    return NextResponse.json(staticData, {
      headers: {
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
        'CDN-Cache-Control': 'public, max-age=900',
        'Vercel-CDN-Cache-Control': 'public, max-age=900',
      },
    });
  } catch (error) {
    console.error('静的データの生成エラー:', error);
    return NextResponse.json(
      { error: '静的データの生成に失敗しました' },
      { status: 500 }
    );
  }
} 