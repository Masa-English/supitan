import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services';
import FlashcardClient from './flashcard-client';
import type { Word } from '@/lib/types';

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
  const { category } = await params;
  const { sec, random, count, mode, level } = await searchParams;

  const isReviewMode = mode === 'review';
  const isReviewListMode = mode === 'review-list';
  const reviewLevel = level ? Number(level) : undefined;

  console.log('FlashcardPage: 開始', {
    category: category,
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
  
  // 復習モードでない場合のみセクション指定を処理
  if (!isReviewMode && !isReviewListMode && sec && sec !== 'all') {
    redirect(`/learning/${category}/flashcard/section/${sec}`);
  }
  
  // 認証確認
  console.log('FlashcardPage: 認証確認開始');
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
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
      const { data: allWords } = await supabase
        .from('words')
        .select('*')
        .eq('category', category);
      
      words = (allWords || []).filter(word => reviewWordIds.has(word.id));
    }
    // 復習リストモードの場合
    else if (isReviewListMode) {
      const reviewWords = await dataProvider.getReviewWords(user.id);
      
      // 復習リストの単語IDを取得
      const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
      
      // カテゴリー内の復習リスト単語のみを取得
      const { data: allWords } = await supabase
        .from('words')
        .select('*')
        .eq('category', category);

      words = (allWords || []).filter(word => reviewWordIds.has(word.id)) as Word[];
    }
    // 通常モードの場合
    else {
      let query = supabase
        .from('words')
        .select('*')
        .eq('category', category);

      // セクション指定の場合
      if (sec && sec !== 'all') {
        const decodedSec = decodeURIComponent(sec);
        if (decodedSec === '未設定') {
          query = query.is('section', null);
        } else {
          query = query.eq('section', decodedSec);
        }
      }

      const { data: wordsData, error: wordsError } = await query.order('id', { ascending: true });
      words = (wordsData || []) as Word[];
      console.log('単語取得結果:', { wordsCount: words.length, error: wordsError, category });
    }

  // ランダム選択の場合（通常モードのみ）
  if (!isReviewMode && !isReviewListMode && (random === '1' || random === 'true') && count) {
    console.log('ランダムモード検知:', { random, count, wordsCount: words.length });
    const countNum = parseInt(count, 10);
    console.log('ランダムモード処理:', { countNum, isValid: !isNaN(countNum) && countNum > 0 });

    if (isNaN(countNum) || countNum <= 0) {
      console.log('ランダムモード: パラメータエラー', { count, countNum });
      redirect(`/learning/${category}/options?mode=flashcard&error=no_params`);
    }

    // 単語数が指定件数より少ない場合の処理
    if (words.length < countNum) {
      console.log('ランダムモード: 単語数が不足', { wordsCount: words.length, requestedCount: countNum });
    }

    // ランダムシャッフルして指定件数を取得
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    words = shuffled.slice(0, Math.min(countNum, shuffled.length));
    console.log('ランダムモード完了:', { finalWordsCount: words.length });
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
      const { data: sectionsData } = await supabase
        .from('words')
        .select('section')
        .eq('category', category)
        .order('section', { ascending: true });
      
      if (sectionsData) {
        allSections = Array.from(
          new Set(
            sectionsData.map(item => String(item.section ?? '未設定'))
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
    console.error('Flashcard page error:', error);
    redirect(`/learning/${category}/options?mode=flashcard&error=data_error`);
  }
}