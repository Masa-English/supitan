-- Sample data for English learning app
-- This file contains sample words data for testing

-- Insert sample words
INSERT INTO words (category, word, japanese, example1, example1_jp, example2, example2_jp, example3, example3_jp, phonetic, audio_file) VALUES
-- Verbs
('verb', 'study', '勉強する', 'I study English every day.', '私は毎日英語を勉強します。', 'She studies hard for the exam.', '彼女は試験のために一生懸命勉強します。', 'We studied together at the library.', '私たちは図書館で一緒に勉強しました。', '/ˈstʌdi/', null),
('verb', 'learn', '学ぶ', 'We learn new things every day.', '私たちは毎日新しいことを学びます。', 'Children learn quickly.', '子供たちは素早く学びます。', 'I learned to drive last year.', '私は去年運転を覚えました。', '/lɜːrn/', null),
('verb', 'practice', '練習する', 'I practice piano every morning.', '私は毎朝ピアノを練習します。', 'Practice makes perfect.', '継続は力なり。', 'She practices speaking English daily.', '彼女は毎日英会話を練習しています。', '/ˈpræktɪs/', null),
('verb', 'understand', '理解する', 'Do you understand the question?', 'その質問を理解していますか？', 'I understand your feelings.', 'あなたの気持ちを理解します。', 'He finally understood the problem.', '彼はついにその問題を理解しました。', '/ˌʌndərˈstænd/', null),
('verb', 'remember', '覚える', 'I remember your name.', 'あなたの名前を覚えています。', 'Please remember to call me.', '私に電話することを忘れないでください。', 'She remembered the important date.', '彼女は重要な日付を覚えていました。', '/rɪˈmembər/', null),

-- Nouns
('noun', 'book', '本', 'I read a book every night.', '私は毎晩本を読みます。', 'This book is very interesting.', 'この本はとても面白いです。', 'She borrowed three books from the library.', '彼女は図書館から3冊の本を借りました。', '/bʊk/', null),
('noun', 'teacher', '先生', 'My teacher is very kind.', '私の先生はとても親切です。', 'The teacher explains well.', 'その先生は説明が上手です。', 'Our teacher gave us homework.', '先生は私たちに宿題を出しました。', '/ˈtiːtʃər/', null),
('noun', 'student', '学生', 'She is a university student.', '彼女は大学生です。', 'The student asks many questions.', 'その学生はたくさん質問をします。', 'All students must wear uniforms.', 'すべての学生は制服を着なければなりません。', '/ˈstuːdənt/', null),
('noun', 'school', '学校', 'I go to school by bus.', '私はバスで学校に行きます。', 'Our school is very big.', '私たちの学校はとても大きいです。', 'The school starts at 8 AM.', '学校は午前8時に始まります。', '/skuːl/', null),
('noun', 'friend', '友達', 'He is my best friend.', '彼は私の親友です。', 'I met my friend yesterday.', '私は昨日友達に会いました。', 'Friends are very important in life.', '友達は人生においてとても大切です。', '/frend/', null),

-- Adjectives
('adjective', 'good', '良い', 'This is a good idea.', 'これは良いアイデアです。', 'She is good at English.', '彼女は英語が得意です。', 'The weather is good today.', '今日は天気が良いです。', '/ɡʊd/', null),
('adjective', 'easy', '簡単な', 'This test is easy.', 'このテストは簡単です。', 'English is easy to learn.', '英語は学ぶのが簡単です。', 'The easy questions come first.', '簡単な問題が最初に出ます。', '/ˈiːzi/', null),
('adjective', 'difficult', '難しい', 'Math is difficult for me.', '数学は私には難しいです。', 'This problem is very difficult.', 'この問題はとても難しいです。', 'Learning Japanese is difficult but fun.', '日本語を学ぶのは難しいですが楽しいです。', '/ˈdɪfɪkəlt/', null),
('adjective', 'important', '重要な', 'Health is very important.', '健康はとても重要です。', 'This is an important meeting.', 'これは重要な会議です。', 'Education is important for everyone.', '教育は誰にとっても重要です。', '/ɪmˈpɔːrtənt/', null),
('adjective', 'interesting', '面白い', 'The movie was very interesting.', 'その映画はとても面白かったです。', 'I find science interesting.', '私は科学を面白いと思います。', 'She told us an interesting story.', '彼女は私たちに面白い話をしてくれました。', '/ˈɪntrəstɪŋ/', null),

-- Adverbs
('adverb', 'quickly', '早く', 'Please come here quickly.', 'ここに早く来てください。', 'Time passes quickly.', '時間は早く過ぎます。', 'She quickly finished her homework.', '彼女は素早く宿題を終わらせました。', '/ˈkwɪkli/', null),
('adverb', 'slowly', 'ゆっくりと', 'Please speak slowly.', 'ゆっくり話してください。', 'Walk slowly on the ice.', '氷の上はゆっくり歩いてください。', 'The old man walked slowly.', '老人はゆっくりと歩きました。', '/ˈsloʊli/', null),
('adverb', 'carefully', '注意深く', 'Drive carefully.', '注意深く運転してください。', 'Read the instructions carefully.', '説明書を注意深く読んでください。', 'She carefully chose her words.', '彼女は注意深く言葉を選びました。', '/ˈkerfəli/', null),
('adverb', 'usually', '普通は', 'I usually wake up at 7 AM.', '私は普通7時に起きます。', 'She usually walks to work.', '彼女は普通歩いて仕事に行きます。', 'We usually eat dinner at home.', '私たちは普通家で夕食を食べます。', '/ˈjuːʒuəli/', null),
('adverb', 'often', 'しばしば', 'I often visit my grandmother.', '私はしばしば祖母を訪ねます。', 'We often eat out on weekends.', '私たちは週末によく外食します。', 'He often helps his neighbors.', '彼はしばしば近所の人を助けます。', '/ˈɔːfən/', null); 