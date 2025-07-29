import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addHeWord() {
  try {
    console.log('heの単語を追加中...');
    
    const { data, error } = await supabase
      .from('words')
      .insert([
        {
          word: 'he',
          japanese: '彼',
          category: '代名詞',
          example1: 'He is a teacher.',
          example1_jp: '彼は教師です。',
          example2: 'He likes sports.',
          example2_jp: '彼はスポーツが好きです。',
          example3: 'He will come tomorrow.',
          example3_jp: '彼は明日来ます。',
          phonetic: 'hi:',
          audio_file: 'he.mp3',
          difficulty_level: 1,
          is_active: true
        }
      ])
      .select();

    if (error) {
      console.error('単語追加エラー:', error);
      return;
    }

    console.log('heの単語が正常に追加されました:', data);
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}

addHeWord(); 