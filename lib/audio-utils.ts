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
 */
export async function fetchAudioFromStorage(audioFilePath: string): Promise<Blob | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .download(audioFilePath);

    if (error || !data) {
      console.warn(`音声ファイルが見つかりません: ${audioFilePath}`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`音声ファイル取得エラー (${audioFilePath}):`, error);
    return null;
  }
}

/**
 * 音声ファイルのURLを生成する
 */
export async function generateAudioUrl(audioFilePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(audioFilePath, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn(`音声ファイルURL生成エラー: ${audioFilePath}`, error);
      return null;
    }

    return data.signedUrl;
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