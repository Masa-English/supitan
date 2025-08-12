import { notFound } from 'next/navigation';
import { dataProvider } from '@/lib/data-provider';
import type { Word } from '@/lib/types';
import FlashcardClient from '../../../flashcard/flashcard-client';

export const revalidate = 300; // 5分

export async function generateStaticParams() {
  const categories = await dataProvider.getCategories();
  const params: Array<{ category: string; sec: string }> = [];

  for (const c of categories) {
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

export default async function FlashcardSectionPage({
  params,
}: {
  params: Promise<{ category: string; sec: string }>;
}) {
  const p = await params;
  const decodedCategory = decodeURIComponent(p.category);
  const section = decodeURIComponent(p.sec);

  let words: Word[] = await dataProvider.getWordsByCategory(decodedCategory);
  words = words.filter((w) => String(w.section ?? '') === section);

  if (!words || words.length === 0) {
    notFound();
  }

  return (
    <FlashcardClient
      category={decodedCategory}
      words={words}
      key={`${decodedCategory}-${section}-flashcard`}
    />
  );
}


