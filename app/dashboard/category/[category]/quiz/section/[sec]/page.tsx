import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/data-provider';
import { Word, QuizQuestion } from '@/lib/types';
import QuizClient from '../../quiz-client';

export async function generateStaticParams() {
  try {
    const categories = await dataProvider.getCategories();
    const params: { category: string; sec: string }[] = [];

    for (const category of categories) {
      const words = await dataProvider.getWordsByCategory(category.category);
      const sections = [...new Set(words.map(w => String(w.section ?? '')))].filter(Boolean);
      
      for (const section of sections) {
        params.push({
          category: encodeURIComponent(category.category),
          sec: encodeURIComponent(section)
        });
      }
    }

    return params;
  } catch (error) {
    console.error('Static params generation error:', error);
    return [];
  }
}

export default async function QuizSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  const p = await params;
  const decodedCategory = decodeURIComponent(p.category);
  const section = decodeURIComponent(p.sec);

  // カテゴリー全体の単語を取得（セクション情報のため）
  const allWords = await dataProvider.getWordsByCategory(decodedCategory);
  
  // 現在のセクションの単語のみをフィルタ
  const words = allWords.filter((w) => String(w.section ?? '') === section);

  if (!words || words.length === 0) {
    notFound();
  }

  // カテゴリー全体のセクション情報を取得
  const allSections = [...new Set(allWords.map(w => String(w.section ?? '')))].filter(Boolean).sort();

  const initialQuestions = generateQuestionsServer(words);

  return (
    <QuizClient
      category={decodedCategory}
      words={words}
      allSections={allSections}
      initialQuestions={initialQuestions}
      key={`${decodedCategory}-${section}-quiz`}
    />
  );
}

function generateQuestionsServer(words: Word[]): QuizQuestion[] {
  const newQuestions: QuizQuestion[] = [];
  
  words.forEach(word => {
    // 意味を問う問題
    const meaningOptions = generateMeaningOptions(word, words);
    const meaningQuestion: QuizQuestion = {
      word,
      options: meaningOptions,
      correct_answer: word.japanese,
      type: 'meaning',
      question: `${word.word}の意味を選んでください`
    };
    newQuestions.push(meaningQuestion);

    // 日本語から英語を選ぶ問題（新しい形式）
    if (Math.random() > 0.3) { // 70%の確率で追加
      const japaneseOptions = generateJapaneseOptions(word, words);
      if (japaneseOptions.length === 4) {
        const japaneseQuestion: QuizQuestion = {
          word,
          options: japaneseOptions,
          correct_answer: word.word,
          type: 'japanese_to_english',
          question: `${word.japanese}の英語を選んでください`
        };
        newQuestions.push(japaneseQuestion);
      }
    }
  });

  // 問題をシャッフル
  return newQuestions.sort(() => Math.random() - 0.5);
}

function generateMeaningOptions(correctWord: Word, allWords: Word[]): string[] {
  const options = [correctWord.japanese];
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const shuffled = otherWords.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length && options.length < 4; i++) {
    if (!options.includes(shuffled[i].japanese)) {
      options.push(shuffled[i].japanese);
    }
  }
  
  while (options.length < 4) {
    options.push(correctWord.japanese);
  }

  return options.sort(() => Math.random() - 0.5);
}

function generateJapaneseOptions(correctWord: Word, allWords: Word[]): string[] {
  const options = [correctWord.word];
  const otherWords = allWords.filter(w => w.id !== correctWord.id);
  const shuffled = otherWords.sort(() => Math.random() - 0.5);

  for (let i = 0; i < shuffled.length && options.length < 4; i++) {
    if (!options.includes(shuffled[i].word)) {
      options.push(shuffled[i].word);
    }
  }

  while (options.length < 4) {
    options.push(correctWord.word);
  }

  return options.sort(() => Math.random() - 0.5);
}


