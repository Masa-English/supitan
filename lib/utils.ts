import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * アプリケーションのベースURLを取得する関数
 * Vercel環境では自動的にVERCEL_URLを使用し、
 * 開発環境ではNEXT_PUBLIC_BASE_URLまたはデフォルト値を使用
 */
export function getBaseUrl(): string {
  // Vercel環境では自動的に提供される環境変数を使用（httpsを強制）
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Vercel Project URL (本番環境)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // 開発環境では従来の環境変数またはデフォルト値を使用
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  
  // フォールバック
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://your-app.vercel.app';
}

/**
 * リダイレクト用のベースURLを取得する関数
 * 認証のリダイレクト等で使用
 */
export function getRedirectUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
}
