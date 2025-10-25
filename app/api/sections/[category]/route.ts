/**
 * セクション選択ページ用の最適化されたAPIエンドポイント
 * リアルタイム更新とキャッシュ最適化を実装
 */

import { NextRequest, NextResponse } from 'next/server';
import { optimizedSectionService } from '@/lib/api/services/optimized-section-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    // カテゴリーパラメータ（IDとして使用）
    console.log(`[API] Fetching section data for category: ${category}`);

    // 最適化されたセクションデータを取得
    const sectionData = await optimizedSectionService.getSectionData(category);

    // キャッシュヘッダーを設定
    const response = NextResponse.json(sectionData);
    
    // 5分間キャッシュ
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    
    // ETagを設定（データの変更検知用）
    const etag = `"${Buffer.from(JSON.stringify(sectionData)).toString('base64')}"`;
    response.headers.set('ETag', etag);

    console.log(`[API] Returning section data: ${sectionData.totalCount} words in ${sectionData.sections.length} sections`);

    return response;
  } catch (error) {
    console.error('Failed to fetch section data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch section data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params;

    // カテゴリーパラメータ（IDとして使用）
    console.log(`[API] Invalidating cache for category: ${category}`);

    // キャッシュを無効化
    await optimizedSectionService.invalidateCache(category);

    return NextResponse.json({ 
      success: true, 
      message: 'Cache invalidated successfully' 
    });
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to invalidate cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
