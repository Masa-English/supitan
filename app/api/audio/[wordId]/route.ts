import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const resolvedParams = await params;
    
    // 単語IDから音声ファイルパスを取得
    const { data: word, error: wordError } = await supabase
      .from('words')
      .select('audio_file')
      .eq('id', resolvedParams.wordId)
      .single();

    if (wordError || !word?.audio_file) {
      return NextResponse.json(
        { error: '音声ファイルが見つかりません' },
        { status: 404 }
      );
    }

    // audio-filesバケットから音声ファイルを取得
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(word.audio_file);

    if (error || !data) {
      return NextResponse.json(
        { error: '音声ファイルの取得に失敗しました' },
        { status: 404 }
      );
    }

    // 音声ファイルを返す
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('音声ファイル取得エラー:', error);
    return NextResponse.json(
      { error: '音声ファイルの取得に失敗しました' },
      { status: 500 }
    );
  }
} 