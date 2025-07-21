import { ThemeSwitcher } from "@/components/theme-switcher";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      {children}
      
      <footer className="w-full flex items-center justify-center border-t border-amber-200 dark:border-amber-700 mx-auto text-center text-xs gap-8 py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <p className="text-amber-700 dark:text-amber-300">
          
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
