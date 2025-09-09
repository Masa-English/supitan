import { dataProvider } from '@/lib/api/services';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import type { Word, QuizQuestion } from '@/lib/types';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './quiz-client';

interface PageProps {
  params?: Promise<{ category: string }>;
  searchParams?: Promise<{ sec?: string; size?: string; random?: string; count?: string }>;
}

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

  // 認証セッションチェック（サーバー側）
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // セクション指定がある場合は適切なルートにリダイレクト
  if (sectionRaw && sectionRaw !== 'all') {
    redirect(`/learning/${encodeURIComponent(category)}/quiz/section/${encodeURIComponent(sectionRaw)}`);
  }

  // セーフガード: パラメータ未指定時はオプションへ
  const hasSection = !!sectionRaw;
  const hasRandom = isRandom && (randomCount ?? 0) > 0;
  if (!hasSection && !hasRandom) {
    redirect(`/learning/${encodeURIComponent(category)}/options?mode=quiz`);
  }

  // 統一データプロバイダ経由で取得（キャッシュ有効）
  let words = await dataProvider.getWordsByCategory(category);
  
  // カテゴリー全体のセクション情報を取得
  const allSections = [...new Set(words.map(w => String(w.section ?? '')))].filter(Boolean).sort();

  // セクション指定時はサーバー側でフィルタ
  if (!isRandom && sectionRaw) {
    words = words.filter((w) => String(w.section ?? '') === String(sectionRaw));
  }

  // ランダム指定時はサーバー側でサンプリング
  if (isRandom) {
    const count = Math.max(1, Math.min(randomCount ?? 10, words.length));
    const shuffled = words.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    words = shuffled.slice(0, count).sort((a, b) => (a.word || '').localeCompare(b.word || ''));
  }

  // 0件時はオプションへ戻す
  if (!words || words.length === 0) {
    redirect(`/learning/${encodeURIComponent(category)}/options?mode=quiz`);
  }

  const listKey = `${category}-${sectionRaw ?? ''}-${randomCount ?? 0}-${isRandom}`;

  return (
    <QuizClient
      category={category}
      words={words}
      allSections={allSections}
      initialQuestions={generateQuestionsServer(words)}
      key={listKey}
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