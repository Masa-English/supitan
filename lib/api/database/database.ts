import { createClient as createBrowserClient } from '../supabase/client';
import { createServiceClient } from '../supabase/service';
import { Word, UserProgress, StudySession, ReviewWord, ReviewSession, AppStats, UserProfile, LearningRecord, LearningRecordSnapshot } from '@/lib/types';

export class DatabaseService {
  private supabase = this.getSupabaseClient();

  private getSupabaseClient() {
    // ビルド時やサーバーサイドではサービスロールクライアントを使用
    if (typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        return createServiceClient();
      } catch (error) {
        console.warn('Failed to create service client, falling back to browser client:', error);
        return createBrowserClient();
      }
    }
    return createBrowserClient();
  }

  // 単語関連
  async getWords(): Promise<Word[]> {
    const { data, error } = await this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          color,
          sort_order,
          is_active
        )
      `)
      .order('word', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getWordsByCategory(categoryKey: string): Promise<Word[]> {
    const formatSupabaseError = (err: unknown) => {
      if (err && typeof err === 'object') {
        const errorObj = err as { message?: string; code?: string; details?: string; hint?: string };
        return {
          message: errorObj.message,
          code: errorObj.code,
          details: errorObj.details,
          hint: errorObj.hint,
        };
      }
      return {
        message: String(err),
        code: undefined,
        details: undefined,
        hint: undefined,
      };
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const key = categoryKey?.trim();
    console.log(`Database: Searching for category key: ${key}`);

    let resolvedCategoryId = key;

    // ID以外（名称・短縮ID）の場合はカテゴリテーブルから正規のIDを解決
    if (!uuidRegex.test(key)) {
      const { data: categoryByNameOrId, error: lookupError } = await this.supabase
        .from('categories')
        .select('id,name')
        .eq('is_active', true)
        .or(`id.eq.${key},name.eq.${key}`)
        .limit(1)
        .maybeSingle();

      if (lookupError && lookupError.code !== 'PGRST116') {
        console.warn('Category lookup error (name/id match):', formatSupabaseError(lookupError));
      }

      if (categoryByNameOrId?.id) {
        resolvedCategoryId = categoryByNameOrId.id;
      } else if (key.length <= 8) {
        const { data: categoryByShortId, error: shortLookupError } = await this.supabase
          .from('categories')
          .select('id,name')
          .eq('is_active', true)
          .like('id', `${key}%`)
          .limit(1)
          .maybeSingle();

        if (shortLookupError && shortLookupError.code !== 'PGRST116') {
          console.warn('Category lookup error (short ID match):', formatSupabaseError(shortLookupError));
        }

        if (categoryByShortId?.id) {
          resolvedCategoryId = categoryByShortId.id;
        }
      }
    }

    // 無効なIDはクエリせずに空配列を返す
    if (!uuidRegex.test(resolvedCategoryId)) {
      console.warn('Resolved category ID is not a valid UUID. Skipping query.', {
        categoryKey,
        resolvedCategoryId
      });
      return [];
    }

    const { data, error } = await this.supabase
      .from('words')
      .select(`
        *,
        categories (
          id,
          name,
          description,
          color,
          sort_order,
          is_active
        )
      `)
      .eq('category_id', resolvedCategoryId)
      .eq('is_active', true)
      .order('word', { ascending: true });

    if (error) {
      console.error(`Database error for category "${categoryKey}" (resolved: "${resolvedCategoryId}")`, formatSupabaseError(error));
      throw error;
    }

    console.log(`Database: Found ${data?.length || 0} words for category ID "${resolvedCategoryId}"`);
    return data || [];
  }

  async getCategories(): Promise<{ category: string; id: string; count: number; description: string; color: string; sort_order: number; is_active: boolean }[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id,name,description,color,sort_order,is_active,words(count)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Database error getting categories:', error);
      throw error;
    }

    return (data || []).map(category => ({
      category: category.name,
      id: category.id,
      count: (category.words && category.words[0]?.count) || 0,
      description: category.description || '',
      color: category.color || '#3b82f6',
      sort_order: category.sort_order || 0,
      is_active: category.is_active || true
    }));
  }

  // ユーザープログレス関連
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('getUserProgress error:', {
          error,
          userId,
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // 406エラーの場合は空配列を返す（一時的な回避策）
        if (error.code === '406') {
          console.warn('RLS policy issue detected, returning empty array');
          return [];
        }
        
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('getUserProgress exception:', error);
      throw error;
    }
  }

  async getWordProgress(userId: string, wordId: string): Promise<UserProgress | null> {
    const { data, error } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('getWordProgress error:', {
        error,
        userId,
        wordId,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    return data;
  }

  async upsertProgress(progress: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    // データの整合性チェック
    if (!progress.user_id || !progress.word_id) {
      throw new Error('user_id and word_id are required');
    }

    // UUID形式の検証
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(progress.user_id) || !uuidRegex.test(progress.word_id)) {
      throw new Error('Invalid UUID format');
    }

    if (progress.mastery_level !== null && (progress.mastery_level < 0 || progress.mastery_level > 1)) {
      throw new Error('mastery_level must be between 0 and 1');
    }

    if (progress.study_count !== null && (progress.study_count < 0 || progress.study_count > 10000)) {
      throw new Error('study_count must be between 0 and 10000');
    }

    if (progress.correct_count !== null && (progress.correct_count < 0 || progress.correct_count > 10000)) {
      throw new Error('correct_count must be between 0 and 10000');
    }

    if (progress.incorrect_count !== null && (progress.incorrect_count < 0 || progress.incorrect_count > 10000)) {
      throw new Error('incorrect_count must be between 0 and 10000');
    }

    // 既存のレコードを確認
    const { data: existingProgress, error: selectError } = await this.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', progress.user_id)
      .eq('word_id', progress.word_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing progress:', {
        code: selectError.code,
        message: selectError.message
      });
      throw new Error('Database operation failed');
    }

    if (existingProgress) {
      // 既存レコードがある場合は更新
      const { error: updateError } = await this.supabase
        .from('user_progress')
        .update({
          ...progress,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', progress.user_id)
        .eq('word_id', progress.word_id);

      if (updateError) {
        console.error('updateProgress error:', {
          code: updateError.code,
          message: updateError.message
        });
        throw new Error('Database update failed');
      }
    } else {
      // 既存レコードがない場合は挿入
      const { error: insertError } = await this.supabase
        .from('user_progress')
        .insert({
          ...progress,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('insertProgress error:', {
          code: insertError.code,
          message: insertError.message
        });
        throw new Error('Database insert failed');
      }
    }
  }

  /**
   * 復習結果を反映し、次回復習日時をSM-2簡易計算で更新
   */
  async applyReviewResult(
    userId: string,
    wordId: string,
    options: { isCorrect: boolean; difficultyLevel?: number } = { isCorrect: true }
  ): Promise<UserProgress> {
    const difficultyLevel = options.difficultyLevel ?? 3; // 1-5

    const current = await this.getWordProgress(userId, wordId);

    const now = new Date();
    let easeFactor = current?.ease_factor ?? 2.5;
    let intervalDays = current?.review_interval_days ?? 1;
    let masteryLevel = current?.mastery_level ?? 0;

    if (options.isCorrect) {
      easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - difficultyLevel) * (0.08 + (5 - difficultyLevel) * 0.02))
      );
      intervalDays = Math.max(1, Math.ceil(intervalDays * easeFactor));
      masteryLevel = Math.min(1, masteryLevel + 0.1);
    } else {
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      intervalDays = 1;
      masteryLevel = Math.max(0, masteryLevel - 0.2);
    }

    const nextReviewAt = new Date(now);
    nextReviewAt.setDate(now.getDate() + intervalDays);

    const updatedProgress: Omit<UserProgress, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      word_id: wordId,
      mastery_level: masteryLevel,
      study_count: (current?.study_count ?? 0) + 1,
      correct_count: (current?.correct_count ?? 0) + (options.isCorrect ? 1 : 0),
      incorrect_count: (current?.incorrect_count ?? 0) + (options.isCorrect ? 0 : 1),
      last_studied: now.toISOString(),
      is_favorite: current?.is_favorite ?? false,
      next_review_at: nextReviewAt.toISOString(),
      review_interval_days: intervalDays,
      ease_factor: easeFactor
    };

    await this.upsertProgress(updatedProgress);

    return {
      ...updatedProgress,
      id: current?.id ?? '',
      created_at: current?.created_at ?? now.toISOString(),
      updated_at: now.toISOString()
    };
  }

  async updateProgress(userId: string, wordId: string, updates: Partial<UserProgress>): Promise<void> {
    const { error } = await this.supabase
      .from('user_progress')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  // 学習セッション関連
  async createStudySession(session: Omit<StudySession, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('study_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateStudySession(sessionId: string, updates: Partial<StudySession>): Promise<void> {
    const { error } = await this.supabase
      .from('study_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 復習リスト関連
  async getReviewWords(userId: string): Promise<ReviewWord[]> {
    const { data, error } = await this.supabase
      .from('review_words')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDueReviewWords(userId: string): Promise<ReviewWord[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('review_words')
      .select('*')
      .eq('user_id', userId)
      .or(`next_review.is.null,next_review.lte.${now}`)
      .order('next_review', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addToReview(userId: string, wordId: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .insert({
        user_id: userId,
        word_id: wordId,
        added_at: new Date().toISOString(),
        review_count: 0,
        difficulty_level: 3
      });

    if (error) throw error;
  }

  async updateReviewWord(userId: string, wordId: string, updates: Partial<ReviewWord>): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .update(updates)
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  async removeFromReview(userId: string, wordId: string): Promise<void> {
    const { error } = await this.supabase
      .from('review_words')
      .delete()
      .eq('user_id', userId)
      .eq('word_id', wordId);

    if (error) throw error;
  }

  // 復習セッション関連
  async createReviewSession(session: Omit<ReviewSession, 'id' | 'created_at'>): Promise<string> {
    const { data, error } = await this.supabase
      .from('review_sessions')
      .insert({
        ...session,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async updateReviewSession(sessionId: string, updates: Partial<ReviewSession>): Promise<void> {
    const { error } = await this.supabase
      .from('review_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) throw error;
  }

  // 復習スケジューリング（間隔反復アルゴリズム）
  calculateNextReview(difficultyLevel: number, reviewCount: number): Date {
    const now = new Date();
    let intervalDays: number;

    // 間隔反復アルゴリズム（SuperMemo 2の簡略版）
    switch (difficultyLevel) {
      case 1: // 非常に難しい
        intervalDays = Math.max(1, Math.floor(reviewCount * 0.5));
        break;
      case 2: // 難しい
        intervalDays = Math.max(1, Math.floor(reviewCount * 0.8));
        break;
      case 3: // 普通
        intervalDays = Math.max(1, reviewCount);
        break;
      case 4: // 簡単
        intervalDays = Math.max(1, Math.floor(reviewCount * 1.5));
        break;
      case 5: // 非常に簡単
        intervalDays = Math.max(1, Math.floor(reviewCount * 2));
        break;
      default:
        intervalDays = 1;
    }

    // 初回復習の場合は翌日
    if (reviewCount === 0) {
      intervalDays = 1;
    }

    const nextReview = new Date(now);
    nextReview.setDate(now.getDate() + intervalDays);
    return nextReview;
  }

  // 統計情報
  async getAppStats(userId: string): Promise<AppStats> {
    const [words, progress, reviewWords, studySessions] = await Promise.all([
      this.getWords(),
      this.getUserProgress(userId),
      this.getReviewWords(userId),
      this.getStudySessions(userId)
    ]);

    const totalWords = words.length;
    const studiedWords = progress.length;
    const masteredWords = progress.filter(p => (p.mastery_level || 0) >= 0.8).length;
    const studyTimeMinutes = progress.reduce((total, p) => total + ((p.study_count || 0) * 2), 0); // 仮の計算
    const reviewCount = reviewWords.length;

    // ストリーク計算
    const { currentStreak, longestStreak } = this.calculateStreaks(studySessions);
    const totalStudySessions = studySessions.length;

    const totalCorrect = progress.reduce((total, p) => total + (p.correct_count || 0), 0);
    const totalIncorrect = progress.reduce((total, p) => total + (p.incorrect_count || 0), 0);
    const totalAnswers = totalCorrect + totalIncorrect;

    return {
      total_words: totalWords,
      studied_words: studiedWords,
      mastered_words: masteredWords,
      study_time_minutes: studyTimeMinutes,
      review_count: reviewCount,
      total_words_studied: studiedWords,
      total_correct_answers: totalCorrect,
      total_incorrect_answers: totalIncorrect,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_study_sessions: totalStudySessions,
      average_accuracy: totalAnswers > 0
        ? Math.round((totalCorrect / totalAnswers) * 1000) / 10
        : 0,
      words_mastered: masteredWords,
      favorite_words_count: progress.filter(p => p.is_favorite).length
    };
  }

  // 学習記録（日次集計）
  async getLearningRecords(userId: string, days = 30): Promise<LearningRecord> {
    // 日次表示用のセッション（指定期間）
    const sessions = await this.getStudySessions(userId, days);
    // 累計計算用のセッション（全期間）
    const allSessions = await this.getStudySessions(userId, null);

    const dayBuckets = new Map<string, { studyMinutes: number; completedCount: number; correctCount: number }>();

    sessions.forEach(session => {
      const start = session.start_time ? new Date(session.start_time) : null;
      const end = session.end_time ? new Date(session.end_time) : null;
      if (!start || Number.isNaN(start.getTime())) return;

      const key = this.getLocalDateKey(start);
      const bucket = dayBuckets.get(key) || { studyMinutes: 0, completedCount: 0, correctCount: 0 };
      bucket.studyMinutes += this.calculateSessionMinutes(start, end);
      bucket.completedCount += session.completed_words ?? session.total_words ?? 0;
      bucket.correctCount += session.correct_answers ?? 0;
      dayBuckets.set(key, bucket);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buildDay = (targetDate: Date) => {
      const key = this.getLocalDateKey(targetDate);
      const bucket = dayBuckets.get(key) || { studyMinutes: 0, completedCount: 0, correctCount: 0 };
      const accuracy = bucket.completedCount > 0
        ? Math.round((bucket.correctCount / bucket.completedCount) * 1000) / 10
        : 0;

      return {
        date: key,
        displayDate: targetDate.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
        studyMinutes: Math.round(bucket.studyMinutes * 10) / 10,
        completedCount: bucket.completedCount,
        correctCount: bucket.correctCount,
        accuracy,
      };
    };

    const daily: LearningRecord['daily'] = [];
    for (let i = days - 1; i >= 0; i--) {
      const target = new Date(today);
      target.setDate(today.getDate() - i);
      daily.push(buildDay(target));
    }

    const summarizeWindow = (window: typeof daily): LearningRecordSnapshot => {
      const totals = window.reduce(
        (acc, day) => ({
          studyMinutes: acc.studyMinutes + day.studyMinutes,
          completedCount: acc.completedCount + day.completedCount,
          correctCount: acc.correctCount + day.correctCount,
        }),
        { studyMinutes: 0, completedCount: 0, correctCount: 0 }
      );
      const accuracy = totals.completedCount > 0
        ? Math.round((totals.correctCount / totals.completedCount) * 1000) / 10
        : 0;

      return {
        studyMinutes: Math.round(totals.studyMinutes * 10) / 10,
        completedCount: totals.completedCount,
        correctCount: totals.correctCount,
        accuracy,
      };
    };

    const last7Days = daily.slice(-7);
    const last30Days = daily.slice(-30);

    // 全期間のセッションデータを使って累計サマリを算出
    const lifetimeTotals = allSessions.reduce(
      (acc, session) => {
        const completed = session.completed_words ?? session.total_words ?? 0;
        const correct = session.correct_answers ?? 0;
        const start = session.start_time ? new Date(session.start_time) : null;
        const end = session.end_time ? new Date(session.end_time) : null;
        const duration = start ? this.calculateSessionMinutes(start, end) : 0;
        return {
          studyMinutes: acc.studyMinutes + duration,
          completedCount: acc.completedCount + completed,
          correctCount: acc.correctCount + correct,
        };
      },
      { studyMinutes: 0, completedCount: 0, correctCount: 0 }
    );

    return {
      daily,
      summary: {
        today: summarizeWindow(daily.slice(-1)),
        last7Days: summarizeWindow(last7Days),
        last30Days: summarizeWindow(last30Days),
        lifetime: {
          studyMinutes: Math.round(lifetimeTotals.studyMinutes * 10) / 10,
          completedCount: lifetimeTotals.completedCount,
          correctCount: lifetimeTotals.correctCount,
          accuracy: lifetimeTotals.completedCount > 0
            ? Math.round((lifetimeTotals.correctCount / lifetimeTotals.completedCount) * 1000) / 10
            : 0,
        },
      },
    };
  }

  // 学習セッション取得（必要列のみ）
  // daysがnullまたはundefinedの場合は全期間を取得
  async getStudySessions(userId: string, days: number | null = 30): Promise<StudySession[]> {
    let query = this.supabase
      .from('study_sessions')
      .select('id,user_id,category,mode,total_words,completed_words,correct_answers,start_time,end_time,created_at')
      .eq('user_id', userId);

    // daysが指定されている場合のみ期間でフィルタリング
    if (days !== null && days !== undefined) {
      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setDate(cutoff.getDate() - (days - 1));
      query = query.gte('start_time', cutoff.toISOString());
    }

    const { data, error } = await query.order('start_time', { ascending: false });

    if (error) {
      console.error('getStudySessions error:', error);
      return [];
    }
    return (data || []) as StudySession[];
  }

  // ストリーク計算
  calculateStreaks(studySessions: StudySession[]): { currentStreak: number; longestStreak: number } {
    if (studySessions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // 日付でソート（古い順）
    const sortedSessions = studySessions
      .map((session: StudySession) => ({
        ...session,
        date: new Date(session.start_time).toDateString()
      }))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    // ユニークな日付のセッションを取得
    const uniqueDates = Array.from(new Set(sortedSessions.map(s => s.date)));
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // 現在の日付
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    // 現在のストリーク計算
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // 最新のセッション日から逆算
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const sessionDate = uniqueDates[i];
      const expectedDate = new Date(Date.now() - (uniqueDates.length - 1 - i) * 24 * 60 * 60 * 1000).toDateString();
      
      if (sessionDate === expectedDate || sessionDate === today || sessionDate === yesterday) {
        tempStreak++;
        if (i === uniqueDates.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private calculateSessionMinutes(start: Date | null, end: Date | null): number {
    if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) return 0;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 0;
    return diffMs / 60000;
  }

  private getLocalDateKey(date: Date): string {
    const local = new Date(date);
    local.setHours(0, 0, 0, 0);
    const offsetMs = local.getTime() - local.getTimezoneOffset() * 60000;
    return new Date(offsetMs).toISOString().split('T')[0];
  }

  // プロフィール関連
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }

    return data || null;
  }

  async createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 