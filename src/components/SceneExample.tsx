import { Scene } from "@/types/word";

interface SceneExampleProps {
  scene: Scene;
  index: number;
}

export default function SceneExample({ scene, index }: SceneExampleProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
          {index + 1}
        </span>
        <h4 className="font-bold text-slate-700">{scene.meaning}</h4>
      </div>

      <div className="mb-3 rounded-lg bg-slate-50 p-4">
        <p className="text-base font-medium text-slate-800">{scene.example}</p>
        <p className="mt-1 text-sm text-slate-500">{scene.exampleJa}</p>
      </div>

    </div>
  );
}
