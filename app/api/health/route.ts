import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface HealthCheck {
  status: string;
  timestamp: string;
  environment: string | undefined;
  envVars: {
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
    hasServiceRoleKey: boolean;
    hasVercelUrl: boolean;
    hasBaseUrl: boolean;
  };
  database: {
    connected: boolean;
    error: string | null;
    wordCount: number;
    categories: string[];
  };
}

interface WordData {
  id: string;
  category: string;
}

export async function GET() {
  try {
    const healthCheck: HealthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasVercelUrl: !!process.env.VERCEL_URL,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      },
      database: {
        connected: false,
        error: null,
        wordCount: 0,
        categories: []
      }
    };

    // データベース接続テスト
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
              setAll(cookiesToSet) {
                try {
                  cookiesToSet.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options),
                  );
                } catch {
                  // SSG時は無視
                }
              },
            },
          },
        );

        // 単語データの取得テスト
        const { data: words, error: wordsError } = await supabase
          .from('words')
          .select('id, category')
          .limit(10);

        if (wordsError) {
          healthCheck.database.error = wordsError.message;
        } else {
          healthCheck.database.connected = true;
          healthCheck.database.wordCount = words?.length || 0;
          
          // カテゴリー一覧の取得
          const wordData = words as WordData[] || [];
          const categories = [...new Set(wordData.map(w => w.category))];
          healthCheck.database.categories = categories;
        }
      } catch (dbError) {
        healthCheck.database.error = dbError instanceof Error ? dbError.message : 'Unknown database error';
      }
    } else {
      healthCheck.database.error = 'Missing Supabase environment variables';
    }

    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 