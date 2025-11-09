import { NextResponse } from 'next/server';
import { dataProvider } from '@/lib/api/services/data-provider';

export const revalidate = 300; // 5分 - データ更新を即座に反映

export async function GET() {
  try {
    const categories = await dataProvider.getCategories();
    
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}