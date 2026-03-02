import Link from "next/link";
import { Word } from "@/types/word";
import WordIllustration from "./WordIllustration";

interface WordCardProps {
  word: Word;
  learned?: boolean;
}

export default function WordCard({ word, learned }: WordCardProps) {
  return (
    <Link href={`/word/${word.id}`} className="block">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all">
        <div className="flex gap-3">
          <WordIllustration wordId={word.id} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{word.word}</h3>
                <span className="text-sm text-slate-400">{word.pronunciation}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  Lv.{word.level}
                </span>
                {learned && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                    済
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-sm text-indigo-600 font-medium leading-relaxed line-clamp-2">
              {word.coreImage}
            </p>
            <div className="mt-1 text-xs text-slate-400">
              {word.scenes.length}つの意味
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
