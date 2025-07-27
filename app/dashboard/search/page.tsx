'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Volume2, Heart, X, BookOpen, Star, ChevronDown, ChevronUp } from 'lucide-react';

// 単語カードコンポーネント
function WordCard({ word }: { word: Word }) {
  const playAudio = () => {
    if (word.word) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="group bg-card backdrop-blur-sm border border-border hover:border-primary hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center space-y-3 sm:space-y-4">
          {/* 単語と発音 */}
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
              {word.word}
            </h3>
            {word.phonetic && (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground bg-muted">
                {word.phonetic}
              </Badge>
            )}
          </div>

          {/* 日本語訳 */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {word.japanese}
          </p>

          {/* カテゴリー */}
          <Badge className="text-xs bg-primary/10 text-primary border-0">
            {word.category}
          </Badge>

          {/* アクションボタン */}
          <div className="flex items-center justify-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// フィルターチップコンポーネント
function FilterChip({ 
  label, 
  isActive, 
  onClick, 
  icon 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// フィルターセクションコンポーネント
function FilterSection({ 
  title, 
  children, 
  isExpanded, 
  onToggle 
}: { 
  title: string; 
  children: React.ReactNode; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-accent transition-colors"
      >
        <span className="font-medium text-foreground text-sm sm:text-base">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

// フィルターコンポーネント
function FilterPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters 
}: { 
  filters: {
    categories: string[];
    difficultyLevels: number[];
    favoritesOnly: boolean;
  }; 
  onFilterChange: (key: string, value: string[] | number[] | boolean) => void; 
  onClearFilters: () => void; 
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    difficulty: true,
    favorites: true
  });

  const categories = [
    '動詞', '名詞', '形容詞', '副詞', '前置詞', '接続詞', '代名詞', '冠詞'
  ];

  const difficultyLevels = [
    { value: 1, label: '初級', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { value: 2, label: '中級', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { value: 3, label: '上級', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    { value: 4, label: '専門', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { value: 5, label: 'マスター', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCategory = (category: string) => {
    if (filters.categories.includes(category)) {
      onFilterChange('categories', filters.categories.filter(c => c !== category));
    } else {
      onFilterChange('categories', [...filters.categories, category]);
    }
  };

  const toggleDifficulty = (level: number) => {
    if (filters.difficultyLevels.includes(level)) {
      onFilterChange('difficultyLevels', filters.difficultyLevels.filter(d => d !== level));
    } else {
      onFilterChange('difficultyLevels', [...filters.difficultyLevels, level]);
    }
  };

  const toggleFavorites = () => {
    onFilterChange('favoritesOnly', !filters.favoritesOnly);
  };

  return (
    <Card className="bg-card backdrop-blur-sm border border-border shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            フィルター
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-destructive p-2"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">クリア</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* カテゴリーフィルター */}
          <FilterSection
            title="カテゴリー"
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  label={category}
                  isActive={filters.categories.includes(category)}
                  onClick={() => toggleCategory(category)}
                />
              ))}
            </div>
          </FilterSection>

          {/* 難易度フィルター */}
          <FilterSection
            title="難易度"
            isExpanded={expandedSections.difficulty}
            onToggle={() => toggleSection('difficulty')}
          >
            <div className="flex flex-wrap gap-2">
              {difficultyLevels.map((level) => (
                <FilterChip
                  key={level.value}
                  label={level.label}
                  isActive={filters.difficultyLevels.includes(level.value)}
                  onClick={() => toggleDifficulty(level.value)}
                />
              ))}
            </div>
          </FilterSection>

          {/* お気に入りフィルター */}
          <FilterSection
            title="お気に入り"
            isExpanded={expandedSections.favorites}
            onToggle={() => toggleSection('favorites')}
          >
            <FilterChip
              label="お気に入りのみ"
              isActive={filters.favoritesOnly}
              onClick={toggleFavorites}
              icon={<Star className="h-3 w-3 sm:h-4 sm:w-4" />}
            />
          </FilterSection>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [] as string[],
    difficultyLevels: [] as number[],
    favoritesOnly: false
  });

  const db = useMemo(() => new DatabaseService(), []);

  // 単語データの読み込み
  const loadWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const wordsData = await db.getWords();
      setWords(wordsData);
      setFilteredWords(wordsData);
    } catch (err) {
      console.error('Search page error:', err);
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // 検索・フィルタリング処理
  useEffect(() => {
    let filtered = words;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.japanese.toLowerCase().includes(query) ||
        word.category.toLowerCase().includes(query) ||
        (word.phonetic && word.phonetic.toLowerCase().includes(query))
      );
    }

    // カテゴリーフィルター
    if (filters.categories.length > 0) {
      filtered = filtered.filter(word => filters.categories.includes(word.category));
    }

    // 難易度フィルター
    if (filters.difficultyLevels.length > 0) {
      filtered = filtered.filter(word => 
        word.difficulty_level && filters.difficultyLevels.includes(word.difficulty_level)
      );
    }

    // お気に入りフィルター（将来的に実装）
    if (filters.favoritesOnly) {
      // TODO: お気に入り機能が実装されたら追加
      // filtered = filtered.filter(word => word.isFavorite);
    }

    setFilteredWords(filtered);
  }, [words, searchQuery, filters]);

  const handleFilterChange = (key: string, value: string[] | number[] | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      difficultyLevels: [],
      favoritesOnly: false
    });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">単語を読み込み中...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadWords} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              再試行
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                単語検索・フィルター
              </h1>
              <Badge className="bg-primary/10 text-primary border-0 w-fit">
                {filteredWords.length}個の単語
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* フィルターパネル */}
            <div className="lg:col-span-1">
              <FilterPanel 
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* 検索バー */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="単語、意味、カテゴリーで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 border-border focus:border-primary focus:ring-primary bg-background backdrop-blur-sm h-10 sm:h-12"
                  />
                </div>
              </div>

              {/* 検索結果 */}
              {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredWords.map((word) => (
                    <WordCard key={word.id} word={word} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    単語が見つかりませんでした
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">
                    検索条件を変更してみてください
                  </p>
                  <Button onClick={clearFilters} variant="outline" className="border-border text-foreground hover:bg-accent">
                    フィルターをクリア
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 