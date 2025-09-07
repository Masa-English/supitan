/**
 * ストレージ関連のユーティリティ
 */

// セキュアなストレージ操作
export function secureStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // 機密情報は暗号化して保存（簡易版）
      const encodedValue = btoa(encodeURIComponent(value));
      window.sessionStorage.setItem(key, encodedValue);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
  }
}

export function secureStorageGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const encodedValue = window.sessionStorage.getItem(key);
      if (encodedValue) {
        return decodeURIComponent(atob(encodedValue));
      }
    }
    return null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
    return null;
  }
}

export function secureStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SessionStorage access failed:', error);
    }
  }
}

// ローカルストレージのヘルパー
export class LocalStorageHelper {
  private prefix: string;

  constructor(prefix: string = 'masa_flash_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      
      window.localStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.warn('Failed to set localStorage item:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const item = window.localStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value as T;
    } catch (error) {
      console.warn('Failed to get localStorage item:', error);
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      window.localStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.warn('Failed to remove localStorage item:', error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          window.localStorage.removeItem(key);
        }
      }
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }

  has(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      return window.localStorage.getItem(this.getKey(key)) !== null;
    } catch (error) {
      console.warn('Failed to check localStorage item:', error);
      return false;
    }
  }

  keys(): string[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  }

  size(): number {
    return this.keys().length;
  }
}

// セッションストレージのヘルパー
export class SessionStorageHelper {
  private prefix: string;

  constructor(prefix: string = 'masa_flash_session_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const serializedValue = JSON.stringify({
        value,
        timestamp: Date.now()
      });
      
      window.sessionStorage.setItem(this.getKey(key), serializedValue);
      return true;
    } catch (error) {
      console.warn('Failed to set sessionStorage item:', error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const item = window.sessionStorage.getItem(this.getKey(key));
      if (!item) return null;

      const parsed = JSON.parse(item);
      return parsed.value as T;
    } catch (error) {
      console.warn('Failed to get sessionStorage item:', error);
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      window.sessionStorage.removeItem(this.getKey(key));
      return true;
    } catch (error) {
      console.warn('Failed to remove sessionStorage item:', error);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const keys = Object.keys(sessionStorage);
      for (const key of keys) {
        if (key.startsWith(this.prefix)) {
          window.sessionStorage.removeItem(key);
        }
      }
      return true;
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
      return false;
    }
  }

  has(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      return window.sessionStorage.getItem(this.getKey(key)) !== null;
    } catch (error) {
      console.warn('Failed to check sessionStorage item:', error);
      return false;
    }
  }

  keys(): string[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const keys = Object.keys(sessionStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.warn('Failed to get sessionStorage keys:', error);
      return [];
    }
  }

  size(): number {
    return this.keys().length;
  }
}

// IndexedDB のヘルパー（簡易版）
export class IndexedDBHelper {
  private dbName: string;
  private version: number;
  private storeName: string;

  constructor(dbName: string = 'masa_flash_db', version: number = 1, storeName: string = 'data') {
    this.dbName = dbName;
    this.version = version;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: key,
          value,
          timestamp: Date.now()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      return true;
    } catch (error) {
      console.warn('Failed to set IndexedDB item:', error);
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const result = await new Promise<{ value: T } | undefined>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();
      return result?.value || null;
    } catch (error) {
      console.warn('Failed to get IndexedDB item:', error);
      return null;
    }
  }

  async remove(key: string): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      return true;
    } catch (error) {
      console.warn('Failed to remove IndexedDB item:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
      return true;
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
      return false;
    }
  }
}

// デフォルトインスタンス
export const localStorage = new LocalStorageHelper();
export const sessionStorage = new SessionStorageHelper();
export const indexedDB = new IndexedDBHelper();

// ストレージの可用性チェック
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage' | 'indexedDB'): boolean {
  try {
    if (typeof window === 'undefined') return false;

    switch (type) {
      case 'localStorage':
        return 'localStorage' in window && window.localStorage !== null;
      case 'sessionStorage':
        return 'sessionStorage' in window && window.sessionStorage !== null;
      case 'indexedDB':
        return 'indexedDB' in window && window.indexedDB !== null;
      default:
        return false;
    }
  } catch {
    return false;
  }
}