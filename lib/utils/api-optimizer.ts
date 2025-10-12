/**
 * API通信最適化ユーティリティ
 * リクエストの重複排除、バッチ処理、キャッシュ管理を提供
 */

'use client';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

interface BatchRequest {
  key: string;
  requests: Array<{
    id: string;
    params: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>;
  timeout: NodeJS.Timeout;
}

export class APIOptimizer {
  private static instance: APIOptimizer;
  private pendingRequests = new Map<string, PendingRequest>();
  private batchRequests = new Map<string, BatchRequest>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestStats = {
    totalRequests: 0,
    cacheHits: 0,
    deduplicatedRequests: 0,
    batchedRequests: 0,
  };

  private constructor() {}

  public static getInstance(): APIOptimizer {
    if (!APIOptimizer.instance) {
      APIOptimizer.instance = new APIOptimizer();
    }
    return APIOptimizer.instance;
  }

  /**
   * 重複リクエストを排除してAPI呼び出しを最適化
   */
  async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 300000 // 5分デフォルト
  ): Promise<T> {
    this.requestStats.totalRequests++;

    // キャッシュチェック
    const cached = this.getCached<T>(key);
    if (cached) {
      this.requestStats.cacheHits++;
      return cached;
    }

    // 進行中のリクエストがある場合は同じPromiseを返す
    const pending = this.pendingRequests.get(key);
    if (pending) {
      this.requestStats.deduplicatedRequests++;
      return pending.promise;
    }

    // 新しいリクエストを作成
    const promise = requestFn().then((result) => {
      // 成功時にキャッシュに保存
      this.setCache(key, result, ttl);
      // 進行中のリクエストから削除
      this.pendingRequests.delete(key);
      return result;
    }).catch((error) => {
      // エラー時は進行中のリクエストから削除
      this.pendingRequests.delete(key);
      throw error;
    });

    // 進行中のリクエストとして記録
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * 複数のリクエストをバッチ処理
   */
  async batchRequest<T>(
    batchKey: string,
    requestId: string,
    params: any,
    batchFn: (requests: Array<{ id: string; params: any }>) => Promise<Array<{ id: string; data: T }>>,
    batchDelay: number = 100 // 100msデフォルト
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const existingBatch = this.batchRequests.get(batchKey);

      if (existingBatch) {
        // 既存のバッチに追加
        existingBatch.requests.push({ id: requestId, params, resolve, reject });
        return;
      }

      // 新しいバッチを作成
      const batch: BatchRequest = {
        key: batchKey,
        requests: [{ id: requestId, params, resolve, reject }],
        timeout: setTimeout(() => {
          this.processBatch(batch, batchFn);
        }, batchDelay),
      };

      this.batchRequests.set(batchKey, batch);
    });
  }

  /**
   * バッチリクエストを処理
   */
  private async processBatch<T>(
    batch: BatchRequest,
    batchFn: (requests: Array<{ id: string; params: any }>) => Promise<Array<{ id: string; data: T }>>
  ) {
    try {
      const requests = batch.requests.map(req => ({ id: req.id, params: req.params }));
      const results = await batchFn(requests);

      // 結果を各リクエストに分配
      batch.requests.forEach(request => {
        const result = results.find(r => r.id === request.id);
        if (result) {
          request.resolve(result.data);
        } else {
          request.reject(new Error(`No result found for request ${request.id}`));
        }
      });

      this.requestStats.batchedRequests += batch.requests.length;
    } catch (error) {
      // エラー時は全てのリクエストにエラーを返す
      batch.requests.forEach(request => {
        request.reject(error);
      });
    } finally {
      this.batchRequests.delete(batch.key);
    }
  }

  /**
   * キャッシュからデータを取得
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * データをキャッシュに保存
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * キャッシュをクリア
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 進行中のリクエストをクリア
   */
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  /**
   * バッチリクエストをクリア
   */
  clearBatchRequests(): void {
    this.batchRequests.forEach(batch => {
      clearTimeout(batch.timeout);
      batch.requests.forEach(request => {
        request.reject(new Error('Batch request cancelled'));
      });
    });
    this.batchRequests.clear();
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    totalRequests: number;
    cacheHits: number;
    deduplicatedRequests: number;
    batchedRequests: number;
    cacheSize: number;
    pendingRequests: number;
    batchRequests: number;
    hitRate: number;
  } {
    return {
      ...this.requestStats,
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      batchRequests: this.batchRequests.size,
      hitRate: this.requestStats.totalRequests > 0 
        ? (this.requestStats.cacheHits / this.requestStats.totalRequests) * 100 
        : 0,
    };
  }

  /**
   * 統計情報をリセット
   */
  resetStats(): void {
    this.requestStats = {
      totalRequests: 0,
      cacheHits: 0,
      deduplicatedRequests: 0,
      batchedRequests: 0,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const apiOptimizer = APIOptimizer.getInstance();

/**
 * 重複排除付きのfetch関数
 */
export async function optimizedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl: number = 300000
): Promise<T> {
  const key = `fetch_${url}_${JSON.stringify(options || {})}`;
  
  return apiOptimizer.deduplicateRequest(
    key,
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    ttl
  );
}

/**
 * バッチ処理付きのAPI呼び出し
 */
export async function batchedApiCall<T>(
  endpoint: string,
  requestId: string,
  params: any,
  batchDelay: number = 100
): Promise<T> {
  return apiOptimizer.batchRequest(
    `batch_${endpoint}`,
    requestId,
    params,
    async (requests) => {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    batchDelay
  );
}
