import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/api/services';
import { Word } from '@/lib/types';
import FlashcardClient from '../../flashcard-client';

export const revalidate = 300; // 5分 - ISRで定期的に更新

// 静的パラメータ生成を有効化
export async function generateStaticParams() {
  const { getBuildTimeCategorySectionPairs, safeGenerateStaticParams } = await import('@/lib/api/services/static-params-generator');

  return safeGenerateStaticParams(
    getBuildTimeCategorySectionPairs,
    [
      // フォールバック用の基本的な組み合わせ（完全なUUIDを使用）
      { category: 'b464ce08-9440-4178-923f-4d251b8dc0ab', sec: '1' },
    ]
  );
}

export default async function FlashcardSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  try {
    const p = await params;
    const category = p.category;
    const section = p.sec;

    // カテゴリーIDの検証
    if (!category) {
      console.log('FlashcardSectionPage: カテゴリーIDが無効');
      notFound();
    }

    // セクションの検証
    if (!section) {
      console.log('FlashcardSectionPage: セクションが無効');
      notFound();
    }

    console.log(`Loading flashcard section: ${category} - ${section}`);

    // カテゴリー全体の単語を取得（セクション情報のため）
    let allWords: Word[] = [];
    try {
      allWords = await dataProvider.getWordsByCategory(category);
    } catch (error) {
      console.error('データベースエラー:', error);
      notFound();
    }

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

    console.log(`Found ${words.length} words in section ${section} of ${category}`);

    return (
      <FlashcardClient
        category={category}
        words={words}
        allSections={allSections}
        key={`${category}-${section}-flashcard`}
      />
    );
  } catch (error) {
    console.error('FlashcardSectionPage エラー:', error);
    notFound();
  }
}


