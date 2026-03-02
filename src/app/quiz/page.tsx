import QuizMode from "@/components/QuizMode";
import words1 from "@/data/words.json";
import words2 from "@/data/words_101_200.json";
import words3 from "@/data/words_201_300.json";

const words = [...words1, ...words2, ...words3];
import { Word } from "@/types/word";

export default function QuizPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">クイズモード</h1>
        <p className="mt-2 text-sm text-slate-500">
          ランダムに出題される10問に挑戦しよう。コアイメージや例文から単語を当ててみよう。
        </p>
      </div>
      <QuizMode words={words as Word[]} />
    </div>
  );
}
