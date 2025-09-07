/**
 * 設定ファイルの統合エクスポート
 */
import { siteConfig, type SiteConfig } from './site';
import { dashboardConfig, type DashboardConfig } from './dashboard';
import { authConfig, type AuthConfig } from './auth';

export { siteConfig, type SiteConfig } from './site';
export { dashboardConfig, type DashboardConfig } from './dashboard';
export { authConfig, type AuthConfig } from './auth';

// 全設定の統合型
export interface AppConfig {
  site: typeof siteConfig;
  dashboard: typeof dashboardConfig;
  auth: typeof authConfig;
}

// 全設定の統合オブジェクト
export const appConfig: AppConfig = {
  site: siteConfig,
  dashboard: dashboardConfig,
  auth: authConfig
} as const;

// 環境変数の検証
export function validateEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// 設定の検証
export function validateConfig() {
  try {
    validateEnvironmentVariables();
    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}

// 開発環境かどうかの判定
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// 機能フラグのヘルパー
export function isFeatureEnabled(feature: string): boolean {
  const envKey = `ENABLE_${feature.toUpperCase()}`;
  return process.env[envKey] === 'true';
}

// 設定値の取得ヘルパー
export function getConfigValue<T>(path: string, defaultValue: T): T {
  const keys = path.split('.');
  let current: any = appConfig;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current ?? defaultValue;
}