const { createClient } = require('@supabase/supabase-js');

// 環境変数の設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const revalidationToken = process.env.REVALIDATION_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey || !revalidationToken) {
  console.error('必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 再検証をトリガーする関数
async function triggerRevalidation() {
  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: revalidationToken,
      }),
    });

    if (response.ok) {
      console.log('✅ 再検証が正常にトリガーされました');
    } else {
      console.error('❌ 再検証のトリガーに失敗しました:', response.statusText);
    }
  } catch (error) {
    console.error('❌ 再検証のトリガー中にエラーが発生しました:', error);
  }
}

// データベースの変更を監視
async function watchDatabaseChanges() {
  console.log('🔍 データベースの変更を監視中...');

  // wordsテーブルの変更を監視
  const wordsSubscription = supabase
    .channel('words-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'words',
      },
      (payload) => {
        console.log('📝 wordsテーブルに変更が検出されました:', payload.eventType);
        triggerRevalidation();
      }
    )
    .subscribe();

  // categoriesテーブルの変更を監視
  const categoriesSubscription = supabase
    .channel('categories-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
      },
      (payload) => {
        console.log('📝 categoriesテーブルに変更が検出されました:', payload.eventType);
        triggerRevalidation();
      }
    )
    .subscribe();

  // エラーハンドリング
  wordsSubscription.on('error', (error) => {
    console.error('❌ wordsテーブルの監視エラー:', error);
  });

  categoriesSubscription.on('error', (error) => {
    console.error('❌ categoriesテーブルの監視エラー:', error);
  });

  // プロセス終了時のクリーンアップ
  process.on('SIGINT', () => {
    console.log('\n🛑 監視を停止中...');
    wordsSubscription.unsubscribe();
    categoriesSubscription.unsubscribe();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 監視を停止中...');
    wordsSubscription.unsubscribe();
    categoriesSubscription.unsubscribe();
    process.exit(0);
  });
}

// 定期的な再検証（バックアップとして）
function schedulePeriodicRevalidation() {
  const REVALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24時間

  setInterval(() => {
    console.log('⏰ 定期再検証を実行中...');
    triggerRevalidation();
  }, REVALIDATION_INTERVAL);
}

// メイン実行
async function main() {
  console.log('🚀 ISR監視スクリプトを開始します');
  
  // データベース変更の監視を開始
  await watchDatabaseChanges();
  
  // 定期再検証を開始
  schedulePeriodicRevalidation();
  
  console.log('✅ 監視が開始されました');
}

main().catch((error) => {
  console.error('❌ スクリプトの実行中にエラーが発生しました:', error);
  process.exit(1);
}); 