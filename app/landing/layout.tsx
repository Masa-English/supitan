import { Header } from '@/components/common';

export const dynamic = 'force-static';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showUserInfo={false} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 