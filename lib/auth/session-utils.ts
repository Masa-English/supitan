import { NextRequest } from 'next/server';

/**
 * セッション状態の維持と検証を強化するユーティリティ
 */

/**
 * Supabaseセッションクッキーの存在をより正確に検証
 */
export function hasValidSessionCookie(request: NextRequest): boolean {
  const cookieNames = request.cookies.getAll().map(c => c.name);

  // より厳密なSupabaseセッションクッキーの検証
  const hasAuthToken = cookieNames.some(
    name => name.includes('sb-') && name.includes('auth-token')
  );

  const hasAccessToken = cookieNames.some(
    name => name.includes('sb-') && name.includes('access-token')
  );

  // 両方のトークンが存在する場合により信頼性が高い
  return hasAuthToken || hasAccessToken;
}

/**
 * セッション維持のためのレスポンスヘッダーを設定
 */
export function setSessionHeaders(response: Response): void {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
}

/**
 * 認証エラーがセッション関連かどうかを判定
 */
export function isSessionMissingError(error: unknown): boolean {
  if (!error) return false;

  const err = error as { [k: string]: unknown };
  const name = String(err?.name ?? '');
  const message = String(err?.message ?? '');
  const status = Number((err as { status?: number }).status ?? 0);
  const isFlag = (err as { __isAuthError?: boolean }).__isAuthError === true;
  const code = String((err as { code?: string }).code ?? '');

  const tokenMissing =
    /refresh[_-]?token/i.test(code) || /Invalid Refresh Token/i.test(message);

  return (
    isFlag ||
    status === 400 ||
    tokenMissing ||
    name.includes('AuthSessionMissingError') ||
    /Auth session missing/i.test(message) ||
    /refresh_token_not_found/i.test(code)
  );
}
