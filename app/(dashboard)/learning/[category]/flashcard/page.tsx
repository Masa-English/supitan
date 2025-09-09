import { redirect } from 'next/navigation';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import { dataProvider } from '@/lib/api/services';
import FlashcardClient from './flashcard-client';
import type { Word } from '@/lib/types';

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

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
  searchParams: Promise<{ sec?: string; random?: string; count?: string }>;
}

export default async function FlashcardPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { sec, random, count } = await searchParams;
  
  const decodedCategory = decodeURIComponent(category);
  
  console.log('FlashcardPage: 開始', { category: decodedCategory, sec, random, count });
  
  // セクション指定がある場合は適切なルートにリダイレクト
  if (sec && sec !== 'all') {
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
    let query = supabase
      .from('words')
      .select('*')
      .eq('category', decodedCategory);

    let allSections: string[] = [];

    // セクション指定の場合
    if (sec && sec !== 'all') {
      const decodedSec = decodeURIComponent(sec);
      if (decodedSec === '未設定') {
        query = query.is('section', null);
      } else {
        query = query.eq('section', decodedSec);
      }
    }

    // ランダム選択の場合
    if (random === '1' && count) {
      const countNum = parseInt(count, 10);
      if (isNaN(countNum) || countNum <= 0) {
        redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=no_params`);
      }
      
      // ランダムサンプリングのためにすべての単語を取得してからシャッフル
      const { data: allWords, error: allWordsError } = await query;
      
      if (allWordsError) {
        console.error('Words fetch error:', allWordsError);
        redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=data_error`);
      }
      
      if (!allWords || allWords.length === 0) {
        redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=no_words`);
      }
      
      // ランダムシャッフルして指定件数を取得
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      const words = shuffled.slice(0, Math.min(countNum, shuffled.length));
      
      return <FlashcardClient category={decodedCategory} words={words} />;
    }

    // 通常のクエリ実行
    query = query.order('id', { ascending: true });
    const { data: words, error } = await query;
    
    if (error) {
      console.error('Words fetch error:', error);
      redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=data_error`);
    }
    
    if (!words || words.length === 0) {
      redirect(`/learning/${encodeURIComponent(category)}/options?mode=flashcard&error=no_words`);
    }

    // セクション情報を取得（セクション指定でない場合）
    if (!sec || sec === 'all') {
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