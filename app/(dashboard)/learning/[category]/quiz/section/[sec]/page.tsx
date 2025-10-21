import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/api/services';
import { Word, QuizQuestion } from '@/lib/types';
import QuizClient from '../../quiz-client';

export const revalidate = 1800; // 30分 - クイズは少し長めのキャッシュ

// 静的パラメータ生成を有効化
export async function generateStaticParams() {
  const { getBuildTimeCategorySectionPairs, safeGenerateStaticParams } = await import('@/lib/api/services/static-params-generator');

  return safeGenerateStaticParams(
    getBuildTimeCategorySectionPairs,
    [
      // フォールバック用の基本的な組み合わせ（実際にデータが存在するもののみ）
      { category: encodeURIComponent('動詞'), sec: '1' },
    ]
  );
}

export default async function QuizSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  try {
    const p = await params;
    const category = decodeURIComponent(p.category);
    const section = decodeURIComponent(p.sec);

    console.log(`Loading quiz section: ${category} - ${section}`);

    // カテゴリー全体の単語を取得（セクション情報のため）
    const allWords = await dataProvider.getWordsByCategory(category);
    
    if (!allWords || allWords.length === 0) {
      console.warn(`カテゴリー ${category} の単語が見つかりません`);
      notFound();
    }
    
    // 現在のセクションの単語のみをフィルタ
    const words = allWords.filter((w) => String(w.section ?? '') === section);

    if (!words || words.length === 0) {
      console.warn(`セクション ${section} の単語が見つかりません: ${category}`);
      notFound();
    }

    // カテゴリー全体のセクション情報を取得
    const allSections = [...new Set(allWords.map(w => String(w.section ?? '')))].filter(Boolean).sort();

    const initialQuestions = generateQuestionsServer(words);

    console.log(`Generated ${initialQuestions.length} questions for section ${section} of ${category}`);

    return (
      <QuizClient
        category={category}
        words={words}
        allSections={allSections}
        initialQuestions={initialQuestions}
        key={`${category}-${section}-quiz`}
      />
    );
  } catch (error) {
    console.error('QuizSectionPage エラー:', error);
    notFound();
  }
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


