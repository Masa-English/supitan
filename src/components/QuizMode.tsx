"use client";

import { useState, useCallback, useMemo } from "react";
import { Word } from "@/types/word";

type QuizType = "coreImage" | "fillBlank";

interface QuizModeProps {
  words: Word[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizMode({ words }: QuizModeProps) {
  const [quizType, setQuizType] = useState<QuizType>("coreImage");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [quizWords, setQuizWords] = useState(() => shuffle(words).slice(0, 10));

  const currentWord = quizWords[currentIndex];

  const choices = useMemo(() => {
    if (!currentWord) return [];
    const others = words
      .filter((w) => w.id !== currentWord.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return shuffle([currentWord, ...others]);
  }, [currentWord, words]);

  const blankSentence = useMemo(() => {
    if (!currentWord || quizType !== "fillBlank") return "";
    const scene = currentWord.scenes[0];
    return scene.example.replace(
      new RegExp(currentWord.word, "i"),
      "______"
    );
  }, [currentWord, quizType]);

  const handleSelect = useCallback(
    (word: string) => {
      if (selected) return;
      setSelected(word);
      setTotal((t) => t + 1);
      if (word === currentWord.word) {
        setScore((s) => s + 1);
      }
    },
    [selected, currentWord]
  );

  const handleNext = useCallback(() => {
    setSelected(null);
    if (currentIndex + 1 < quizWords.length) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, quizWords.length]);

  const handleRestart = useCallback(() => {
    setQuizWords(shuffle(words).slice(0, 10));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setTotal(0);
  }, [words]);

  const isFinished = currentIndex >= quizWords.length - 1 && selected !== null;

  if (!currentWord) {
    return <p className="text-center text-slate-500">単語データがありません</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setQuizType("coreImage");
              handleRestart();
            }}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              quizType === "coreImage"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            コアイメージ → 単語
          </button>
          <button
            onClick={() => {
              setQuizType("fillBlank");
              handleRestart();
            }}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              quizType === "fillBlank"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            例文穴埋め
          </button>
        </div>
        <div className="text-sm text-slate-500">
          {currentIndex + 1} / {quizWords.length} 問 &nbsp;|&nbsp; 正解: {score} / {total}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-1 text-sm text-slate-400">
          {quizType === "coreImage"
            ? "このコアイメージの単語は？"
            : "空欄に入る単語は？"}
        </p>
        <p className="mb-6 text-lg font-bold text-slate-800">
          {quizType === "coreImage" ? currentWord.coreImage : blankSentence}
        </p>
        {quizType === "fillBlank" && (
          <p className="mb-6 text-sm text-slate-500">
            ({currentWord.scenes[0].exampleJa})
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {choices.map((w) => {
            let btnClass =
              "rounded-lg border-2 px-4 py-3 text-center font-bold transition-all ";
            if (selected === null) {
              btnClass +=
                "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
            } else if (w.word === currentWord.word) {
              btnClass += "border-green-400 bg-green-50 text-green-700";
            } else if (w.word === selected) {
              btnClass += "border-red-400 bg-red-50 text-red-700";
            } else {
              btnClass += "border-slate-200 opacity-50";
            }
            return (
              <button
                key={w.id}
                onClick={() => handleSelect(w.word)}
                className={btnClass}
                disabled={selected !== null}
              >
                {w.word}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="mt-4">
            {selected === currentWord.word ? (
              <p className="text-green-600 font-medium">正解!</p>
            ) : (
              <p className="text-red-600 font-medium">
                不正解... 正解は <span className="font-bold">{currentWord.word}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-3">
        {selected && !isFinished && (
          <button
            onClick={handleNext}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            次の問題
          </button>
        )}
        {isFinished && (
          <div className="flex w-full flex-col items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-6 text-center w-full">
              <p className="text-2xl font-bold text-indigo-600">
                {score} / {quizWords.length} 問正解
              </p>
              <p className="mt-1 text-sm text-slate-500">
                正答率: {Math.round((score / quizWords.length) * 100)}%
              </p>
            </div>
            <button
              onClick={handleRestart}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              もう一度
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
