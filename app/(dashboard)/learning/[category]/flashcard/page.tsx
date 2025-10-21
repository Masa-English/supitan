import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services';
import FlashcardClient from './flashcard-client';
import type { Word } from '@/lib/types';
// import { supabase } from '@/lib/api/supabase/client'; // サーバーサイドでは使用しない

// ISR設定 - 5分ごとに再生成（より頻繁に更新）
export const revalidate = 300;

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

    // カテゴリーと単語数の情報を取得
    const { data: categoriesData, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        words:words(count)
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    // 単語が存在するカテゴリーのみをフィルタリング
    const validCategories = categoriesData
      ?.filter((category: { id: string; name: string; words?: { count?: number }[] }) => (category.words?.[0]?.count || 0) > 0)
      ?.map((category: { id: string; name: string; words?: { count?: number }[] }) => ({
        category: encodeURIComponent(category.name),
      })) || [];

    console.log(`Generated ${validCategories.length} valid category params for flashcard`);
    return validCategories;
  } catch (error) {
    console.error('Error generating static params for flashcard:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sec?: string; random?: string; count?: string; mode?: string; level?: string }>;
}

export default async function FlashcardPage({ params, searchParams }: PageProps) {
  console.log('FlashcardPage: 関数開始 - try文の外');
  
  try {
    console.log('FlashcardPage: try文開始');
    
    const { category } = await params;
    console.log('FlashcardPage: params取得完了', { category });
    
    const { sec, random, count, mode, level } = await searchParams;
    console.log('FlashcardPage: searchParams取得完了', { sec, random, count, mode, level });
    
    console.log('FlashcardPage: パラメータ取得完了', {
      category,
      sec,
      random,
      count,
      mode,
      level
    });

  // カテゴリーパラメータをデコード
  console.log('FlashcardPage: カテゴリーデコード開始');
  const decodedCategory = decodeURIComponent(category);
  console.log('FlashcardPage: カテゴリーデコード完了', { decodedCategory });
  
  console.log('カテゴリー名のエンコード/デコード確認:', {
    originalCategory: category,
    decodedCategory: decodedCategory,
    encodedCategory: encodeURIComponent(decodedCategory),
    isEncoded: category !== decodedCategory
  });

  const isReviewMode = mode === 'review';
  const isReviewListMode = mode === 'review-list';
  const reviewLevel = level ? Number(level) : undefined;

  console.log('FlashcardPage: 開始', {
    category: category,
    categoryDecoded: decodedCategory,
    categoryEncoded: encodeURIComponent(decodedCategory),
    sec,
    random,
    count,
    mode,
    level,
    isReviewMode,
    isReviewListMode,
    randomType: typeof random,
    countType: typeof count
  });

  // カテゴリーの存在確認
  console.log('FlashcardPage: カテゴリー確認開始', { category: decodedCategory });

  // カテゴリーの存在確認
  console.log('FlashcardPage: Supabaseクライアント作成開始');
  const categoryCheckSupabase = await createServerClient();
  console.log('FlashcardPage: Supabaseクライアント作成完了');
  console.log('カテゴリー確認クエリ:', {
    table: 'categories',
    name: decodedCategory,
    nameLength: decodedCategory.length,
    nameBytes: Buffer.from(decodedCategory, 'utf8').toString('hex'),
    isActive: true
  });
  
  const { data: categoryData, error: categoryError } = await categoryCheckSupabase
    .from('categories')
    .select('id, name')
    .eq('name', decodedCategory) // オプションページと同じ方法
    .eq('is_active', true)
    .single();

  console.log('カテゴリー確認結果:', {
    found: !!categoryData,
    error: categoryError,
    categoryData: categoryData,
    errorMessage: categoryError?.message
  });

  // デバッグ用: データベース内のカテゴリー名を確認
  const { data: allCategories } = await categoryCheckSupabase
    .from('categories')
    .select('name')
    .eq('is_active', true)
    .limit(10);
  
  console.log('データベース内のカテゴリー名一覧:', {
    categories: allCategories?.map(c => ({
      name: c.name,
      length: c.name?.length,
      bytes: c.name ? Buffer.from(c.name, 'utf8').toString('hex') : null
    }))
  });

  if (categoryError || !categoryData) {
    console.log('FlashcardPage: カテゴリーが存在しないためリダイレクト', {
      category,
      decodedCategory,
      error: categoryError?.message,
      errorDetails: categoryError?.details
    });
    redirect('/learning/categories');
  }

  console.log('FlashcardPage: カテゴリー確認成功', {
    categoryId: categoryData.id,
    categoryName: categoryData.name
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
  const publicSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  
  if (authError || !user) {
    console.log('FlashcardPage: 認証エラー', { authError, hasUser: !!user });
    redirect(`/learning/${category}/options?mode=flashcard&error=auth_error`);
  }
  
  console.log('FlashcardPage: 認証成功', { userId: user.id });

  try {
    let words: Word[] = [];
    let allSections: string[] = [];

    // 復習モードの場合
    if (isReviewMode) {
      const userProgress = await dataProvider.getUserProgress(user.id);
      const now = new Date();
      
      // 復習が必要な単語を特定
      const reviewWords = userProgress.filter(progress => {
        if (!progress.last_studied) return false;
        const lastReview = new Date(progress.last_studied);
        const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
        
        // 習得レベルに応じた復習間隔
        const masteryLevel = Math.floor((progress.mastery_level || 0) * 5) + 1;
        const reviewInterval = {
          1: 1, 2: 3, 3: 7, 4: 14, 5: 30
        }[masteryLevel] || 1;
        
        // レベル指定がある場合はそのレベルのみ
        if (reviewLevel && masteryLevel !== reviewLevel) return false;
        
        return daysSinceReview >= reviewInterval;
      });
      
      // 復習対象の単語IDを取得
      const reviewWordIds = new Set(reviewWords.map(p => p.word_id));
      
      // カテゴリー内の復習対象単語のみを取得
      const { data: allWords } = await authSupabase
        .from('words')
        .select('*')
        .eq('category', decodedCategory);

      words = (allWords || []).filter((word: Word) => reviewWordIds.has(word.id));
    }
    // 復習リストモードの場合
    else if (isReviewListMode) {
      const reviewWords = await dataProvider.getReviewWords(user.id);
      
      // 復習リストの単語IDを取得
      const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
      
      // カテゴリー内の復習リスト単語のみを取得
      const { data: allWords } = await authSupabase
        .from('words')
        .select('*')
        .eq('category', decodedCategory);

      words = (allWords || []).filter((word: Word) => reviewWordIds.has(word.id)) as Word[];
    }
    // 通常モードの場合
    else {
      console.log('通常モード: 単語取得開始', { 
        category: decodedCategory, 
        sec, 
        random, 
        count,
        isRandomMode: !!(random === '1' || random === 'true')
      });
      
      // オプションページと同じ方法でデータを取得
      let query = publicSupabase
        .from('words')
        .select('*')
        .eq('category', decodedCategory); // オプションページと同じ方法

      console.log('データベースクエリ構築:', {
        table: 'words',
        category: decodedCategory,
        categoryLength: decodedCategory.length,
        categoryBytes: Buffer.from(decodedCategory, 'utf8').toString('hex'),
        hasSectionFilter: !!(sec && sec !== 'all'),
        section: sec
      });

      // セクション指定の場合（ランダムモードでは実行されない）
      if (sec && sec !== 'all') {
        console.log('セクション指定処理:', { sec });
        if (sec === '未設定') {
          query = query.is('section', null);
        } else {
          query = query.eq('section', sec);
        }
      }

      console.log('データベースクエリ実行前:', {
        category: decodedCategory,
        section: sec,
        isRandomMode: !!(random === '1' || random === 'true')
      });

      // デバッグ用: カテゴリー内の単語数を確認
      const { count: totalWordsCount } = await publicSupabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('category', decodedCategory); // オプションページと同じ方法
      
      console.log('カテゴリー内の総単語数:', {
        category: decodedCategory,
        totalWordsCount: totalWordsCount
      });

      // デバッグ用: データベース内のカテゴリー名を確認
      const { data: sampleWords } = await publicSupabase
        .from('words')
        .select('category')
        .limit(5);
      
      console.log('データベース内のカテゴリー名サンプル:', {
        sampleCategories: sampleWords?.map(w => ({
          category: w.category,
          length: w.category?.length,
          bytes: w.category ? Buffer.from(w.category, 'utf8').toString('hex') : null
        }))
      });

      const { data: wordsData, error: wordsError } = await query.order('id', { ascending: true });
      words = (wordsData || []) as Word[];
      console.log('単語取得結果:', { 
        wordsCount: words.length, 
        error: wordsError, 
        category: decodedCategory,
        isRandomMode: !!(random === '1' || random === 'true'),
        sampleWords: words.slice(0, 3).map(w => ({ id: w.id, word: w.word })),
        hasError: !!wordsError,
        errorMessage: wordsError?.message,
        errorDetails: wordsError?.details,
        errorHint: wordsError?.hint
      });
    }

  // ランダム選択の場合（通常モードのみ）
  if (!isReviewMode && !isReviewListMode && (random === '1' || random === 'true') && count) {
    console.log('ランダムモード検知:', { 
      random, 
      count, 
      wordsCount: words.length,
      category: decodedCategory,
      isReviewMode,
      isReviewListMode
    });

    const countNum = parseInt(count, 10);
    console.log('ランダムモード処理:', { 
      count, 
      countNum, 
      isValid: !isNaN(countNum) && countNum > 0,
      wordsBeforeRandom: words.length
    });

    if (isNaN(countNum) || countNum <= 0) {
      console.log('ランダムモード: パラメータエラー', { count, countNum });
      redirect(`/learning/${category}/options?mode=flashcard&error=no_params`);
    }

    // 単語が存在しない場合の処理
    if (words.length === 0) {
      console.log('ランダムモード: 単語が存在しない', { 
        wordsCount: words.length, 
        requestedCount: countNum,
        category: decodedCategory,
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

    // ランダムシャッフルして指定件数を取得
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const originalLength = words.length;
    words = shuffled.slice(0, Math.min(countNum, shuffled.length));
    console.log('ランダムモード完了:', { 
      originalWordsCount: originalLength,
      requestedCount: countNum,
      finalWordsCount: words.length,
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
        .eq('category', decodedCategory)
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
      random,
      count,
      mode,
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