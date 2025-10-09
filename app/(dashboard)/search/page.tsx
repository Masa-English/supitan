'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Input } from '@/components/ui/form/input';
import { Label } from '@/components/ui/form/label';
import { Badge } from '@/components/ui/navigation/badge';
import { Button } from '@/components/ui/button/button';
import { dataProvider } from '@/lib/api/services/data-provider';
import { Word, CategoryWithStats } from '@/lib/types';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Volume2, 
  Eye, 
  EyeOff,
  X,
  Loader2
} from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データの初期読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [wordsData, categoriesData] = await Promise.all([
          dataProvider.getAllWords(),
          dataProvider.getCategories()
        ]);
        setWords(wordsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('データ読み込みエラー:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // フィルタリングされた単語リスト
  const filteredWords = useMemo(() => {
    return words.filter(word => {
      const matchesSearch = searchTerm === '' || 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (word.phonetic && word.phonetic.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === '' || word.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [words, searchTerm, selectedCategory]);

  // 音声再生機能
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // フィルターのクリア
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>データを読み込み中...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                再読み込み
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Search className="w-8 h-8" />
            単語検索
          </h1>
          <p className="text-muted-foreground">英単語や日本語で検索して、単語の詳細を確認できます</p>
        </div>

        {/* 検索・フィルター */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              検索・フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="search">単語検索</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="英単語または日本語で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">カテゴリー</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="">すべてのカテゴリー</option>
                  {categories.map((category) => (
                    <option key={category.category} value={category.category}>
                      {category.category} ({category.count}語)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowMeaning(!showMeaning)}
                  className="flex items-center gap-2"
                >
                  {showMeaning ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showMeaning ? '意味を隠す' : '意味を表示'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  クリア
                </Button>
              </div>
            </div>
            
            {/* 検索結果数 */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredWords.length}件の単語が見つかりました
              </p>
              {(searchTerm || selectedCategory) && (
                <div className="flex items-center gap-2">
                  {searchTerm && (
                    <Badge variant="secondary">
                      検索: &quot;{searchTerm}&quot;
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary">
                      カテゴリー: {selectedCategory}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 検索結果 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => (
            <Card key={word.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* 英単語と音声 */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">{word.word}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playAudio(word.word)}
                      className="p-2"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* 発音記号 */}
                  {word.phonetic && (
                    <p className="text-sm text-muted-foreground font-mono">
                      /{word.phonetic}/
                    </p>
                  )}

                  {/* 日本語意味 */}
                  {showMeaning && (
                    <p className="text-foreground font-medium">{word.japanese}</p>
                  )}

                  {/* カテゴリーとセクション */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{word.category}</Badge>
                    {word.section && (
                      <Badge variant="secondary">セクション {word.section}</Badge>
                    )}
                  </div>

                  {/* 例文 */}
                  {word.example1 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">例文:</p>
                      <p className="text-sm italic">{word.example1}</p>
                      {word.example1_jp && showMeaning && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {word.example1_jp}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 検索結果が空の場合 */}
        {filteredWords.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                検索結果が見つかりません
              </h3>
              <p className="text-muted-foreground mb-4">
                検索条件を変更して再度お試しください
              </p>
              <Button onClick={clearFilters}>
                フィルターをクリア
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}