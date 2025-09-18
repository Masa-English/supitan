/**
 * パフォーマンス最適化ユーティリティ
 * メモ化、遅延読み込み、バンドルサイズ削減のためのヘルパー関数
 */

import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';

// 自前debounce実装
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
}

// ============================================================================
// 遅延読み込み（Dynamic Import）ヘルパー
// ============================================================================

/**
 * コンポーネントの動的インポート
 */
export const createLazyComponent = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFn) as React.LazyExoticComponent<T>;
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    // React.createElement のオーバーロードを満たすために、明示的に適合型へキャスト
    const Component = LazyComponent as unknown as React.ComponentType<React.ComponentProps<T>>;
    return React.createElement(
      React.Suspense,
      { 
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement('div', {}, 'Loading...')
      },
      React.createElement(
        Component as unknown as React.ComponentType<Record<string, unknown>>,
        props as unknown as Record<string, unknown>
      )
    );
  };
};

/**
 * 条件付き動的インポート
 */
export const createConditionalLazyComponent = <T extends React.ComponentType<unknown>>(
  condition: () => boolean,
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  return function ConditionalLazyWrapper(props: React.ComponentProps<T>) {
    if (!condition()) {
      return fallback ? React.createElement(fallback) : null;
    }
    
    const LazyComponent = React.lazy(importFn) as React.LazyExoticComponent<T>;
    const Component = LazyComponent as unknown as React.ComponentType<React.ComponentProps<T>>;
    
    return React.createElement(
      React.Suspense,
      { 
        fallback: fallback 
          ? React.createElement(fallback) 
          : React.createElement('div', {}, 'Loading...')
      },
      React.createElement(
        Component as unknown as React.ComponentType<Record<string, unknown>>,
        props as unknown as Record<string, unknown>
      )
    );
  };
};

// ============================================================================
// メモ化とパフォーマンス最適化フック
// ============================================================================

/**
 * 安定した参照を持つコールバック
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback(((...args) => callbackRef.current(...args)) as T, []);
}

/**
 * デバウンス付きコールバック
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps?: React.DependencyList
): T {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps ? [callback, delay, ...deps] : [callback, delay]
  );
  
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);
  
  return debouncedFn as T;
}

/**
 * 前の値を記憶するフック
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * 値が変更されたかどうかを判定
 */
export function useChanged<T>(value: T, compare?: (prev: T, current: T) => boolean): boolean {
  const previousValue = usePrevious(value);
  
  if (previousValue === undefined) return false;
  
  if (compare) {
    return !compare(previousValue, value);
  }
  
  return previousValue !== value;
}

/**
 * 深い比較でのメモ化
 */
export function useDeepMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T } | undefined>(undefined);
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory(),
    };
  }
  
  return ref.current!.value;
}

// ============================================================================
// Virtual Scrolling（仮想スクロール）
// ============================================================================

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );
    
    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length - 1, visibleEnd + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
}

// ============================================================================
// Intersection Observer（遅延読み込み）
// ============================================================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options]);
  
  return {
    ref: elementRef,
    isIntersecting,
    entry,
  };
}

/**
 * 遅延読み込みコンポーネント
 */
export function LazyLoadComponent({
  children,
  fallback = null,
  rootMargin = '100px',
  threshold = 0,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}) {
  const { ref, isIntersecting } = useIntersectionObserver({
    rootMargin,
    threshold,
  });
  
  return React.createElement(
    'div',
    { ref },
    isIntersecting ? children : fallback
  );
}

// ============================================================================
// バンドルサイズ最適化
// ============================================================================

/**
 * 条件付きインポート
 */
export const conditionalImport = async <T>(
  condition: boolean,
  importFn: () => Promise<T>
): Promise<T | null> => {
  if (!condition) return null;
  return await importFn();
};

/**
 * 遅延実行
 */
export const createLazyFunction = <T extends (...args: unknown[]) => unknown>(
  importFn: () => Promise<{ default: T }>
) => {
  let cachedFunction: T | null = null;
  
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!cachedFunction) {
      const moduleResult = await importFn();
      cachedFunction = moduleResult.default;
    }
    // cachedFunction はこの時点で必ず設定済み
    return (cachedFunction as T)(...args) as ReturnType<T>;
  };
};

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 深い比較
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  
  if (a == null || b == null) return a === b;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    if (!deepEqual(aObj[key], bObj[key])) return false;
  }
  
  return true;
}

/**
 * スロットリング
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  
  return useCallback(((...args) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      return callback(...args);
    }
  }) as T, [callback, delay]);
}

/**
 * メモリ効率的な配列操作
 */
export const arrayUtils = {
  /**
   * 大きな配列を効率的にチャンク分割
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  /**
   * 重複を効率的に除去
   */
  unique<T>(array: T[], keyFn?: (item: T) => unknown): T[] {
    if (!keyFn) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },
  
  /**
   * 効率的な配列検索
   */
  binarySearch<T>(array: T[], target: T, compareFn?: (a: T, b: T) => number): number {
    let left = 0;
    let right = array.length - 1;
    
    const compare = compareFn || ((a, b) => a < b ? -1 : a > b ? 1 : 0);
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const comparison = compare(array[mid], target);
      
      if (comparison === 0) return mid;
      if (comparison < 0) left = mid + 1;
      else right = mid - 1;
    }
    
    return -1;
  },
};
