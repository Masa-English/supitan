'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/feedback/progress';
import { Badge } from '@/components/ui/navigation/badge';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import type { AppStats } from '@/lib/types';

interface StatisticsDashboardProps {
  stats: AppStats;
  isLoading?: boolean;
}

export function StatisticsDashboard({ stats, isLoading = false }: StatisticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const {
    total_words_studied,
    total_correct_answers,
    total_incorrect_answers,
    current_streak,
    longest_streak,
    total_study_sessions,
    average_accuracy,
    words_mastered,
    total_words,
    study_time_minutes,
    favorite_words_count,
  } = stats;

  const masteryProgress = total_words > 0 ? (words_mastered / total_words) * 100 : 0;
  const overallAccuracy = total_words_studied > 0 
    ? (total_correct_answers / (total_correct_answers + total_incorrect_answers)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* 主要統計 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学習単語数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_words_studied}</div>
            <p className="text-sm text-muted-foreground">
              総単語数: {total_words}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">正解率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              平均: {average_accuracy.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">連続学習</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{current_streak}</div>
            <p className="text-sm text-muted-foreground">
              最長: {longest_streak}日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">学習セッション</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_study_sessions}</div>
            <p className="text-sm text-muted-foreground">
              総学習時間: {study_time_minutes}分
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細統計 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              マスター進捗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">マスター済み単語</span>
              <Badge variant="secondary">
                {words_mastered} / {total_words}
              </Badge>
            </div>
            <Progress value={masteryProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {masteryProgress.toFixed(1)}% マスター済み
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              お気に入り
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorite_words_count}</div>
            <p className="text-sm text-muted-foreground">
              お気に入り登録済み単語
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 学習詳細 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            学習詳細
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {total_correct_answers}
              </div>
              <p className="text-sm text-muted-foreground">正解数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {total_incorrect_answers}
              </div>
              <p className="text-sm text-muted-foreground">不正解数</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {total_correct_answers + total_incorrect_answers}
              </div>
              <p className="text-sm text-muted-foreground">総回答数</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}