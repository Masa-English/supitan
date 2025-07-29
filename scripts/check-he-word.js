import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHeWord() {
  try {
    console.log('heの単語情報を確認中...');
    
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('word', 'he')
      .single();

    if (error) {
      console.error('単語取得エラー:', error);
      return;
    }

    console.log('heの単語情報:', JSON.stringify(data, null, 2));
    
    if (!data.audio_file) {
      console.log('audio_fileが設定されていません。更新します...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('words')
        .update({ audio_file: 'he.mp3' })
        .eq('word', 'he')
        .select();

      if (updateError) {
        console.error('更新エラー:', updateError);
        return;
      }

      console.log('更新完了:', updateData);
    } else {
      console.log('audio_fileは既に設定されています:', data.audio_file);
    }
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}

checkHeWord(); 