import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services';
import FlashcardClient from './flashcard-client';
import type { Word } from '@/lib/types';
import { getCategoryNameById } from '@/lib/constants/categories';
// import { supabase } from '@/lib/api/supabase/client'; // サーバーサイドでは使用しない

// ランダム処理を含むため常に動的レンダリングにする
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 静的パスの生成（実際に単語が存在するカテゴリーのみ）
export async function generateStaticParams() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not available');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // まずカテゴリー一覧を取得
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      // データベースエラーの場合はフォールバックを使用
      console.warn('Using fallback categories due to database error');
      return [
        { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab' } // 動詞カテゴリーをフォールバックとして使用
      ];
    }

    // カテゴリーが見つからない場合はフォールバックを使用
    if (!categoriesData || categoriesData.length === 0) {
      console.warn('No categories found in database, using fallback');
      return [
        { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab' } // 動詞カテゴリーをフォールバックとして使用
      ];
    }

    // 各カテゴリーの単語数を確認
    const validCategories: { category: string }[] = [];

    for (const category of categoriesData) {
      try {
        const { count: wordCount, error: wordError } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', category.id);

        if (wordError) {
          console.warn(`Error checking words for category ${category.name}:`, wordError.message);
          continue;
        }

        console.log(`Category ${category.name} (${category.id}) has ${wordCount || 0} words`);

        if (wordCount && wordCount > 0) {
          validCategories.push({ category: category.id });
        }
      } catch (error) {
        console.warn(`Error checking words for category ${category.name}:`, error);
        continue;
      }
    }

    // 有効なカテゴリーが見つからない場合はフォールバックを使用
    if (validCategories.length === 0) {
      console.warn('No valid categories with words found, using fallback');
      return [
        { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab' } // 動詞カテゴリーをフォールバックとして使用
      ];
    }

    console.log(`Generated ${validCategories.length} valid category params for flashcard`);
    return validCategories;
  } catch (error) {
    console.error('Error generating static params for flashcard:', error);
    // エラーが発生した場合もフォールバックを使用
    return [
      { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab' } // 動詞カテゴリーをフォールバックとして使用
    ];
  }
}

interface PageProps {
  params: Promise<{ category_id: string }>;
  searchParams: Promise<{ sec?: string; random?: string; count?: string; mode?: string }>;
}

// カテゴリーIDから名前を取得（動的取得を使用）
async function getCategoryName(categoryId: string): Promise<string | undefined> {
  try {
    return await getCategoryNameById(categoryId);
  } catch (error) {
    console.error('Error getting category name:', error);
    return undefined;
  }
}

export default async function FlashcardPage({ params, searchParams }: PageProps) {
  const { category_id: category } = await params;
  const { sec, random, count, mode } = await searchParams;
  console.log('FlashcardPage: 関数開始');

  // カテゴリーIDから名前を取得（tryブロックの外で定義）
  console.log('FlashcardPage: カテゴリー名取得開始');
  const categoryName = await getCategoryName(category);
  console.log('FlashcardPage: カテゴリー名取得完了', { category, categoryName });

  try {
    console.log('FlashcardPage: params取得完了', { category });

    // カテゴリーIDの検証
    if (!category) {
      console.log('FlashcardPage: カテゴリーIDが無効');
      redirect('/learning/categories');
    }
    console.log('FlashcardPage: searchParams取得完了', { sec, random, count, mode });

    console.log('FlashcardPage: パラメータ取得完了', {
      category,
      sec,
      random,
      count,
      mode
    });

    if (!categoryName) {
      console.log('FlashcardPage: カテゴリーIDが見つからないためリダイレクト', { category });
      redirect('/learning/categories');
    }

  const isReviewMode = mode === 'review';
  const isReviewListMode = mode === 'review-list';

  console.log('FlashcardPage: 開始', {
    category: category,
    categoryName: categoryName,
    sec,
    random,
    count,
    mode,
    isReviewMode,
    isReviewListMode,
    randomType: typeof random,
    countType: typeof count
  });

  // カテゴリーの存在確認
  console.log('FlashcardPage: カテゴリー確認開始', { category, categoryName });

  // カテゴリーIDの検証（categories.tsから取得した名前が有効か確認）
  console.log('カテゴリー確認:', {
    categoryId: category,
    categoryName: categoryName,
    isValidCategory: !!categoryName
  });

  if (!categoryName) {
    console.log('FlashcardPage: カテゴリーIDが無効のためリダイレクト', {
      category,
      error: 'Category ID not found in configuration'
    });
    redirect('/learning/categories');
  }

  console.log('FlashcardPage: カテゴリー確認成功', {
    categoryId: category,
    categoryName: categoryName
  });
  
  // 復習モードでない場合のみセクション指定を処理（ランダムモードを除外）
  if (!isReviewMode && !isReviewListMode && sec && sec !== 'all' && !(random === '1' || random === 'true')) {
    redirect(`/learning/${category}/flashcard/section/${sec}`);
    
  }
  
  // 認証確認
  console.log('FlashcardPage: 認証確認開始');
  const authSupabase = await createServerClient();
  
  // オプションページと同じSupabaseクライアントも作成
  const { createClient } = await import('@supabase/supabase-js');
  const _publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  
  if (authError || !user) {
    console.log('FlashcardPage: 認証エラー', { authError, hasUser: !!user });
    redirect(`/learning/${category}/options?mode=flashcard&error=auth_error`);
  }
  
  console.log('FlashcardPage: 認証成功', { userId: user.id });

  const { data: wordsData, error: wordsError } = await authSupabase
    .from('words')
    .select('*')
    .eq('category', categoryName);

  if (wordsError) {
    console.error('単語取得エラー:', wordsError);
    redirect(`/learning/${category}/options?mode=flashcard&error=database_error`);
  }

  let words: Word[] = (wordsData || []) as Word[];

  if (words.length === 0) {
    redirect(`/learning/${category}/options?mode=flashcard&error=no_words`);
  }

  // 復習リストモードの場合のみフィルタ
  if (isReviewListMode) {
    const reviewWords = await dataProvider.getReviewWords(user.id);
    const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
    words = words.filter((word: Word) => reviewWordIds.has(word.id));

    if (words.length === 0) {
      console.warn('復習リストの単語が見つからないためリダイレクト:', {
        category,
        categoryName,
        reviewWordIdsCount: reviewWordIds.size
      });
      redirect(`/learning/${category}/options?mode=flashcard&error=no_review_list_words`);
    }
  }

  // セクション情報を取得（wordsから抽出）
  let allSections: string[] = [...new Set(words.map(w => String(w.section ?? '')))].filter(Boolean).sort();

  // セクション指定（通常モードのみ）
  if (!isReviewMode && !isReviewListMode && sec && sec !== 'all') {
    if (sec === '未設定') {
      words = words.filter((w) => w.section === null || w.section === undefined);
    } else {
      words = words.filter((w) => String(w.section ?? '') === String(sec));
    }
  }

  // ランダム選択の場合（通常モードのみ）
  if (!isReviewMode && !isReviewListMode && (random === '1' || random === 'true') && count) {
    console.log('ランダムモード検知:', {
      random,
      count,
      wordsCount: words.length,
      category: category,
      categoryName: categoryName,
      isReviewMode,
      isReviewListMode
    });

    const countNum = parseInt(count, 10);
    console.log('ランダムモード処理:', {
      count,
      countNum,
      isValid: !isNaN(countNum) && countNum > 0,
      wordsBeforeRandom: words.length,
      category: category,
      categoryName: categoryName
    });

    // パラメータ検証を強化
    if (isNaN(countNum) || countNum <= 0) {
      console.log('ランダムモード: パラメータエラー', { count, countNum });
      redirect(`/learning/${category}/options?mode=flashcard&error=invalid_params`);
    }

    // 単語が存在しない場合の処理
    if (words.length === 0) {
      console.log('ランダムモード: 単語が存在しない', {
        wordsCount: words.length,
        requestedCount: countNum,
        category: category,
        categoryName: categoryName,
        error: 'No words found for random mode'
      });
      redirect(`/learning/${category}/options?mode=flashcard&error=no_words`);
    }

    // 単語数が指定件数より少ない場合の処理
    if (words.length < countNum) {
      console.log('ランダムモード: 単語数が不足', { 
        wordsCount: words.length, 
        requestedCount: countNum,
        willUseAllWords: true
      });
    }

    // ランダムシャッフルして指定件数を取得（Fisher-Yatesアルゴリズム使用）
    const shuffled = [...words];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    const originalLength = words.length;
    words = shuffled.slice(0, Math.min(countNum, shuffled.length));
    console.log('ランダムモード完了:', {
      originalWordsCount: originalLength,
      requestedCount: countNum,
      finalWordsCount: words.length,
      category: category,
      categoryName: categoryName,
      sampleFinalWords: words.slice(0, 3).map(w => ({ id: w.id, word: w.word }))
    });
  }

    // 単語が0件の場合の処理
    console.log('最終単語数確認:', { wordsCount: words.length, isReviewMode, isReviewListMode, hasRandomParams: !!(random && count) });
    if (!words || words.length === 0) {
      console.log('単語が0件のためリダイレクト');
      if (isReviewMode || isReviewListMode) {
        redirect('/review');
      } else {
        redirect(`/learning/${category}/options?mode=flashcard&error=no_words`);
      }
    }

    // セクション情報を取得（通常モードでセクション指定でない場合）
    if (!isReviewMode && !isReviewListMode && (!sec || sec === 'all')) {
      const { data: sectionsData } = await authSupabase
        .from('words')
        .select('section')
        .eq('category', categoryName)
        .order('section', { ascending: true });

      if (sectionsData) {
        allSections = Array.from(
          new Set(
            sectionsData.map((item: { section: string | null }) => String(item.section ?? '未設定'))
          )
        );
      }
    }

    console.log('FlashcardPage: FlashcardClientを返す', { 
      wordsCount: words.length, 
      sectionsCount: allSections.length 
    });
    
    return (
      <FlashcardClient
        category={category}
        categoryName={categoryName}
        words={words as Word[]}
        allSections={allSections.length > 0 ? allSections : undefined}
      />
    );
    
  } catch (error) {
    console.error('Flashcard page error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      category: category || 'unknown',
      random: random || 'unknown',
      count: count || 'unknown',
      mode: mode || 'unknown',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });

    // エラーが発生した場合の詳細情報をログに出力
    console.error('Flashcard page error details:', {
      hasCategory: !!category,
      hasRandom: !!random,
      hasCount: !!count,
      hasMode: !!mode,
      errorString: String(error)
    });

    redirect(`/learning/${category || 'unknown'}/options?mode=flashcard&error=data_error`);
  }
}