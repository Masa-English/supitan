'use client';

import { create } from 'zustand';
import { DatabaseService } from '@/lib/database';
import type { Word, Category, ReviewWord } from '@/lib/types';

interface DataState {
  // 単語データ
  words: Word[];
  wordsLoading: boolean;
  wordsError: string | null;
  
  // カテゴリーデータ
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // 復習単語
  reviewWords: ReviewWord[];
  reviewWordsLoading: boolean;
  reviewWordsError: string | null;
  
  // 検索・フィルタリング
  searchQuery: string;
  searchFilters: {
    categories: string[];
    favoritesOnly: boolean;
    masteredOnly: boolean;
    unstudiedOnly: boolean;
  };
  filteredWords: Word[];
  
  // キャッシュ管理
  cache: {
    wordsByCategory: Record<string, Word[]>;
    lastUpdated: Record<string, number>;
  };
  
  // アクション
  loadWords: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadReviewWords: (userId: string) => Promise<void>;
  getWordsByCategory: (category: string) => Promise<Word[]>;
  searchWords: (query: string) => void;
  updateFilters: (filters: Partial<DataState['searchFilters']>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  refreshCache: () => void;
  clearData: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分

export const useDataStore = create<DataState>((set, get) => ({
  // 初期状態
  words: [],
  wordsLoading: false,
  wordsError: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  reviewWords: [],
  reviewWordsLoading: false,
  reviewWordsError: null,
  searchQuery: '',
  searchFilters: {
    categories: [],
    favoritesOnly: false,
    masteredOnly: false,
    unstudiedOnly: false,
  },
  filteredWords: [],
  cache: {
    wordsByCategory: {},
    lastUpdated: {},
  },

  // 単語データ読み込み
  loadWords: async () => {
    try {
      set({ wordsLoading: true, wordsError: null });
      const db = new DatabaseService();
      const words = await db.getWords();
      set({ words, wordsLoading: false });
      
      // フィルタリングを再実行
      get().applyFilters();
    } catch (error) {
      console.error('単語データ読み込みエラー:', error);
      set({ 
        wordsError: error instanceof Error ? error.message : '単語データの取得に失敗しました',
        wordsLoading: false 
      });
    }
  },

  // カテゴリーデータ読み込み
  loadCategories: async () => {
    try {
      set({ categoriesLoading: true, categoriesError: null });
      const db = new DatabaseService();
      const categories = await db.getCategories();
      set({ categories, categoriesLoading: false });
    } catch (error) {
      console.error('カテゴリーデータ読み込みエラー:', error);
      set({ 
        categoriesError: error instanceof Error ? error.message : 'カテゴリーデータの取得に失敗しました',
        categoriesLoading: false 
      });
    }
  },

  // 復習単語読み込み
  loadReviewWords: async (userId: string) => {
    try {
      set({ reviewWordsLoading: true, reviewWordsError: null });
      const db = new DatabaseService();
      const reviewWords = await db.getDueReviewWords(userId);
      set({ reviewWords, reviewWordsLoading: false });
    } catch (error) {
      console.error('復習単語読み込みエラー:', error);
      set({ 
        reviewWordsError: error instanceof Error ? error.message : '復習単語の取得に失敗しました',
        reviewWordsLoading: false 
      });
    }
  },

  // カテゴリー別単語取得（キャッシュ付き）
  getWordsByCategory: async (category: string) => {
    const { cache } = get();
    const now = Date.now();
    
    // キャッシュが有効な場合はキャッシュから返す
    if (cache.wordsByCategory[category] && 
        cache.lastUpdated[category] && 
        (now - cache.lastUpdated[category]) < CACHE_DURATION) {
      return cache.wordsByCategory[category];
    }
    
    try {
      const db = new DatabaseService();
      const words = await db.getWordsByCategory(category);
      
      // キャッシュを更新
      set(state => ({
        cache: {
          ...state.cache,
          wordsByCategory: {
            ...state.cache.wordsByCategory,
            [category]: words
          },
          lastUpdated: {
            ...state.cache.lastUpdated,
            [category]: now
          }
        }
      }));
      
      return words;
    } catch (error) {
      console.error('カテゴリー別単語取得エラー:', error);
      throw error;
    }
  },

  // 検索実行
  searchWords: (query: string) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  // フィルター更新
  updateFilters: (filters: Partial<DataState['searchFilters']>) => {
    set(state => ({
      searchFilters: { ...state.searchFilters, ...filters }
    }));
    get().applyFilters();
  },

  // フィルタークリア
  clearFilters: () => {
    set({
      searchQuery: '',
      searchFilters: {
        categories: [],
        favoritesOnly: false,
        masteredOnly: false,
        unstudiedOnly: false,
      }
    });
    get().applyFilters();
  },

  // フィルタリング適用
  applyFilters: () => {
    const { words, searchQuery, searchFilters } = get();
    
    let filtered = [...words];
    
    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.japanese.toLowerCase().includes(query) ||
        word.phonetic?.toLowerCase().includes(query) ||
        word.category.toLowerCase().includes(query)
      );
    }
    
    // カテゴリーフィルター
    if (searchFilters.categories.length > 0) {
      filtered = filtered.filter(word => 
        searchFilters.categories.includes(word.category)
      );
    }
    
    // お気に入りのみ
    if (searchFilters.favoritesOnly) {
      filtered = filtered.filter(word => word.is_favorite);
    }
    
    // マスター済みのみ
    if (searchFilters.masteredOnly) {
      filtered = filtered.filter(word => 
        word.mastery_level !== null && word.mastery_level !== undefined && word.mastery_level >= 0.8
      );
    }
    
    // 未学習のみ
    if (searchFilters.unstudiedOnly) {
      filtered = filtered.filter(word => 
        word.study_count === null || word.study_count === 0
      );
    }
    
    set({ filteredWords: filtered });
  },

  // キャッシュリフレッシュ
  refreshCache: () => {
    set({
      cache: {
        wordsByCategory: {},
        lastUpdated: {},
      }
    });
  },

  // データクリア
  clearData: () => {
    set({
      words: [],
      categories: [],
      reviewWords: [],
      searchQuery: '',
      searchFilters: {
        categories: [],
        favoritesOnly: false,
        masteredOnly: false,
        unstudiedOnly: false,
      },
      filteredWords: [],
      cache: {
        wordsByCategory: {},
        lastUpdated: {},
      },
      wordsLoading: false,
      wordsError: null,
      categoriesLoading: false,
      categoriesError: null,
      reviewWordsLoading: false,
      reviewWordsError: null,
    });
  },
}));
