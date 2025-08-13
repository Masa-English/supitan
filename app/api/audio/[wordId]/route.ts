import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { devLog } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wordId: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { wordId } = await params;
    
    devLog.log(`音声ファイル取得リクエスト: wordId=${wordId}`);
    
    // 単語IDから音声ファイルパスを取得
    const { data: word, error: wordError } = await supabase
      .from('words')
      .select('audio_file, word')
      .eq('id', wordId)
      .single();

    if (wordError) {
      devLog.error(`単語情報取得エラー (${wordId}):`, wordError);
      return NextResponse.json(
        { error: '単語情報の取得に失敗しました', details: wordError.message },
        { status: 404 }
      );
    }

    if (!word?.audio_file) {
      devLog.warn(`音声ファイルが設定されていません: ${wordId} (${word?.word})`);
      return NextResponse.json(
        { error: '音声ファイルが設定されていません' },
        { status: 404 }
      );
    }

    devLog.log(`音声ファイルパス: ${word.audio_file} (${word.word})`);

    // audio-filesバケットから音声ファイルを取得
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(word.audio_file);

    if (error) {
      devLog.error(`音声ファイルダウンロードエラー (${word.audio_file}):`, error);
      return NextResponse.json(
        { error: '音声ファイルのダウンロードに失敗しました' },
        { status: 500 }
      );
    }

    if (!data || data.size === 0) {
      devLog.error(`音声ファイルデータが空: ${word.audio_file}`);
      return NextResponse.json(
        { error: '音声ファイルデータが空です' },
        { status: 500 }
      );
    }

    devLog.log(`音声ファイル取得成功: ${word.audio_file} (${data.size} bytes)`);

    // 音声ファイルを返す
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': data.size.toString(),
      },
    });

  } catch (error) {
    devLog.error('音声ファイル取得エラー:', error);
    return NextResponse.json(
      { error: '音声ファイルの取得に失敗しました' },
      { status: 500 }
    );
  }
} 