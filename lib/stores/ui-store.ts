'use client';

import { create } from 'zustand';

interface UIState {
  // モーダル管理
  modals: {
    completion: boolean;
    tutorial: boolean;
    settings: boolean;
    profile: boolean;
    [key: string]: boolean;
  };
  
  // サイドメニュー
  sideMenu: {
    isOpen: boolean;
    activeSection: string | null;
  };
  
  // 通知・トースト
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: number;
  }>;
  
  // ローディング状態
  loading: {
    global: boolean;
    page: boolean;
    action: boolean;
  };
  
  // エラー状態
  errors: Array<{
    id: string;
    message: string;
    code?: string;
    timestamp: number;
  }>;
  
  // アクション
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  closeAllModals: () => void;
  toggleSideMenu: () => void;
  openSideMenu: () => void;
  closeSideMenu: () => void;
  setActiveSection: (section: string | null) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (type: keyof UIState['loading'], loading: boolean) => void;
  addError: (error: Omit<UIState['errors'][0], 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  clearUI: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // 初期状態
  modals: {
    completion: false,
    tutorial: false,
    settings: false,
    profile: false,
  },
  sideMenu: {
    isOpen: false,
    activeSection: null,
  },
  notifications: [],
  loading: {
    global: false,
    page: false,
    action: false,
  },
  errors: [],

  // モーダル管理
  openModal: (modalName: string) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: true,
      }
    }));
  },

  closeModal: (modalName: string) => {
    set(state => ({
      modals: {
        ...state.modals,
        [modalName]: false,
      }
    }));
  },

  closeAllModals: () => {
    set(_state => ({
      modals: {
        completion: false,
        tutorial: false,
        settings: false,
        profile: false,
      }
    }));
  },

  // サイドメニュー管理
  toggleSideMenu: () => {
    set(state => ({
      sideMenu: {
        ...state.sideMenu,
        isOpen: !state.sideMenu.isOpen,
      }
    }));
  },

  openSideMenu: () => {
    set(state => ({
      sideMenu: {
        ...state.sideMenu,
        isOpen: true,
      }
    }));
  },

  closeSideMenu: () => {
    set(state => ({
      sideMenu: {
        ...state.sideMenu,
        isOpen: false,
      }
    }));
  },

  setActiveSection: (section: string | null) => {
    set(state => ({
      sideMenu: {
        ...state.sideMenu,
        activeSection: section,
      }
    }));
  },

  // 通知管理
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    set(state => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, timestamp }
      ]
    }));

    // 自動削除（デフォルト5秒）
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // ローディング管理
  setLoading: (type: keyof UIState['loading'], loading: boolean) => {
    set(state => ({
      loading: {
        ...state.loading,
        [type]: loading,
      }
    }));
  },

  // エラー管理
  addError: (error) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    
    set(state => ({
      errors: [
        ...state.errors,
        { ...error, id, timestamp }
      ]
    }));
  },

  removeError: (id: string) => {
    set(state => ({
      errors: state.errors.filter(e => e.id !== id)
    }));
  },

  clearErrors: () => {
    set({ errors: [] });
  },

  // UI全体クリア
  clearUI: () => {
    set({
      modals: {
        completion: false,
        tutorial: false,
        settings: false,
        profile: false,
      },
      sideMenu: {
        isOpen: false,
        activeSection: null,
      },
      notifications: [],
      loading: {
        global: false,
        page: false,
        action: false,
      },
      errors: [],
    });
  },
}));
