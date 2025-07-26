import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AudioProvider } from "@/components/common/audio-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Masa Flash - 効率的な英語学習アプリ",
    template: "%s | Masa Flash"
  },
  description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。音声機能付きで発音も学べます。",
  keywords: ["英語学習", "フラッシュカード", "クイズ", "復習", "英単語", "語学学習"],
  authors: [{ name: "Masa Flash Team" }],
  creator: "Masa Flash",
  publisher: "Masa Flash",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: defaultUrl,
    siteName: "Masa Flash",
    title: "Masa Flash - 効率的な英語学習アプリ",
    description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Masa Flash - 英語学習アプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masa Flash - 効率的な英語学習アプリ",
    description: "フラッシュカード、クイズ、復習システムで効率的に英語を学習しましょう。",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          themes={["light", "dark"]}
          storageKey="masa-flash-theme"
          enableColorScheme={false}
        >
          <ToastProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
