import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, token } = body;

    // セキュリティトークンの検証
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 特定のパスの再検証
    if (path) {
      revalidatePath(path);
    } else {
      // デフォルトでランディングページとカテゴリーページを再検証
      revalidatePath('/landing');
      revalidatePath('/protected/category/[category]');
    }

    // 統一キャッシュシステムのキャッシュをクリア
    revalidateTag('static-data');
    revalidateTag('words-by-category');
    revalidateTag('all-words');
    revalidateTag('categories');
    revalidateTag('user-progress');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    console.error('再検証エラー:', error);
    return NextResponse.json(
      { error: '再検証に失敗しました' },
      { status: 500 }
    );
  }
} 