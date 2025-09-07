import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/api/services';
import { Word } from '@/lib/types';
import FlashcardClient from '../../flashcard-client';

export const revalidate = 900; // 15分 - ISRで定期的に更新

// 静的パラメータ生成を有効化
export async function generateStaticParams() {
  const { getBuildTimeCategorySectionPairs, safeGenerateStaticParams } = await import('@/lib/api/services/static-params-generator');
  
  return safeGenerateStaticParams(
    getBuildTimeCategorySectionPairs,
    [
      // フォールバック用の基本的な組み合わせ
      { category: encodeURIComponent('句動詞'), sec: '1' },
      { category: encodeURIComponent('句動詞'), sec: '2' },
      { category: encodeURIComponent('句動詞'), sec: '3' },
      { category: encodeURIComponent('動詞'), sec: '1' },
      { category: encodeURIComponent('名詞'), sec: '1' },
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
    const decodedCategory = decodeURIComponent(p.category);
    const section = decodeURIComponent(p.sec);

    console.log(`Loading flashcard section: ${decodedCategory} - ${section}`);

    // カテゴリー全体の単語を取得（セクション情報のため）
    const allWords: Word[] = await dataProvider.getWordsByCategory(decodedCategory);
    
    if (!allWords || allWords.length === 0) {
      console.warn(`カテゴリー ${decodedCategory} の単語が見つかりません`);
      notFound();
    }
    
    // 現在のセクションの単語のみをフィルタ
    const words = allWords.filter((w) => String(w.section ?? '') === section);

    if (!words || words.length === 0) {
      console.warn(`セクション ${section} の単語が見つかりません: ${decodedCategory}`);
      notFound();
    }

    // カテゴリー全体のセクション情報を取得
    const allSections = [...new Set(allWords.map(w => String(w.section ?? '')))].filter(Boolean).sort();

    console.log(`Found ${words.length} words in section ${section} of ${decodedCategory}`);

    return (
      <FlashcardClient
        category={decodedCategory}
        words={words}
        allSections={allSections}
        key={`${decodedCategory}-${section}-flashcard`}
      />
    );
  } catch (error) {
    console.error('FlashcardSectionPage エラー:', error);
    notFound();
  }
}


