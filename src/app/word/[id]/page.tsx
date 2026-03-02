"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import words1 from "@/data/words.json";
import words2 from "@/data/words_101_200.json";
import words3 from "@/data/words_201_300.json";

const words = [...words1, ...words2, ...words3];
import { Word } from "@/types/word";
import CoreImage from "@/components/CoreImage";
import SceneExample from "@/components/SceneExample";

export default function WordDetail() {
  const params = useParams();
  const id = Number(params.id);
  const word = (words as Word[]).find((w) => w.id === id);
  const [learned, setLearned] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("learned");
    if (stored) {
      const data = JSON.parse(stored);
      setLearned(!!data[id]);
    }
  }, [id]);

  const toggleLearned = () => {
    const stored = localStorage.getItem("learned");
    const data = stored ? JSON.parse(stored) : {};
    data[id] = !learned;
    localStorage.setItem("learned", JSON.stringify(data));
    setLearned(!learned);
  };

  if (!word) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">単語が見つかりません</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const currentIndex = (words as Word[]).findIndex((w) => w.id === id);
  const prevWord = currentIndex > 0 ? (words as Word[])[currentIndex - 1] : null;
  const nextWord =
    currentIndex < words.length - 1 ? (words as Word[])[currentIndex + 1] : null;

  return (
    <div>
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        &larr; 一覧に戻る
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">{word.word}</h1>
          <p className="mt-1 text-lg text-slate-400">{word.pronunciation}</p>
          <span className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
            Lv.{word.level}
          </span>
        </div>
        <button
          onClick={toggleLearned}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            learned
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {learned ? "学習済み" : "未学習"}
        </button>
      </div>

      {word.meaningEn && (
        <p className="mb-4 text-sm text-slate-500 italic">{word.meaningEn}</p>
      )}

      <CoreImage wordId={word.id} coreImage={word.coreImage} />

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-700">
          場面・シーン別の意味
        </h2>
        <div className="grid gap-4">
          {word.scenes.map((scene, i) => (
            <SceneExample key={i} scene={scene} index={i} />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between border-t border-slate-200 pt-4">
        {prevWord ? (
          <Link
            href={`/word/${prevWord.id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            &larr; {prevWord.word}
          </Link>
        ) : (
          <span />
        )}
        {nextWord ? (
          <Link
            href={`/word/${nextWord.id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            {nextWord.word} &rarr;
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
