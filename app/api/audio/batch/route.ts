import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { wordIds } = await request.json();

    // 入力検証
    if (!Array.isArray(wordIds)) {
      return NextResponse.json(
        { error: 'wordIdsは配列である必要があります' },
        { status: 400 }
      );
    }
    if (wordIds.length === 0 || wordIds.length > 100) {
      return NextResponse.json(
        { error: 'wordIdsの件数が不正です（1〜100件）' },
        { status: 400 }
      );
    }
    if (!wordIds.every(id => typeof id === 'string' && id.length <= 64)) {
      return NextResponse.json(
        { error: 'wordIdsに不正な値が含まれています' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 認証必須
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 指定された単語IDの音声ファイル情報を取得
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, audio_file')
      .in('id', wordIds)
      .not('audio_file', 'is', null);

    if (wordsError) {
      return NextResponse.json(
        { error: '単語情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // 音声ファイルのURLを生成
    const audioUrls = await Promise.all(
      words.map(async (word) => {
        if (!word.audio_file) return null;

        try {
          const { data } = await supabase.storage
            .from('audio-files')
            .createSignedUrl(word.audio_file, 3600); // 1時間有効

          return {
            wordId: word.id,
            audioUrl: data?.signedUrl || null,
            audioFile: word.audio_file
          };
        } catch (error) {
          console.warn(`音声ファイルURL生成エラー: ${word.audio_file}`, error);
          return {
            wordId: word.id,
            audioUrl: null,
            audioFile: word.audio_file
          };
        }
      })
    );

    // nullを除外して結果を返す
    const validAudioUrls = audioUrls.filter(url => url !== null);

    return NextResponse.json({
      audioFiles: validAudioUrls,
      total: validAudioUrls.length,
      requested: wordIds.length
    });

  } catch (error) {
    console.error('音声ファイル一括取得エラー:', error);
    return NextResponse.json(
      { error: '音声ファイルの一括取得に失敗しました' },
      { status: 500 }
    );
  }
} 