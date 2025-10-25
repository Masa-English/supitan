import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, token, category, mode, sections } = body as {
      path?: unknown;
      token?: string;
      category?: string;
      mode?: 'quiz' | 'flashcard';
      sections?: string[];
    };

    // セキュリティトークンの検証
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 特定のパスの再検証
    if (path) {
      if (typeof path !== 'string' || !path.startsWith('/') || path.length > 200) {
        return NextResponse.json(
          { error: 'Invalid path' },
          { status: 400 }
        );
      }
      revalidatePath(path);
    } else if (category && mode && Array.isArray(sections) && sections.length > 0) {
      // カテゴリ×モード×複数セクションの一括再検証
      for (const sec of sections) {
        const p = `/learning/${category}/${mode}/section/${sec}`;
        revalidatePath(p);
      }
    } else {
      // デフォルトでランディングページとカテゴリーページを再検証
      revalidatePath('/landing');
      revalidatePath('/learning/categories');
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