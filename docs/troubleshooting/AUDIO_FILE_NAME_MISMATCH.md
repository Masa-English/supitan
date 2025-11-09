# 音声ファイル名不一致問題 - 症状と現状まとめ

## 📋 問題の概要

データベースに登録されている`audio_file`の値と、Supabase Storageに実際に保存されているフォルダ名が一致していないため、音声ファイルが再生されない問題が発生しています。

## 🔍 確認した症状

### 1. データベースとStorageの不一致

**データベース（wordsテーブル）**:
- `come_up1` (アンダースコアあり、数字が続く)
- `come_up2` (アンダースコアあり、数字が続く)

**Supabase Storage（実際のフォルダ名）**:
- `comeup_1` (アンダースコアなし、数字の前にアンダースコア)
- `comeup_2` (アンダースコアなし、数字の前にアンダースコア)

### 2. 影響を受けている単語

以下の単語で音声が再生されない問題が確認されています：

| 単語 | データベースのaudio_file | Storageの実際のフォルダ名 | 状態 |
|------|-------------------------|---------------------------|------|
| come up (セクション4) | `come_up1` | `comeup_1` | ❌ 不一致 |
| come up (セクション4) | `come_up2` | `comeup_2` | ❌ 不一致 |
| come up with | `come_up_with` | `come_up_with` | ✅ 一致 |

### 3. その他の類似パターン

Storage内で確認されたフォルダ名のパターン：
- `comeup_1` ✅ 存在
- `comeup_2` ✅ 存在
- `comeup_3` ✅ 存在
- `come_up` ✅ 存在
- `come_up_with` ✅ 存在

## 🐛 問題の原因（推測）

### CMS側でのファイル名処理の問題

1. **ファイル名の正規化処理**
   - CMSでファイルをアップロードする際、ファイル名が自動的に変換されている可能性
   - `come_up_1` → `comeup_1` のように変換されている

2. **データベース登録時の処理**
   - CMSでファイルをアップロード後、データベースに登録される`audio_file`の値が、実際のStorageフォルダ名と異なる
   - 例：`come_up1`として登録されるが、Storageには`comeup_1`として保存される

3. **命名規則の不統一**
   - ユーザーの報告によると：
     - `come_up_1`や`come_up_2`で登録すると音声が更新されない
     - `come_up1`や`come_up2`で登録すると音声は登録されるが、Storageとの不一致が発生

## 📊 現状の確認結果

### データベースの状態

```sql
-- come_up関連の単語
SELECT id, word, audio_file, category, section 
FROM words 
WHERE word ILIKE '%come up%'
ORDER BY word, section;
```

結果：
- `come up with`: `audio_file = 'come_up_with'` ✅
- `come up` (ID: 4dd48aec...): `audio_file = 'come_up1'` ❌
- `come up` (ID: 8c9ddf52...): `audio_file = 'come_up2'` ❌

### Storageの状態

```
audio-files/
├── comeup_1/
│   ├── word.mp3 ✅
│   ├── example00001.mp3 ✅
│   ├── example00002.mp3 ✅
│   └── example00003.mp3 ✅
├── comeup_2/
│   ├── word.mp3 ✅
│   ├── example00001.mp3 ✅
│   ├── example00002.mp3 ✅
│   └── example00003.mp3 ✅
├── comeup_3/
│   ├── word.mp3 ✅
│   └── ...
├── come_up/
│   ├── word.mp3 ✅
│   └── ...
└── come_up_with/
    ├── word.mp3 ✅
    └── ...
```

## 🔧 アプリケーション側の対応

### 現在の実装

アプリケーション側では、**データベースに登録されている値をそのまま使用**する方針に変更しました（正規化処理を削除）。

```typescript
// lib/utils/audio.ts
// DBから取得したaudio_fileの値をそのまま使用
let resolvedPath = audioFilePath;
if (!audioFilePath.includes('/') && !audioFilePath.endsWith('.mp3')) {
  resolvedPath = `${audioFilePath}/word.mp3`;
}
```

これにより、データベースとStorageの不一致が明確に検出されるようになりました。

## 🎯 CMS側で確認・修正が必要な項目

### 1. ファイル名の命名規則の統一

**問題のあるパターン**:
- `come_up1` (データベース) vs `comeup_1` (Storage)
- `come_up2` (データベース) vs `comeup_2` (Storage)

**推奨される統一ルール**:
- オプションA: `comeup_1`, `comeup_2` 形式（Storageに合わせる）
- オプションB: `come_up1`, `come_up2` 形式（データベースに合わせる）

### 2. CMSでのファイルアップロード処理

以下の点を確認してください：

1. **ファイルアップロード時の名前変換**
   - ファイル名がどのように処理されているか
   - `come_up_1` → `comeup_1` のような変換が行われているか

2. **データベース登録時の処理**
   - `audio_file`フィールドにどのような値が登録されているか
   - Storageに保存されるフォルダ名と一致しているか

3. **複数構成の単語（句動詞）の処理**
   - `come_up_1`, `come_up_2` のような形式で登録した場合の処理
   - 例文3に別の単語の例文3が登録される問題（ユーザー報告）

### 3. 確認が必要な単語

以下の単語でも同様の問題が発生している可能性があります：

- `work_out` 関連（セクション4）
- `make_up` 関連（セクション8）
- `get_back_to` 関連（セクション8）

## 📝 推奨される対応

### 短期的な対応（データベース修正）

データベースの`audio_file`をStorageの実際のフォルダ名に合わせて修正：

```sql
-- 例：come_up1 → comeup_1
UPDATE words 
SET audio_file = 'comeup_1' 
WHERE audio_file = 'come_up1';

UPDATE words 
SET audio_file = 'comeup_2' 
WHERE audio_file = 'come_up2';
```

### 長期的な対応（CMS側の修正）

1. **命名規則の統一**
   - CMSでファイルをアップロードする際の命名規則を明確化
   - データベースとStorageで同じ命名規則を使用

2. **バリデーションの追加**
   - ファイルアップロード時に、データベースとStorageの整合性をチェック
   - 不一致が検出された場合はエラーを表示

3. **テストの追加**
   - ファイルアップロード後の整合性確認テスト
   - 複数構成の単語（句動詞）のテスト

## 🔍 確認用スクリプト

以下のスクリプトで問題を確認できます：

```bash
# 特定の単語の詳細確認
npm run supabase:status -- --word=come_up

# Storage内のcome_up関連ファイルを検索
node scripts/search-come-up-files.mjs

# 特定のファイルパスの存在確認
node scripts/check-audio-file-exists.mjs come_up1
```

## 📅 作成日時

2025-01-XX

## 📌 関連情報

- ユーザー報告: CMSの音声ファイルで`come_up2`と記載があり、Supabaseでも`come_up2`となっているが、スピ単では音声が流れない
- ファイル名の問題: `come_up_1`や`come_up_2`にすると音声が更新されない。`come_up1`や`come_up2`にすると音声は登録されるが、Storageとの不一致が発生

