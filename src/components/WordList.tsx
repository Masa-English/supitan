"use client";

import { useState, useEffect } from "react";
import { Word } from "@/types/word";
import WordCard from "./WordCard";

interface WordListProps {
  words: Word[];
}

export default function WordList({ words }: WordListProps) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | null>(null);
  const [learned, setLearned] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("learned");
    if (stored) {
      setLearned(JSON.parse(stored));
    }
  }, []);

  const levels = [...new Set(words.map((w) => w.level))].sort();

  const filtered = words.filter((w) => {
    const matchesSearch =
      search === "" ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.coreImage.includes(search) ||
      w.scenes.some(
        (s) =>
          s.meaning.includes(search) ||
          s.example.toLowerCase().includes(search.toLowerCase())
      );
    const matchesLevel = levelFilter === null || w.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="単語・意味を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setLevelFilter(null)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              levelFilter === null
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            すべて
          </button>
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                levelFilter === level
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Lv.{level}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {filtered.length}語 表示中
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((word) => (
          <WordCard key={word.id} word={word} learned={learned[word.id]} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-slate-400">
          該当する単語が見つかりません
        </p>
      )}
    </div>
  );
}
