/**
 * バリデーション関連のユーティリティ
 */

// メールアドレスの検証
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// パスワードの検証
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }
  
  if (password.length > 128) {
    errors.push('パスワードは128文字以下である必要があります');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります');
  }
  
  if (!/\d/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// URLの検証
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 日本語文字の検証
export function containsJapanese(text: string): boolean {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text);
}

// 英語文字の検証
export function containsEnglish(text: string): boolean {
  const englishRegex = /[a-zA-Z]/;
  return englishRegex.test(text);
}

// 文字列の長さ検証
export function validateLength(
  text: string,
  min: number = 0,
  max: number = Infinity
): { isValid: boolean; error?: string } {
  if (text.length < min) {
    return {
      isValid: false,
      error: `${min}文字以上入力してください`
    };
  }
  
  if (text.length > max) {
    return {
      isValid: false,
      error: `${max}文字以下で入力してください`
    };
  }
  
  return { isValid: true };
}

// 必須フィールドの検証
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// 数値の範囲検証
export function validateRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity
): { isValid: boolean; error?: string } {
  if (value < min) {
    return {
      isValid: false,
      error: `${min}以上の値を入力してください`
    };
  }
  
  if (value > max) {
    return {
      isValid: false,
      error: `${max}以下の値を入力してください`
    };
  }
  
  return { isValid: true };
}

// ファイルサイズの検証
export function validateFileSize(
  file: File,
  maxSizeInBytes: number
): { isValid: boolean; error?: string } {
  if (file.size > maxSizeInBytes) {
    const maxSizeInMB = Math.round(maxSizeInBytes / (1024 * 1024));
    return {
      isValid: false,
      error: `ファイルサイズは${maxSizeInMB}MB以下にしてください`
    };
  }
  
  return { isValid: true };
}

// ファイルタイプの検証
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { isValid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `許可されていないファイル形式です。${allowedTypes.join(', ')}のみ対応しています`
    };
  }
  
  return { isValid: true };
}

// フォームデータの検証
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): ValidationResult {
  const errors: Record<string, string[]> = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const fieldErrors: string[] = [];
    
    // 必須チェック
    if (rule.required && !isRequired(value)) {
      fieldErrors.push('この項目は必須です');
      continue;
    }
    
    // 値が存在しない場合はスキップ
    if (!isRequired(value)) continue;
    
    const stringValue = String(value);
    
    // 長さチェック
    if (rule.minLength !== undefined) {
      const lengthResult = validateLength(stringValue, rule.minLength);
      if (!lengthResult.isValid && lengthResult.error) {
        fieldErrors.push(lengthResult.error);
      }
    }
    
    if (rule.maxLength !== undefined) {
      const lengthResult = validateLength(stringValue, 0, rule.maxLength);
      if (!lengthResult.isValid && lengthResult.error) {
        fieldErrors.push(lengthResult.error);
      }
    }
    
    // パターンチェック
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      fieldErrors.push('形式が正しくありません');
    }
    
    // カスタムバリデーション
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        fieldErrors.push(typeof customResult === 'string' ? customResult : '入力値が無効です');
      }
    }
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// サニタイゼーション
export function sanitizeHtml(html: string): string {
  // 基本的なHTMLタグを除去
  return html.replace(/<[^>]*>/g, '');
}

export function sanitizeInput(input: string): string {
  // XSS攻撃を防ぐための基本的なサニタイゼーション
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}