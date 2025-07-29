import { createClient } from '@/lib/supabase/client';

export interface AudioFileInfo {
  wordId: string;
  audioUrl: string | null;
  audioFile: string;
}

export interface BatchAudioResponse {
  audioFiles: AudioFileInfo[];
  total: number;
  requested: number;
}

/**
 * 単語の音声ファイルを一括で取得する
 */
export async function fetchBatchAudioFiles(wordIds: string[]): Promise<BatchAudioResponse> {
  try {
    const response = await fetch('/api/audio/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wordIds }),
    });

    if (!response.ok) {
      throw new Error(`音声ファイル一括取得エラー: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('音声ファイル一括取得エラー:', error);
    throw error;
  }
}

/**
 * 単語の音声ファイルを個別に取得する
 */
export async function fetchWordAudio(wordId: string): Promise<Blob | null> {
  try {
    const response = await fetch(`/api/audio/${wordId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // 音声ファイルが存在しない
      }
      throw new Error(`音声ファイル取得エラー: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error(`音声ファイル取得エラー (${wordId}):`, error);
    return null;
  }
}

/**
 * Supabase Storageから直接音声ファイルを取得する
 * audio-filesバケットがPublicなので、getPublicUrlを使用して効率的に取得
 */
export async function fetchAudioFromStorage(audioFilePath: string): Promise<Blob | null> {
  try {
    console.log(`[AudioUtils] Supabase Storageから音声ファイルを取得開始: ${audioFilePath}`);
    
    const supabase = createClient();
    
    // audio-filesバケットがPublicなので、getPublicUrlを使用
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(audioFilePath);
    
    if (!urlData?.publicUrl) {
      console.error(`[AudioUtils] 音声ファイルのURL取得に失敗: ${audioFilePath}`);
      return null;
    }
    
    console.log(`[AudioUtils] 音声ファイルURL取得成功: ${urlData.publicUrl}`);
    
    // URLからBlobを取得
    const response = await fetch(urlData.publicUrl);
    
    if (!response.ok) {
      console.error(`[AudioUtils] 音声ファイルのフェッチに失敗: ${audioFilePath}, status=${response.status}`);
      return null;
    }
    
    const blob = await response.blob();
    console.log(`[AudioUtils] 音声ファイル取得成功: ${audioFilePath}, size=${blob.size} bytes`);
    return blob;
  } catch (error) {
    console.error(`[AudioUtils] 音声ファイル取得エラー (${audioFilePath}):`, error);
    return null;
  }
}

/**
 * 音声ファイルのURLを生成する
 * audio-filesバケットがPublicなので、getPublicUrlを使用
 */
export async function generateAudioUrl(audioFilePath: string, _expiresIn: number = 3600): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // audio-filesバケットがPublicなので、getPublicUrlを使用
    const { data } = supabase.storage
      .from('audio-files')
      .getPublicUrl(audioFilePath);

    if (!data?.publicUrl) {
      console.warn(`音声ファイルURL生成エラー: ${audioFilePath}`);
      return null;
    }

    console.log(`[AudioUtils] 音声ファイルURL生成成功: ${data.publicUrl}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`音声ファイルURL生成エラー (${audioFilePath}):`, error);
    return null;
  }
}

/**
 * 音声ファイルの存在確認
 */
export async function checkAudioFileExists(audioFilePath: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list('', {
        search: audioFilePath,
        limit: 1
      });

    if (error) {
      console.warn(`音声ファイル存在確認エラー: ${audioFilePath}`, error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error(`音声ファイル存在確認エラー (${audioFilePath}):`, error);
    return false;
  }
}

/**
 * 音声ファイルのメタデータを取得する
 */
export async function getAudioFileMetadata(audioFilePath: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .list('', {
        search: audioFilePath,
        limit: 1
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error(`音声ファイルメタデータ取得エラー (${audioFilePath}):`, error);
    return null;
  }
}

/**
 * 音声ファイルの詳細情報を取得する（デバッグ用）
 */
export async function getAudioFileInfo(audioFilePath: string) {
  try {
    const supabase = createClient();
    
    // ファイルの存在確認
    const { data: listData, error: listError } = await supabase.storage
      .from('audio-files')
      .list('', {
        search: audioFilePath,
        limit: 1
      });

    if (listError) {
      return {
        exists: false,
        error: listError.message,
        metadata: null
      };
    }

    if (!listData || listData.length === 0) {
      return {
        exists: false,
        error: 'ファイルが見つかりません',
        metadata: null
      };
    }

    const fileInfo = listData[0];
    
    // ファイルサイズとメタデータを取得
    return {
      exists: true,
      error: null,
      metadata: {
        name: fileInfo.name,
        size: fileInfo.metadata?.size,
        mimeType: fileInfo.metadata?.mimetype,
        lastModified: fileInfo.updated_at,
        path: audioFilePath
      }
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      metadata: null
    };
  }
}

/**
 * 特定の単語の音声ファイル情報を取得する
 */
export async function getWordAudioInfo(wordId: string) {
  try {
    console.log(`[AudioUtils] 単語音声情報取得開始: wordId=${wordId}`);
    
    const supabase = createClient();
    
    // 単語情報を取得
    const { data: word, error: wordError } = await supabase
      .from('words')
      .select('id, word, audio_file')
      .eq('id', wordId)
      .single();

    if (wordError || !word) {
      console.error(`[AudioUtils] 単語情報取得エラー: ${wordId}`, wordError);
      return {
        wordId,
        word: null,
        audioFile: null,
        audioInfo: null,
        error: wordError?.message || '単語が見つかりません'
      };
    }

    console.log(`[AudioUtils] 単語情報取得成功: ${word.word}, audio_file=${word.audio_file}`);

    if (!word.audio_file) {
      console.log(`[AudioUtils] 音声ファイル未設定: ${word.word}`);
      return {
        wordId,
        word: word.word,
        audioFile: null,
        audioInfo: null,
        error: '音声ファイルが設定されていません'
      };
    }

    // 音声ファイル情報を取得
    console.log(`[AudioUtils] 音声ファイル情報取得開始: ${word.audio_file}`);
    const audioInfo = await getAudioFileInfo(word.audio_file);
    console.log(`[AudioUtils] 音声ファイル情報取得結果:`, audioInfo);

    return {
      wordId,
      word: word.word,
      audioFile: word.audio_file,
      audioInfo,
      error: null
    };
  } catch (error) {
    console.error(`[AudioUtils] 単語音声情報取得エラー: ${wordId}`, error);
    return {
      wordId,
      word: null,
      audioFile: null,
      audioInfo: null,
      error: error instanceof Error ? error.message : '不明なエラー'
    };
  }
} 