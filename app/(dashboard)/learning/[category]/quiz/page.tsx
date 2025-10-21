import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import type { Word, QuizQuestion } from '@/lib/types';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './quiz-client';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ sec?: string; size?: string; random?: string; count?: string; mode?: string; level?: string }>;
}

// ISR設定 - 30分ごとに再生成
export const revalidate = 1800;

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

    console.log(`Generated ${validCategories.length} valid category params for quiz`);
    return validCategories;
  } catch (error) {
    console.error('Error generating static params for quiz:', error);
    return [];
  }
}

export default async function QuizPage({ params, searchParams }: PageProps) {
  const p = params ? await params : undefined;
  const sp = searchParams ? await searchParams : {};
  if (!p?.category) notFound();
  const category = decodeURIComponent(p.category);
  const sectionRaw = sp.sec;
  const isRandom = sp.random === '1' || sp.random === 'true';
  const randomCount = sp.count ? Number(sp.count) : undefined;
  const isReviewMode = sp.mode === 'review';
  const isReviewListMode = sp.mode === 'review-list';
  const reviewLevel = sp.level ? Number(sp.level) : undefined;

  console.log('QuizPage パラメータ:', {
    category,
    sectionRaw,
    random: sp.random,
    count: sp.count,
    isRandom,
    randomCount,
    isReviewMode,
    isReviewListMode
  });

  // 認証セッションチェック（サーバー側）
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 復習モードでない場合のみセクション指定を処理
  if (!isReviewMode && !isReviewListMode) {
    // セクション指定がある場合は適切なルートにリダイレクト
    if (sectionRaw && sectionRaw !== 'all') {
      redirect(`/learning/${category}/quiz/section/${sectionRaw}`);
    }

    // セーフガード: パラメータ未指定時はオプションへ
    const hasSection = !!sectionRaw;
    const hasRandom = isRandom && (randomCount ?? 0) > 0;
    if (!hasSection && !hasRandom) {
      redirect(`/learning/${category}/options?mode=quiz`);
    }
  }

  // 統一データプロバイダ経由で取得（キャッシュ有効）
  let words = await dataProvider.getWordsByCategory(category);
  console.log('QuizPage 単語取得完了:', { wordsCount: words.length, category, isRandom, randomCount });
  
  // 復習モードの場合は復習対象の単語のみを取得
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
    
    // カテゴリー内の復習対象単語のみをフィルタ
    words = words.filter(word => reviewWordIds.has(word.id));
  }

  // 復習リストモードの場合は復習リストの単語のみを取得
  if (isReviewListMode) {
    const reviewWords = await dataProvider.getReviewWords(user.id);
    
    // 復習リストの単語IDを取得
    const reviewWordIds = new Set(reviewWords.map(rw => rw.word_id));
    
    // カテゴリー内の復習リスト単語のみをフィルタ
    words = words.filter(word => reviewWordIds.has(word.id));
  }
  
  // カテゴリー全体のセクション情報を取得
  const allSections = [...new Set(words.map(w => String(w.section ?? '')))].filter(Boolean).sort();

  // 復習モードでない場合のみセクション指定とランダム指定を処理
  if (!isReviewMode && !isReviewListMode) {
    // セクション指定時はサーバー側でフィルタ
    if (!isRandom && sectionRaw) {
      words = words.filter((w) => String(w.section ?? '') === String(sectionRaw));
    }

    // ランダム指定時はサーバー側でサンプリング
    if (isRandom) {
      const count = Math.max(1, Math.min(randomCount ?? 10, words.length));
      console.log('[QuizPage] Random sampling:', { totalWords: words.length, requestedCount: count, randomCount, isRandom });
      const shuffled = words.slice();
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const randomValue = Math.random();
        const j = Math.floor(randomValue * (i + 1));
        console.log(`[QuizPage] Fisher-Yates shuffle step ${i}: random=${randomValue}, j=${j}`);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const sampledWords = shuffled.slice(0, count).sort((a, b) => (a.word || '').localeCompare(b.word || ''));
      console.log('[QuizPage] Sampled words:', sampledWords.map(w => ({ id: w.id, word: w.word })));
      words = sampledWords;
    }
  }

  // 0件時の処理
  console.log('最終単語数確認:', { wordsCount: words.length, isReviewMode, isReviewListMode, isRandom, randomCount });
  if (!words || words.length === 0) {
    console.log('単語が0件のためリダイレクト');
    if (isReviewMode || isReviewListMode) {
      // 復習モードの場合は復習ページにリダイレクト
      redirect('/review');
    } else {
      // 通常モードの場合はオプションへ戻す
      redirect(`/learning/${category}/options?mode=quiz`);
    }
  }

  const listKey = `${category}-${sectionRaw ?? ''}-${randomCount ?? 0}-${isRandom}-${isReviewMode}-${isReviewListMode}-${reviewLevel ?? ''}`;

  return (
    <QuizClient
      category={category}
      words={words}
      allSections={allSections}
      initialQuestions={generateQuestionsServer(words)}
      key={listKey}
      reviewMode={isReviewMode}
      reviewListMode={isReviewListMode}
      reviewLevel={reviewLevel}
      urgentReviewMode={sp.mode === 'urgent-review'}
    />
  );
}

function generateQuestionsServer(words: Word[]): QuizQuestion[] {
  const newQuestions: QuizQuestion[] = [];

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateMeaningOptions = (correctWord: Word): string[] => {
    const options = [correctWord.japanese];
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      const jp = shuffled[i].japanese;
      if (jp && !options.includes(jp)) options.push(jp);
    }
    while (options.length < 4) options.push(correctWord.japanese);
    // シャッフル
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  };

  const generateExampleOptions = (correctWord: Word): { jp: string; en: string; options: string[] } | null => {
    const pairs = [
      { jp: correctWord.example1_jp, en: correctWord.example1 },
      { jp: correctWord.example2_jp, en: correctWord.example2 },
      { jp: correctWord.example3_jp, en: correctWord.example3 }
    ].filter((p): p is { jp: string; en: string } => Boolean(p.jp && p.en));
    if (pairs.length === 0) return null;
    const selected = pickRandom(pairs);

    const options = [selected.jp];
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffled = otherWords.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      const cands = [shuffled[i].example1_jp, shuffled[i].example2_jp, shuffled[i].example3_jp].filter(Boolean) as string[];
      if (cands.length === 0) continue;
      const candidate = pickRandom(cands);
      if (!options.includes(candidate)) options.push(candidate);
    }
    while (options.length < 4) options.push(selected.jp);
    // シャッフル
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { jp: selected.jp, en: selected.en, options };
  };

  for (const word of words) {
    // 意味問題
    const meaningOptions = generateMeaningOptions(word);
    newQuestions.push({
      word,
      options: meaningOptions,
      correct_answer: word.japanese,
      type: 'meaning',
      question: `${word.word}の意味を選んでください`
    });

    // 50%で例文問題
    if (Math.random() > 0.5) {
      const example = generateExampleOptions(word);
      if (example) {
        const { jp, en, options } = example;
        newQuestions.push({
          word: { ...word, example1: en, example1_jp: jp },
          options,
          correct_answer: jp,
          type: 'example',
          question: `${en}の日本語訳を選んでください`
        });
      }
    }
  }

  // シャッフル
  for (let i = newQuestions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newQuestions[i], newQuestions[j]] = [newQuestions[j], newQuestions[i]];
  }

  return newQuestions;
}