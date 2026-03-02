import WordIllustration from "./WordIllustration";

interface CoreImageProps {
  wordId: number;
  coreImage: string;
}

export default function CoreImage({ wordId, coreImage }: CoreImageProps) {
  return (
    <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6">
      <h3 className="mb-4 text-sm font-semibold text-indigo-500 uppercase tracking-wider">
        Core Image
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <WordIllustration wordId={wordId} size={160} />
        <p className="text-lg font-bold text-slate-800 leading-relaxed">
          {coreImage}
        </p>
      </div>
    </div>
  );
}
