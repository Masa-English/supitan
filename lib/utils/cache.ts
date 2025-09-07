/**
 * キャッシュ管理ユーティリティ
 */

// キャッシュユーティリティ
export class CacheManager {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  set(key: string, data: unknown, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 期限切れのアイテムを削除
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // キャッシュ統計を取得
  getStats(): {
    size: number;
    keys: string[];
    totalMemory: number;
    expiredCount: number;
  } {
    const now = Date.now();
    let expiredCount = 0;
    let totalMemory = 0;

    for (const [, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      }
      // 簡易的なメモリ使用量計算
      totalMemory += JSON.stringify(item.data).length;
    }

    return {
      size: this.cache.size,
      keys: this.keys(),
      totalMemory,
      expiredCount
    };
  }
}

// メモリベースのLRUキャッシュ
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 100, ttl: number = 300000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    // 既存のキーを削除（LRU更新のため）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // サイズ制限チェック
    if (this.cache.size >= this.maxSize) {
      // 最も古いアイテムを削除
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTLチェック
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // LRU更新（削除して再追加）
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// ブラウザストレージベースのキャッシュ
export class StorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix: string = 'cache_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, data: unknown, ttl: number = 300000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      this.storage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set cache item:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const itemStr = this.storage.getItem(this.getKey(key));
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const isExpired = Date.now() - item.timestamp > item.ttl;
      
      if (isExpired) {
        this.delete(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.warn('Failed to get cache item:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn('Failed to delete cache item:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  cleanup(): void {
    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();

      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          const itemStr = this.storage.getItem(key);
          if (itemStr) {
            try {
              const item = JSON.parse(itemStr);
              if (now - item.timestamp > item.ttl) {
                this.storage.removeItem(key);
              }
            } catch {
              // 無効なJSONの場合は削除
              this.storage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

// デフォルトキャッシュインスタンス
export const memoryCache = new CacheManager();
export const lruCache = new LRUCache(100, 300000); // 100アイテム、5分TTL

// ブラウザ環境でのみストレージキャッシュを初期化
export const storageCache = typeof window !== 'undefined' 
  ? new StorageCache(localStorage, 'masa_flash_cache_')
  : null;

// キャッシュキーの生成
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

// キャッシュ付きの関数実行
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300000,
  cache: CacheManager | LRUCache<T> = memoryCache
): Promise<T> {
  // キャッシュから取得を試行
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // キャッシュにない場合は関数を実行
  const result = await fn();
  
  // 結果をキャッシュに保存
  if (cache instanceof CacheManager) {
    cache.set(key, result, ttl);
  } else {
    cache.set(key, result);
  }
  
  return result;
}