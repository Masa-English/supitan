import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/api/supabase/server';

export async function GET(_request: NextRequest) {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug API is not available in production' },
      { status: 404 }
    );
  }

  try {
    const supabase = await createServerClient();

    // words サンプルと総数、カテゴリ別件数
    const [
      wordsSampleRes,
      wordsCountRes,
      wordsCategoriesRes,
      categoriesSampleRes,
      categoriesCountRes,
      userProgressCountRes,
      reviewWordsCountRes,
      studySessionsCountRes,
      userProfilesCountRes,
      audioFilesCountRes,
      learningRecordsCountRes,
    ] = await Promise.all([
      supabase
        .from('words')
        .select('id, word, category, phonetic, created_at')
        .order('word', { ascending: true })
        .limit(5),
      supabase
        .from('words')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('words')
        .select('category')
        .order('category', { ascending: true }),
      supabase
        .from('categories')
        .select('name, sort_order, is_active')
        .order('sort_order', { ascending: true })
        .limit(10),
      supabase
        .from('categories')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('review_words')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('study_sessions')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('audio_files')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('learning_records')
        .select('id', { count: 'exact', head: true }),
    ]);

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseUrl:
          process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 32)}...`
            : null,
      },
      tables: {
        words: {
          exists: !wordsSampleRes.error,
          total: wordsCountRes.count ?? null,
          sample: wordsSampleRes.data ?? [],
          error: wordsSampleRes.error?.message ?? null,
          categoryCounts: !wordsCategoriesRes.error
            ? (() => {
                const counts: Record<string, number> = {};
                (wordsCategoriesRes.data ?? []).forEach((row: { category: string }) => {
                  const key = row.category ?? 'unknown';
                  counts[key] = (counts[key] ?? 0) + 1;
                });
                return Object.entries(counts).map(([category, count]) => ({ category, count }));
              })()
            : { error: wordsCategoriesRes.error?.message ?? 'unknown' },
        },
        categories: {
          exists: !categoriesSampleRes.error,
          total: categoriesCountRes.count ?? null,
          sample: categoriesSampleRes.data ?? [],
          error: categoriesSampleRes.error?.message ?? null,
        },
        user_progress: {
          exists: !userProgressCountRes.error,
          total: userProgressCountRes.count ?? null,
          error: userProgressCountRes.error?.message ?? null,
        },
        review_words: {
          exists: !reviewWordsCountRes.error,
          total: reviewWordsCountRes.count ?? null,
          error: reviewWordsCountRes.error?.message ?? null,
        },
        study_sessions: {
          exists: !studySessionsCountRes.error,
          total: studySessionsCountRes.count ?? null,
          error: studySessionsCountRes.error?.message ?? null,
        },
        user_profiles: {
          exists: !userProfilesCountRes.error,
          total: userProfilesCountRes.count ?? null,
          error: userProfilesCountRes.error?.message ?? null,
        },
        audio_files: {
          exists: !audioFilesCountRes.error,
          total: audioFilesCountRes.count ?? null,
          error: audioFilesCountRes.error?.message ?? null,
        },
        learning_records: {
          exists: !learningRecordsCountRes.error,
          total: learningRecordsCountRes.count ?? null,
          error: learningRecordsCountRes.error?.message ?? null,
        },
      },
    } as const;

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug API error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 