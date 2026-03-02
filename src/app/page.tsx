import WordList from "@/components/WordList";
import words1 from "@/data/words.json";
import words2 from "@/data/words_101_200.json";
import words3 from "@/data/words_201_300.json";

const words = [...words1, ...words2, ...words3];
import { Word } from "@/types/word";

export default function Home() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          イメージで覚える英単語帳
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          コアイメージと場面・シーンで英語脳を鍛えよう。厳選した基本単語{words.length}語を収録。
        </p>
      </div>
      <WordList words={words as Word[]} />
    </div>
  );
}
