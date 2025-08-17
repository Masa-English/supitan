import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/data-provider';
import { Word } from '@/lib/types';
import FlashcardClient from '../../flashcard-client';

export const revalidate = 300; // 5分

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

export default async function FlashcardSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  try {
    const p = await params;
    const decodedCategory = decodeURIComponent(p.category);
    const section = decodeURIComponent(p.sec);

    // カテゴリー全体の単語を取得（セクション情報のため）
    const allWords: Word[] = await dataProvider.getWordsByCategory(decodedCategory);
    
    // 現在のセクションの単語のみをフィルタ
    const words = allWords.filter((w) => String(w.section ?? '') === section);

    if (!words || words.length === 0) {
      console.warn(`セクション ${section} の単語が見つかりません: ${decodedCategory}`);
      notFound();
    }

    // カテゴリー全体のセクション情報を取得
    const allSections = [...new Set(allWords.map(w => String(w.section ?? '')))].filter(Boolean).sort();

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


