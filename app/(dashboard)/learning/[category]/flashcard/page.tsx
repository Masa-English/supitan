import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services';
import FlashcardClient from './flashcard-client';
import type { Word } from '@/lib/types';

// ISR設定 - 5分ごとに再生成（より頻繁に更新）
export const revalidate = 300;

// 静的パスの生成
export async function generateStaticParams() {
  try {
    const categories = await dataProvider.getCategories();
    return categories.map((category) => ({
      category: encodeURIComponent(category.category),
    }));
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
  
  const decodedCategory = decodeURIComponent(category);
  const isReviewMode = mode === 'review';
  const isReviewListMode = mode === 'review-list';
  const reviewLevel = level ? Number(level) : undefined;
  
  console.log('FlashcardPage: 開始', { category: decodedCategory, sec, random, count, mode, level });
  
  // 復習モードでない場合のみセクション指定を処理
  if (!isReviewMode && !isReviewListMode && sec && sec !== 'all') {
    redirect(`/learning/${encodeURIComponent(category)}/flashcard/section/${encodeURIComponent(sec)}`);
  }
  
  // 認証確認
  console.log('FlashcardPage: 認証確認開始');
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('FlashcardPage: 認証エラー', { authError, hasUser: !!user });
    redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=auth_error`);
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
        .eq('category', decodedCategory);
      
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
        .eq('category', decodedCategory);
      
      words = (allWords || []).filter(word => reviewWordIds.has(word.id));
    }
    // 通常モードの場合
    else {
      let query = supabase
        .from('words')
        .select('*')
        .eq('category', decodedCategory);

      // セクション指定の場合
      if (sec && sec !== 'all') {
        const decodedSec = decodeURIComponent(sec);
        if (decodedSec === '未設定') {
          query = query.is('section', null);
        } else {
          query = query.eq('section', decodedSec);
        }
      }

      const { data: wordsData } = await query.order('id', { ascending: true });
      words = wordsData || [];
    }

    // ランダム選択の場合（通常モードのみ）
    if (!isReviewMode && !isReviewListMode && random === '1' && count) {
      const countNum = parseInt(count, 10);
      if (isNaN(countNum) || countNum <= 0) {
        redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=no_params`);
      }
      
      // ランダムシャッフルして指定件数を取得
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      words = shuffled.slice(0, Math.min(countNum, shuffled.length));
    }

    // 単語が0件の場合の処理
    if (!words || words.length === 0) {
      if (isReviewMode || isReviewListMode) {
        redirect('/review');
      } else {
        redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=no_words`);
      }
    }

    // セクション情報を取得（通常モードでセクション指定でない場合）
    if (!isReviewMode && !isReviewListMode && (!sec || sec === 'all')) {
      const { data: sectionsData } = await supabase
        .from('words')
        .select('section')
        .eq('category', decodedCategory)
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
        category={decodedCategory} 
        words={words as Word[]} 
        allSections={allSections.length > 0 ? allSections : undefined}
      />
    );
    
  } catch (error) {
    console.error('Flashcard page error:', error);
    redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=data_error`);
  }
}