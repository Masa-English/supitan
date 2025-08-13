import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/data-provider';
import type { Word } from '@/lib/types';
import FlashcardClient from '../../../flashcard/flashcard-client';

export const revalidate = 300; // 5分

export async function generateStaticParams() {
  try {
    const categories = await dataProvider.getCategories();
    const params: Array<{ category: string; sec: string }> = [];

    for (const c of categories) {
      try {
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
      } catch (error) {
        console.error(`カテゴリー ${c.name} のセクション生成エラー:`, error);
        // エラーが発生しても他のカテゴリーは処理を続行
        continue;
      }
    }

    return params;
  } catch (error) {
    console.error('generateStaticParams エラー:', error);
    // エラーが発生した場合は空の配列を返す
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

    let words: Word[] = await dataProvider.getWordsByCategory(decodedCategory);
    words = words.filter((w) => String(w.section ?? '') === section);

    if (!words || words.length === 0) {
      console.warn(`セクション ${section} の単語が見つかりません: ${decodedCategory}`);
      notFound();
    }

    return (
      <FlashcardClient
        category={decodedCategory}
        words={words}
        key={`${decodedCategory}-${section}-flashcard`}
      />
    );
  } catch (error) {
    console.error('FlashcardSectionPage エラー:', error);
    notFound();
  }
}


