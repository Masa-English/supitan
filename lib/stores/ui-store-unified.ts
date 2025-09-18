/**
 * 統一されたUIストア
 * アプリケーション全体のUI状態を効率的に管理
 */

'use client';

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { UIStoreState, ThemeMode, ToastState } from '@/lib/types/stores-unified';

// ============================================================================
// 定数とユーティリティ
// ============================================================================

/** トーストのデフォルト設定 */
const DEFAULT_TOAST_DURATION = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000,
} as const;

/** ユニークIDを生成 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/** システムのテーマを検出 */
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/** 実際のテーマを解決 */
const resolveTheme = (theme: ThemeMode): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme;
};

// ============================================================================
// ストア実装
// ============================================================================

export const useUIStore = create<UIStoreState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // ============================================================================
      // 初期状態
      // ============================================================================
      
      theme: 'system' as ThemeMode,
      
      modals: {},
      
      sidebar: {
        isOpen: false,
        isCollapsed: false,
      },
      
      loading: {
        global: false,
        states: {},
      },
      
      toasts: [],

      // ============================================================================
      // テーマ管理
      // ============================================================================

      setTheme: (theme: ThemeMode) => {
        set({ theme });
        
        // DOM要素にテーマクラスを適用
        if (typeof document !== 'undefined') {
          const root = document.documentElement;
          const resolvedTheme = resolveTheme(theme);
          
          if (resolvedTheme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      // ============================================================================
      // モーダル管理
      // ============================================================================

      toggleModal: (modalId: string, isOpen?: boolean) => {
        set(state => {
          const currentState = state.modals[modalId] || false;
          const newState = isOpen !== undefined ? isOpen : !currentState;
          
          return {
            modals: {
              ...state.modals,
              [modalId]: newState,
            },
          };
        });
      },

      // ============================================================================
      // サイドバー管理
      // ============================================================================

      toggleSidebar: (isOpen?: boolean) => {
        set(state => ({
          sidebar: {
            ...state.sidebar,
            isOpen: isOpen !== undefined ? isOpen : !state.sidebar.isOpen,
          },
        }));
      },

      toggleSidebarCollapse: (isCollapsed?: boolean) => {
        set(state => ({
          sidebar: {
            ...state.sidebar,
            isCollapsed: isCollapsed !== undefined ? isCollapsed : !state.sidebar.isCollapsed,
          },
        }));
      },

      // ============================================================================
      // ローディング状態管理
      // ============================================================================

      setGlobalLoading: (loading: boolean) => {
        set(state => ({
          loading: {
            ...state.loading,
            global: loading,
          },
        }));
      },

      setLoadingState: (key: string, loading: boolean) => {
        set(state => ({
          loading: {
            ...state.loading,
            states: {
              ...state.loading.states,
              [key]: loading,
            },
          },
        }));
      },

      // ============================================================================
      // トースト通知管理
      // ============================================================================

      addToast: (toast: Omit<ToastState, 'id'>) => {
        const id = generateId();
        const duration = toast.duration || DEFAULT_TOAST_DURATION[toast.type];
        
        const newToast: ToastState = {
          ...toast,
          id,
          duration,
        };

        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        // 自動削除のタイマーを設定
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },

      removeToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      // ============================================================================
      // ユーティリティアクション
      // ============================================================================

      reset: () => {
        set({
          theme: 'system',
          modals: {},
          sidebar: {
            isOpen: false,
            isCollapsed: false,
          },
          loading: {
            global: false,
            states: {},
          },
          toasts: [],
        });
      },

      hydrate: (_state: Record<string, unknown>) => {
        // 永続化からの復元時に使用
        if (_state.theme && typeof _state.theme === 'string') {
          const theme = _state.theme as ThemeMode;
          get().setTheme(theme);
        }
        
        if (_state.sidebar && typeof _state.sidebar === 'object') {
          set(prevState => ({
            sidebar: {
              ...prevState.sidebar,
              ...(_state.sidebar as Record<string, unknown>),
            },
          }));
        }
      },
    })),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebar: state.sidebar,
      }),
    }
  )
);

// ============================================================================
// セレクター（パフォーマンス最適化）
// ============================================================================

/** テーマ状態の取得 */
export const useTheme = () => {
  const theme = useUIStore(state => state.theme);
  const setTheme = useUIStore(state => state.setTheme);
  const resolvedTheme = resolveTheme(theme);
  
  return {
    theme,
    resolvedTheme,
    setTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };
};

/** モーダル状態の取得 */
export const useModal = (modalId: string) => {
  const isOpen = useUIStore(state => state.modals[modalId] || false);
  const toggleModal = useUIStore(state => state.toggleModal);
  
  return {
    isOpen,
    open: () => toggleModal(modalId, true),
    close: () => toggleModal(modalId, false),
    toggle: () => toggleModal(modalId),
  };
};

/** サイドバー状態の取得 */
export const useSidebar = () => {
  const sidebar = useUIStore(state => state.sidebar);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const toggleSidebarCollapse = useUIStore(state => state.toggleSidebarCollapse);
  
  return {
    ...sidebar,
    toggle: toggleSidebar,
    toggleCollapse: toggleSidebarCollapse,
    open: () => toggleSidebar(true),
    close: () => toggleSidebar(false),
    collapse: () => toggleSidebarCollapse(true),
    expand: () => toggleSidebarCollapse(false),
  };
};

/** ローディング状態の取得 */
export const useLoading = (key?: string) => {
  const globalLoading = useUIStore(state => state.loading.global);
  const specificLoading = useUIStore(state => key ? state.loading.states[key] || false : false);
  const setGlobalLoading = useUIStore(state => state.setGlobalLoading);
  const setLoadingState = useUIStore(state => state.setLoadingState);
  
  return {
    isLoading: key ? specificLoading : globalLoading,
    globalLoading,
    setGlobalLoading,
    setLoading: key ? (loading: boolean) => setLoadingState(key, loading) : setGlobalLoading,
  };
};

/** トースト状態の取得 */
export const useToasts = () => {
  const toasts = useUIStore(state => state.toasts);
  const addToast = useUIStore(state => state.addToast);
  const removeToast = useUIStore(state => state.removeToast);
  const clearToasts = useUIStore(state => state.clearToasts);
  
  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    // 便利メソッド
    success: (message: string, options?: Partial<Omit<ToastState, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'success', message, ...options }),
    error: (message: string, options?: Partial<Omit<ToastState, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'error', message, ...options }),
    warning: (message: string, options?: Partial<Omit<ToastState, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message: string, options?: Partial<Omit<ToastState, 'id' | 'type' | 'message'>>) =>
      addToast({ type: 'info', message, ...options }),
  };
};

// ============================================================================
// システムテーマ変更の監視
// ============================================================================

if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleSystemThemeChange = () => {
    const currentTheme = useUIStore.getState().theme;
    if (currentTheme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  };
  
  mediaQuery.addEventListener('change', handleSystemThemeChange);
}
