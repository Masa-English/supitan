import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";
import { NavigationOverlay } from '@/components/common/navigation-overlay';
import { NavigationEvents } from '@/components/common/navigation-events';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "スピ単 - 効率的な英語学習アプリ",
    template: "%s | スピ単"
  },
  description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。音声機能付きで発音も学べます。",
  keywords: ["英語学習", "フラッシュカード", "クイズ", "復習", "英単語", "語学学習"],
  authors: [{ name: "スピ単 Team" }],
  creator: "スピ単",
  publisher: "スピ単",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: defaultUrl,
    siteName: "スピ単",
    title: "スピ単 - 効率的な英語学習アプリ",
    description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "スピ単 - 英語学習アプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "スピ単 - 効率的な英語学習アプリ",
    description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Supabase 接続のウォームアップ */}
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
          themes={["light", "dark"]}
          storageKey="masa-flash-theme"
          enableColorScheme={false}
        >
          <ToastProvider>
            {/* グローバル遷移イベント/オーバーレイ */}
            <NavigationEvents />
            <NavigationOverlay />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
