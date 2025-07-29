import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const resolvedParams = await params;
    const wordId = resolvedParams.wordId;
    
    console.log(`音声ファイル取得リクエスト: wordId=${wordId}`);
    
    // 単語IDから音声ファイルパスを取得
    const { data: word, error: wordError } = await supabase
      .from('words')
      .select('audio_file, word')
      .eq('id', wordId)
      .single();

    if (wordError) {
      console.error(`単語情報取得エラー (${wordId}):`, wordError);
      return NextResponse.json(
        { error: '単語情報の取得に失敗しました', details: wordError.message },
        { status: 404 }
      );
    }

    if (!word?.audio_file) {
      console.warn(`音声ファイルが設定されていません: ${wordId} (${word?.word})`);
      return NextResponse.json(
        { error: '音声ファイルが設定されていません', word: word?.word },
        { status: 404 }
      );
    }

    console.log(`音声ファイルパス: ${word.audio_file} (${word.word})`);

    // audio-filesバケットから音声ファイルを取得
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(word.audio_file);

    if (error) {
      console.error(`音声ファイルダウンロードエラー (${word.audio_file}):`, error);
      return NextResponse.json(
        { error: '音声ファイルの取得に失敗しました', details: error.message, path: word.audio_file },
        { status: 404 }
      );
    }

    if (!data) {
      console.error(`音声ファイルデータが空: ${word.audio_file}`);
      return NextResponse.json(
        { error: '音声ファイルデータが空です', path: word.audio_file },
        { status: 404 }
      );
    }

    console.log(`音声ファイル取得成功: ${word.audio_file} (${data.size} bytes)`);

    // 音声ファイルを返す
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': data.size.toString(),
      },
    });

  } catch (error) {
    console.error('音声ファイル取得エラー:', error);
    return NextResponse.json(
      { error: '音声ファイルの取得に失敗しました', details: error instanceof Error ? error.message : '不明なエラー' },
      { status: 500 }
    );
  }
} 