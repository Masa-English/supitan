/**
 * 非同期処理関連のユーティリティ
 */

// デバウンスユーティリティ
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// スロットルユーティリティ
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 遅延実行
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// タイムアウト付きPromise
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

// リトライ機能付きの非同期関数実行
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000,
  backoff: boolean = true
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const waitTime = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await delay(waitTime);
    }
  }
  
  throw lastError!;
}

// 並列実行制限付きのPromise処理
export async function promiseLimit<T>(
  promises: (() => Promise<T>)[],
  limit: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (const promiseFactory of promises) {
    const promise = promiseFactory().then(result => {
      results.push(result);
    });
    
    executing.push(promise);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// バッチ処理
export async function batch<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

// キューベースの非同期処理
export class AsyncQueue {
  private queue: (() => Promise<unknown>)[] = [];
  private running = false;
  private concurrency: number;
  private activeCount = 0;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.activeCount >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } finally {
        this.activeCount--;
        this.process();
      }
    }
  }

  get size(): number {
    return this.queue.length;
  }

  get pending(): number {
    return this.activeCount;
  }

  clear(): void {
    this.queue.length = 0;
  }
}

// イベントエミッター
export class EventEmitter<T extends Record<string, unknown[]>> {
  private listeners: Map<keyof T, Set<(...args: unknown[]) => void>> = new Map();

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(listener as (...args: unknown[]) => void);
    
    // アンサブスクライブ関数を返す
    return () => {
      this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
    };
  }

  once<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    const unsubscribe = this.on(event, (...args) => {
      unsubscribe();
      listener(...args);
    });
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  off<K extends keyof T>(event: K, listener?: (...args: T[K]) => void): void {
    if (!listener) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(listener as (...args: unknown[]) => void);
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// AbortController のヘルパー
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();
  
  if (timeoutMs) {
    setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }
  
  return controller;
}

// Promise の状態を追跡
export interface PromiseState<T> {
  status: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  error?: Error;
}

export function trackPromise<T>(promise: Promise<T>): Promise<PromiseState<T>> {
  const state: PromiseState<T> = { status: 'pending' };
  
  return promise
    .then(value => {
      state.status = 'fulfilled';
      state.value = value;
      return state;
    })
    .catch(error => {
      state.status = 'rejected';
      state.error = error instanceof Error ? error : new Error(String(error));
      return state;
    });
}

// 複数のPromiseの状態を追跡
export async function trackAllPromises<T>(
  promises: Promise<T>[]
): Promise<PromiseState<T>[]> {
  const trackedPromises = promises.map(trackPromise);
  return Promise.all(trackedPromises);
}