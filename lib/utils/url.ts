/**
 * URL関連のユーティリティ
 */

// リダイレクトURL生成
export function getRedirectUrl(path: string): string {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // パスの検証
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path parameter');
  }
  
  // パスの正規化
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
}

// URLパラメータの解析
export function parseUrlParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  } catch {
    return {};
  }
}

// URLパラメータの構築
export function buildUrlParams(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const paramString = searchParams.toString();
  return paramString ? `?${paramString}` : '';
}

// URLの結合
export function joinUrl(base: string, ...paths: string[]): string {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedPaths = paths
    .filter(path => path && path.length > 0)
    .map(path => path.replace(/^\/+|\/+$/g, ''));
  
  if (normalizedPaths.length === 0) {
    return normalizedBase;
  }
  
  return `${normalizedBase}/${normalizedPaths.join('/')}`;
}

// 相対URLを絶対URLに変換
export function toAbsoluteUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const base = baseUrl || 
    (typeof window !== 'undefined' ? window.location.origin : 
     process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  
  return joinUrl(base, url);
}

// URLからドメインを抽出
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
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

// 外部URLかどうかの判定
export function isExternalUrl(url: string): boolean {
  if (!isValidUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    const currentDomain = typeof window !== 'undefined' 
      ? window.location.hostname 
      : new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname;
    
    return urlObj.hostname !== currentDomain;
  } catch {
    return false;
  }
}

// URLのサニタイズ
export function sanitizeUrl(url: string): string {
  // 危険なプロトコルを除去
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#';
    }
  }
  
  return url;
}

// URLのエンコード/デコード
export function encodeUrlComponent(str: string): string {
  return encodeURIComponent(str);
}

export function decodeUrlComponent(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

// パスからファイル名を取得
export function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || '';
  } catch {
    return url.split('/').pop() || '';
  }
}

// パスから拡張子を取得
export function getFileExtensionFromUrl(url: string): string {
  const filename = getFilenameFromUrl(url);
  const lastDotIndex = filename.lastIndexOf('.');
  
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return '';
  }
  
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

// URLのハッシュを取得/設定
export function getUrlHash(): string {
  if (typeof window === 'undefined') return '';
  return window.location.hash.slice(1);
}

export function setUrlHash(hash: string): void {
  if (typeof window === 'undefined') return;
  window.location.hash = hash.startsWith('#') ? hash : `#${hash}`;
}

// URLの履歴操作
export function pushState(url: string, title?: string): void {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, title || '', url);
}

export function replaceState(url: string, title?: string): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, title || '', url);
}

// URLのクエリパラメータを更新
export function updateUrlParams(
  params: Record<string, string | number | boolean | null>,
  replace: boolean = false
): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, String(value));
    }
  });
  
  const newUrl = url.toString();
  
  if (replace) {
    replaceState(newUrl);
  } else {
    pushState(newUrl);
  }
}

// 現在のURLのクエリパラメータを取得
export function getCurrentUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

// URLのパンくずリストを生成
export function generateBreadcrumbsFromUrl(url: string): Array<{ name: string; path: string }> {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    const breadcrumbs: Array<{ name: string; path: string }> = [
      { name: 'ホーム', path: '/' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        name: decodeUrlComponent(segment),
        path: currentPath
      });
    });
    
    return breadcrumbs;
  } catch {
    return [{ name: 'ホーム', path: '/' }];
  }
}