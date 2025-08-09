import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug API is not available in production' },
      { status: 404 }
    );
  }
  try {
    const { word } = await params;
    const supabase = await createClient();
    
    console.log(`[Debug] 単語情報取得: ${word}`);
    
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('word', word)
      .single();

    if (error) {
      console.error(`[Debug] 単語取得エラー: ${word}`, error);
      return NextResponse.json(
        { error: '単語が見つかりません', details: error.message },
        { status: 404 }
      );
    }

    console.log(`[Debug] 単語情報取得成功: ${word}`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Debug] API エラー:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  // 本番環境ではデバッグAPIを無効化
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug API is not available in production' },
      { status: 404 }
    );
  }
  try {
    const { word } = await params;
    const body = await request.json();
    const supabase = await createClient();
    
    console.log(`[Debug] 単語更新: ${word}`, body);
    
    const { data, error } = await supabase
      .from('words')
      .update(body)
      .eq('word', word)
      .select()
      .single();

    if (error) {
      console.error(`[Debug] 単語更新エラー: ${word}`, error);
      return NextResponse.json(
        { error: '単語の更新に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    console.log(`[Debug] 単語更新成功: ${word}`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Debug] API エラー:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 