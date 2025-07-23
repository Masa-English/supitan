-- Migration: Insert sample trivia data
-- Created at: 2024-12-27 00:00:04

-- サンプル豆知識データの挿入
INSERT INTO trivia (category, title, content, content_jp, difficulty_level, tags, is_featured) VALUES
  (
    'general',
    'The Origin of "OK"',
    'The word "OK" comes from "oll korrect," a humorous misspelling of "all correct" that became popular in Boston newspapers in the 1830s. It''s now one of the most recognized words in the world.',
    '「OK」という言葉は、1830年代にボストンの新聞で人気となった「all correct（すべて正しい）」のユーモラスな誤字「oll korrect」に由来します。現在では世界で最も認知されている言葉の一つです。',
    1,
    ARRAY['etymology', 'history', 'popular'],
    true
  ),
  (
    'general',
    'Why English Spelling is So Confusing',
    'English spelling is difficult because the language borrowed words from many different languages (Latin, French, German, etc.) while keeping their original spellings. The Great Vowel Shift in the 15th-17th centuries also changed pronunciation but not spelling.',
    '英語のスペルが難しいのは、多くの異なる言語（ラテン語、フランス語、ドイツ語など）から単語を借用しながら、元のスペルを保持したためです。15〜17世紀の大きな母音推移も発音を変えましたが、スペルは変わりませんでした。',
    2,
    ARRAY['linguistics', 'history', 'spelling'],
    true
  ),
  (
    'general',
    'The Shortest Complete Sentence',
    'The shortest grammatically complete sentence in English is "I am." It contains a subject (I) and a predicate (am), making it a full sentence despite being only two words.',
    '英語で文法的に完全な最短の文は「I am.」です。主語（I）と述語（am）が含まれているため、たった2語でも完全な文になります。',
    1,
    ARRAY['grammar', 'sentence', 'structure'],
    false
  ),
  (
    'general',
    'Shakespeare''s Vocabulary Innovation',
    'William Shakespeare is credited with inventing or first recording over 1,700 words in English, including "assassination," "eyeball," "fashionable," and "lonely." Many of these words are still commonly used today.',
    'ウィリアム・シェイクスピアは、「assassination（暗殺）」「eyeball（眼球）」「fashionable（おしゃれな）」「lonely（孤独な）」など、英語で1,700語以上の単語を発明または初めて記録したとされています。これらの多くは今でもよく使われています。',
    2,
    ARRAY['shakespeare', 'vocabulary', 'literature'],
    true
  ),
  (
    'general',
    'The Power of Silent Letters',
    'Silent letters in English often reveal the word''s history. For example, "knife" has a silent "k" because it was actually pronounced in Old English. The "b" in "lamb" was also pronounced centuries ago.',
    '英語の無音文字は、しばしばその単語の歴史を明かします。例えば、「knife」の無音の「k」は、古英語では実際に発音されていました。「lamb」の「b」も何世紀も前には発音されていました。',
    2,
    ARRAY['etymology', 'pronunciation', 'history'],
    false
  ),
  (
    'general',
    'The Longest Word Without Vowels',
    'The longest English word without traditional vowels (a, e, i, o, u) is "rhythms" at 7 letters. However, "y" is functioning as a vowel in this word.',
    '従来の母音（a、e、i、o、u）を含まない最長の英単語は、7文字の「rhythms」です。ただし、この単語では「y」が母音として機能しています。',
    1,
    ARRAY['vocabulary', 'vowels', 'spelling'],
    false
  ),
  (
    'general',
    'English as a Global Language',
    'English is spoken by over 1.5 billion people worldwide, but only about 380 million are native speakers. This means most English speakers learned it as a second language.',
    '英語は世界中で15億人以上に話されていますが、ネイティブスピーカーは約3億8000万人だけです。つまり、英語話者の大部分は第二言語として学んだということです。',
    1,
    ARRAY['statistics', 'global', 'speakers'],
    true
  ),
  (
    'general',
    'The Evolution of "You"',
    'In Old English, "thou" was used for singular informal address and "you" for plural or formal singular. Over time, "you" became standard for all situations, and "thou" disappeared from common usage except in some dialects and religious contexts.',
    '古英語では、「thou」が単数の非公式な呼びかけに、「you」が複数または公式な単数に使われていました。時が経つにつれて、「you」がすべての状況で標準となり、「thou」は一部の方言と宗教的文脈を除いて一般的な使用から消えました。',
    3,
    ARRAY['grammar', 'history', 'pronouns'],
    false
  );

-- 単語に関連する豆知識のサンプル（word_idが設定されている場合のサンプル）
-- 注意: 実際のword_idは既存のwordsテーブルのデータに依存するため、
-- 以下はコメントアウトしています。実際の運用時は適切なword_idを設定してください。

/*
-- 例: "apple" という単語に関連する豆知識
INSERT INTO trivia (word_id, category, title, content, content_jp, difficulty_level, tags, is_featured) 
SELECT 
  w.id,
  w.category,
  'The Apple of Discord',
  'The phrase "apple of discord" comes from Greek mythology. The goddess Eris threw a golden apple inscribed "for the fairest" among the goddesses, causing a dispute that led to the Trojan War.',
  '「不和のりんご」という表現はギリシャ神話に由来します。女神エリスが「最も美しい者へ」と刻まれた黄金のりんごを女神たちの間に投げ、それが争いを引き起こし、トロイ戦争につながりました。',
  2,
  ARRAY['mythology', 'idioms', 'history'],
  false
FROM words w 
WHERE w.word = 'apple' 
LIMIT 1;
*/ 