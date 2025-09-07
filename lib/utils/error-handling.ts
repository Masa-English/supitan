// 統一エラーハンドリングシステム
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export function createError(
  code: keyof typeof ERROR_CODES,
  message: string,
  status?: number,
  details?: Record<string, unknown>
): AppError {
  const statusCode = status || getDefaultStatus(code);
  return new AppError(message, ERROR_CODES[code], statusCode, details);
}

function getDefaultStatus(code: keyof typeof ERROR_CODES): number {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 400;
    case 'AUTH_REQUIRED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'RATE_LIMITED':
      return 429;
    case 'INTERNAL_ERROR':
    case 'DATABASE_ERROR':
      return 500;
    case 'NETWORK_ERROR':
      return 503;
    default:
      return 500;
  }
}

export function handleError(error: unknown, context: string = 'Unknown'): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    console.error(`Error in ${context}:`, error);
    return new AppError(
      error.message,
      ERROR_CODES.INTERNAL_ERROR,
      500,
      { originalError: error.name, context }
    );
  }

  console.error(`Unknown error in ${context}:`, error);
  return new AppError(
    'An unexpected error occurred',
    ERROR_CODES.INTERNAL_ERROR,
    500,
    { context, originalError: error }
  );
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// ユーザーフレンドリーなエラーメッセージ
export const USER_FRIENDLY_MESSAGES = {
  [ERROR_CODES.VALIDATION_ERROR]: '入力内容に問題があります。確認してください。',
  [ERROR_CODES.AUTH_REQUIRED]: 'ログインが必要です。',
  [ERROR_CODES.FORBIDDEN]: 'アクセス権限がありません。',
  [ERROR_CODES.NOT_FOUND]: 'お探しのページが見つかりません。',
  [ERROR_CODES.RATE_LIMITED]: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
  [ERROR_CODES.INTERNAL_ERROR]: 'サーバーエラーが発生しました。しばらく待ってから再試行してください。',
  [ERROR_CODES.NETWORK_ERROR]: 'ネットワークエラーが発生しました。接続を確認してください。',
  [ERROR_CODES.DATABASE_ERROR]: 'データベースエラーが発生しました。しばらく待ってから再試行してください。',
} as const;

export function getUserFriendlyMessage(error: AppError): string {
  return USER_FRIENDLY_MESSAGES[error.code as keyof typeof USER_FRIENDLY_MESSAGES] || 
         '予期しないエラーが発生しました。';
}