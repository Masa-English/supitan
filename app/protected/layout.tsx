import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {children}
      
      <footer className="w-full flex items-center justify-between border-t border-border mx-auto text-center text-xs gap-8 py-6 px-4 bg-background/80 backdrop-blur-sm">
        <p className="text-foreground flex-1 text-left">
          © 2024 Masa Flash - 効率的な英語学習
        </p>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">テーマ:</span>
          <ThemeSwitcher inline />
        </div>
      </footer>
    </main>
  );
}
