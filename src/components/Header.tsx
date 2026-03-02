import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          英語脳単語帳<span className="text-sm font-normal text-slate-500 ml-2">300選</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
            単語一覧
          </Link>
          <Link href="/quiz" className="text-slate-600 hover:text-indigo-600 transition-colors">
            クイズ
          </Link>
        </nav>
      </div>
    </header>
  );
}
