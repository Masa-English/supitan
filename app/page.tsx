import { redirect } from 'next/navigation';

export const dynamic = 'force-static';

export default async function HomePage() {
  // ミドルウェア側でCookieベースの早期判定とリダイレクトを実行するため、
  // ここでは最小コストの静的リダイレクトを行う
  redirect('/landing');
}