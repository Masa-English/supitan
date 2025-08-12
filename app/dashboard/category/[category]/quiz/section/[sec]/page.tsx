import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/data-provider';
import type { Word, QuizQuestion } from '@/lib/types';
import QuizClient from '../../../quiz/quiz-client';

export const revalidate = 300; // 5分

// セクション別クイズの静的パラメータ生成
export async function generateStaticParams() {
  // すべてのカテゴリーを取得
  const categories = await dataProvider.getCategories();
  const params: Array<{ category: string; sec: string }> = [];

  for (const c of categories) {
    // カテゴリー内の単語を取得してユニークなセクションを抽出
    const words = await dataProvider.getWordsByCategory(c.name);
    const sections = Array.from(
      new Set(
        words
          .map((w) => (w.section === null || w.section === undefined ? '' : String(w.section)))
          .filter((s) => s !== '')
      )
    );
    for (const sec of sections) {
      params.push({ category: c.name, sec });
    }
  }

  return params;
}

export default async function QuizSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  const p = await params;
  const decodedCategory = decodeURIComponent(p.category);
  const section = decodeURIComponent(p.sec);

  // 該当カテゴリーの単語を取得
  let words = await dataProvider.getWordsByCategory(decodedCategory);
  // セクションでフィルタ
  words = words.filter((w) => String(w.section ?? '') === section);

  if (!words || words.length === 0) {
    notFound();
  }

  const initialQuestions = generateQuestionsServer(words);

  return (
    <QuizClient
      category={decodedCategory}
      words={words}
      initialQuestions={initialQuestions}
      key={`${decodedCategory}-${section}-quiz`}
    />
  );
}

function generateQuestionsServer(words: Word[]): QuizQuestion[] {
  const newQuestions: QuizQuestion[] = [];

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateMeaningOptions = (correctWord: Word): string[] => {
    const options = [correctWord.japanese];
    const otherWords = words.filter((w) => w.id !== correctWord.id);
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

  const generateExampleOptions = (
    correctWord: Word
  ): { jp: string; en: string; options: string[] } | null => {
    const pairs = [
      { jp: correctWord.example1_jp, en: correctWord.example1 },
      { jp: correctWord.example2_jp, en: correctWord.example2 },
      { jp: correctWord.example3_jp, en: correctWord.example3 },
    ].filter((p): p is { jp: string; en: string } => Boolean(p.jp && p.en));
    if (pairs.length === 0) return null;
    const selected = pickRandom(pairs);

    const options = [selected.jp];
    const otherWords = words.filter((w) => w.id !== correctWord.id);
    const shuffled = otherWords.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < shuffled.length && options.length < 4; i++) {
      const cands = [
        shuffled[i].example1_jp,
        shuffled[i].example2_jp,
        shuffled[i].example3_jp,
      ].filter(Boolean) as string[];
      if (cands.length === 0) continue;
      const candidate = pickRandom(cands);
      if (!options.includes(candidate)) options.push(candidate);
    }
    while (options.length < 4) options.push(selected.jp);
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { jp: selected.jp, en: selected.en, options };
  };

  for (const word of words) {
    const meaningOptions = generateMeaningOptions(word);
    newQuestions.push({
      word,
      options: meaningOptions,
      correct_answer: word.japanese,
      type: 'meaning',
      question: `${word.word}の意味を選んでください`,
    });

    if (Math.random() > 0.5) {
      const example = generateExampleOptions(word);
      if (example) {
        const { jp, en, options } = example;
        newQuestions.push({
          word: { ...word, example1: en, example1_jp: jp },
          options,
          correct_answer: jp,
          type: 'example',
          question: `${en}の日本語訳を選んでください`,
        });
      }
    }
  }

  for (let i = newQuestions.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newQuestions[i], newQuestions[j]] = [newQuestions[j], newQuestions[i]];
  }

  return newQuestions;
}


