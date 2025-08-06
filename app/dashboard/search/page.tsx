'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { DatabaseService } from '@/lib/database';
import { Word } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Volume2, X, BookOpen, ChevronDown, ChevronUp, Star, Sparkles } from 'lucide-react';
import { 
  getAllCategories
} from '@/lib/categories';
import { CategoryBadge } from '@/components/common';

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
    <Card className="group relative bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer overflow-hidden">
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-5 sm:p-6">
        <div className="space-y-4">
          {/* ヘッダー部分 */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300 truncate writing-mode-horizontal text-orientation-mixed">
                {word.word}
              </h3>
              {word.phonetic && (
                <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5 mt-2 font-mono writing-mode-horizontal text-orientation-mixed">
                  {word.phonetic}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={playAudio}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-2 h-9 w-9 rounded-full"
                title="音声を再生"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10 p-2 h-9 w-9 rounded-full"
                title="お気に入りに追加"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 日本語訳 */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors duration-300 writing-mode-horizontal text-orientation-mixed font-sans">
              {word.japanese}
            </p>
          </div>

          {/* フッター部分 */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30">
            <CategoryBadge 
              categoryName={word.category} 
              showIcon={true} 
              showPos={true}
              variant="outline"
              size="sm"
              className="group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300"
            />
            <div className="flex items-center gap-1 text-xs text-muted-foreground writing-mode-horizontal text-orientation-mixed">
              <Sparkles className="h-3 w-3" />
              <span>学習中</span>
            </div>
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
  icon,
  count
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 min-h-[2.5rem] relative overflow-hidden writing-mode-horizontal text-orientation-mixed ${
        isActive
          ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/20'
          : 'bg-muted/50 text-muted-foreground border border-border/50 hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:border-primary/30'
      }`}
    >
      {icon && <span className="text-base">{icon}</span>}
      <span className="truncate writing-mode-horizontal text-orientation-mixed">{label}</span>
      {count !== undefined && (
        <Badge 
          variant="secondary" 
          className={`ml-1 text-xs font-bold writing-mode-horizontal text-orientation-mixed ${
            isActive 
              ? 'bg-primary/20 text-primary border-primary/30' 
              : 'bg-background/80 text-muted-foreground'
          }`}
        >
          {count}
        </Badge>
      )}
    </button>
  );
}

// フィルターセクションコンポーネント
function FilterSection({ 
  title, 
  children, 
  isExpanded, 
  onToggle,
  count
}: { 
  title: string; 
  children: React.ReactNode; 
  isExpanded: boolean; 
  onToggle: () => void;
  count?: number;
}) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-3 text-left hover:bg-accent/50 transition-all duration-300 rounded-lg group"
        aria-expanded={isExpanded}
        aria-label={`${title}セクションを${isExpanded ? '閉じる' : '開く'}`}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors duration-300 writing-mode-horizontal text-orientation-mixed">
            {title}
          </span>
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 writing-mode-horizontal text-orientation-mixed">
              {count}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="pb-4 px-3 animate-in slide-in-from-top-2 duration-300">
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
  onClearFilters,
  wordCounts
}: { 
  filters: {
    categories: string[];
    favoritesOnly: boolean;
  }; 
  onFilterChange: (key: string, value: string[] | boolean) => void; 
  onClearFilters: () => void;
  wordCounts: {
    categories: Record<string, number>;
    favorites: number;
  };
}) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    favorites: true
  });

  // 共通のカテゴリー設定を使用
  const categories = getAllCategories();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCategory = (categoryName: string) => {
    if (filters.categories.includes(categoryName)) {
      onFilterChange('categories', filters.categories.filter(c => c !== categoryName));
    } else {
      onFilterChange('categories', [...filters.categories, categoryName]);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/90 backdrop-blur-sm border border-border/50 shadow-xl">
      <CardHeader className="pb-4 sm:pb-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-3 writing-mode-horizontal text-orientation-mixed">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            フィルター
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-all duration-300"
            title="フィルターをクリア"
          >
            <X className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline writing-mode-horizontal text-orientation-mixed">クリア</span>
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
            count={filters.categories.length > 0 ? filters.categories.length : undefined}
          >
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  isActive={filters.categories.includes(category.name)}
                  onClick={() => toggleCategory(category.name)}
                  count={wordCounts.categories[category.name]}
                  icon={<span className="text-base">{category.icon}</span>}
                />
              ))}
            </div>
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

  // 単語カウントの計算
  const wordCounts = useMemo(() => {
    const categories: Record<string, number> = {};
    const favorites = 0;

    words.forEach(word => {
      // カテゴリーカウント
      categories[word.category] = (categories[word.category] || 0) + 1;
      
      // お気に入りカウント（実装状況に応じて調整）
      // if (word.isFavorite) favorites++;
    });

    return { categories, favorites };
  }, [words]);

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

    // お気に入りフィルター
    if (filters.favoritesOnly) {
      // お気に入り機能は実装済みのため、実際のフィルタリングを実装
      // 現在は全単語を表示（お気に入り機能の実装状況に応じて調整）
      // filtered = filtered.filter(word => word.isFavorite);
    }

    setFilteredWords(filtered);
  }, [words, searchQuery, filters]);

  const handleFilterChange = (key: string, value: string[] | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      favoritesOnly: false
    });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
              <span className="text-muted-foreground font-medium writing-mode-horizontal text-orientation-mixed">単語を読み込み中...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <p className="text-destructive mb-6 text-lg writing-mode-horizontal text-orientation-mixed">{error}</p>
            <Button onClick={loadWords} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg">
              <span className="writing-mode-horizontal text-orientation-mixed">再試行</span>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent writing-mode-horizontal text-orientation-mixed">
                    単語検索・フィルター
                  </h1>
                  <p className="text-muted-foreground mt-1 writing-mode-horizontal text-orientation-mixed font-sans">効率的に単語を検索・管理</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 px-4 py-2 text-sm font-semibold w-fit writing-mode-horizontal text-orientation-mixed">
                {filteredWords.length}個の単語
              </Badge>
            </div>
          </div>

          {/* 縦並びレイアウト */}
          <div className="space-y-8">
            {/* フィルターパネル */}
            <div className="w-full">
              <FilterPanel 
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                wordCounts={wordCounts}
              />
            </div>

            {/* 検索バー */}
            <div className="w-full">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    type="text"
                    placeholder="単語、意味、カテゴリーで検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 sm:pl-14 border-border/50 focus:border-primary focus:ring-primary/20 bg-background/80 backdrop-blur-sm h-12 sm:h-14 text-base rounded-xl transition-all duration-300 focus:bg-background writing-mode-horizontal text-orientation-mixed w-full"
                  />
                </div>
              </div>
            </div>

            {/* 検索結果 */}
            <div className="w-full">
              {filteredWords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                  {filteredWords.map((word, index) => (
                    <div
                      key={word.id}
                      className="animate-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <WordCard word={word} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="p-6 bg-muted/30 rounded-2xl inline-block mb-6">
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 writing-mode-horizontal text-orientation-mixed">
                    単語が見つかりませんでした
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto writing-mode-horizontal text-orientation-mixed font-sans">
                    検索条件を変更するか、フィルターをクリアしてみてください
                  </p>
                  <Button 
                    onClick={clearFilters} 
                    variant="outline" 
                    className="border-border/50 text-foreground hover:bg-accent hover:border-primary/30 px-6 py-3 rounded-lg transition-all duration-300"
                  >
                    <span className="writing-mode-horizontal text-orientation-mixed">フィルターをクリア</span>
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