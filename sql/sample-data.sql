-- Sample data for English learning app
-- This file contains comprehensive sample words data with 3 examples each

-- Clear existing data
DELETE FROM words;

-- Insert comprehensive sample words with 3 examples each
INSERT INTO words (category, word, japanese, example1, example1_jp, example2, example2_jp, example3, example3_jp, phonetic, audio_file) VALUES

-- Basic Verbs (動詞)
('verb', 'study', '勉強する', 'I study English every day.', '私は毎日英語を勉強します。', 'She studies hard for the exam.', '彼女は試験のために一生懸命勉強します。', 'We studied together at the library.', '私たちは図書館で一緒に勉強しました。', '/ˈstʌdi/', null),
('verb', 'learn', '学ぶ', 'We learn new things every day.', '私たちは毎日新しいことを学びます。', 'Children learn quickly.', '子供たちは素早く学びます。', 'I learned to drive last year.', '私は去年運転を覚えました。', '/lɜːrn/', null),
('verb', 'practice', '練習する', 'I practice piano every morning.', '私は毎朝ピアノを練習します。', 'Practice makes perfect.', '継続は力なり。', 'She practices speaking English daily.', '彼女は毎日英会話を練習しています。', '/ˈpræktɪs/', null),
('verb', 'understand', '理解する', 'Do you understand the question?', 'その質問を理解していますか？', 'I understand your feelings.', 'あなたの気持ちを理解します。', 'He finally understood the problem.', '彼はついにその問題を理解しました。', '/ˌʌndərˈstænd/', null),
('verb', 'remember', '覚える', 'I remember your name.', 'あなたの名前を覚えています。', 'Please remember to call me.', '私に電話することを忘れないでください。', 'She remembered the important date.', '彼女は重要な日付を覚えていました。', '/rɪˈmembər/', null),
('verb', 'work', '働く', 'I work at a bank.', '私は銀行で働いています。', 'He works very hard.', '彼はとても一生懸命働きます。', 'They worked together on the project.', '彼らはそのプロジェクトで一緒に働きました。', '/wɜːrk/', null),
('verb', 'live', '住む', 'I live in Tokyo.', '私は東京に住んでいます。', 'Where do you live?', 'どこに住んでいますか？', 'She lived in Paris for five years.', '彼女は5年間パリに住んでいました。', '/lɪv/', null),
('verb', 'eat', '食べる', 'I eat breakfast at 7 AM.', '私は午前7時に朝食を食べます。', 'What did you eat for lunch?', '昼食に何を食べましたか？', 'They ate dinner at the restaurant.', '彼らはレストランで夕食を食べました。', '/iːt/', null),
('verb', 'drink', '飲む', 'I drink coffee every morning.', '私は毎朝コーヒーを飲みます。', 'Please drink more water.', 'もっと水を飲んでください。', 'He drank tea with his friends.', '彼は友達とお茶を飲みました。', '/drɪŋk/', null),
('verb', 'go', '行く', 'I go to school by train.', '私は電車で学校に行きます。', 'Where are you going?', 'どこに行くのですか？', 'We went to the park yesterday.', '私たちは昨日公園に行きました。', '/ɡoʊ/', null),

-- Common Nouns (名詞)
('noun', 'book', '本', 'I read a book every night.', '私は毎晩本を読みます。', 'This book is very interesting.', 'この本はとても面白いです。', 'She borrowed three books from the library.', '彼女は図書館から3冊の本を借りました。', '/bʊk/', null),
('noun', 'teacher', '先生', 'My teacher is very kind.', '私の先生はとても親切です。', 'The teacher explains well.', 'その先生は説明が上手です。', 'Our teacher gave us homework.', '先生は私たちに宿題を出しました。', '/ˈtiːtʃər/', null),
('noun', 'student', '学生', 'She is a university student.', '彼女は大学生です。', 'The student asks many questions.', 'その学生はたくさん質問をします。', 'All students must wear uniforms.', 'すべての学生は制服を着なければなりません。', '/ˈstuːdənt/', null),
('noun', 'school', '学校', 'I go to school by bus.', '私はバスで学校に行きます。', 'Our school is very big.', '私たちの学校はとても大きいです。', 'The school starts at 8 AM.', '学校は午前8時に始まります。', '/skuːl/', null),
('noun', 'friend', '友達', 'He is my best friend.', '彼は私の親友です。', 'I met my friend yesterday.', '私は昨日友達に会いました。', 'Friends are very important in life.', '友達は人生においてとても大切です。', '/frend/', null),
('noun', 'family', '家族', 'I love my family.', '私は家族を愛しています。', 'My family is very big.', '私の家族はとても大きいです。', 'Family time is precious.', '家族の時間は貴重です。', '/ˈfæməli/', null),
('noun', 'house', '家', 'I live in a small house.', '私は小さな家に住んでいます。', 'Their house is beautiful.', '彼らの家は美しいです。', 'We bought a new house last year.', '私たちは去年新しい家を買いました。', '/haʊs/', null),
('noun', 'car', '車', 'I drive my car to work.', '私は車で仕事に行きます。', 'His car is very fast.', '彼の車はとても速いです。', 'They bought a new car yesterday.', '彼らは昨日新しい車を買いました。', '/kɑːr/', null),
('noun', 'computer', 'コンピューター', 'I use my computer every day.', '私は毎日コンピューターを使います。', 'This computer is very fast.', 'このコンピューターはとても速いです。', 'She fixed the broken computer.', '彼女は壊れたコンピューターを修理しました。', '/kəmˈpjuːtər/', null),
('noun', 'phone', '電話', 'My phone is ringing.', '私の電話が鳴っています。', 'Can I use your phone?', 'あなたの電話を使えますか？', 'She lost her phone yesterday.', '彼女は昨日電話を失くしました。', '/foʊn/', null),

-- Essential Adjectives (形容詞)
('adjective', 'good', '良い', 'This is a good idea.', 'これは良いアイデアです。', 'She is good at English.', '彼女は英語が得意です。', 'The weather is good today.', '今日は天気が良いです。', '/ɡʊd/', null),
('adjective', 'bad', '悪い', 'This is bad weather.', 'これは悪い天気です。', 'Smoking is bad for health.', '喫煙は健康に悪いです。', 'He had a bad day yesterday.', '彼は昨日悪い日でした。', '/bæd/', null),
('adjective', 'big', '大きい', 'Tokyo is a big city.', '東京は大きな都市です。', 'He has a big house.', '彼は大きな家を持っています。', 'This is a big problem.', 'これは大きな問題です。', '/bɪɡ/', null),
('adjective', 'small', '小さい', 'I live in a small town.', '私は小さな町に住んでいます。', 'She has small hands.', '彼女は小さな手をしています。', 'This room is too small.', 'この部屋は小さすぎます。', '/smɔːl/', null),
('adjective', 'easy', '簡単な', 'This test is easy.', 'このテストは簡単です。', 'English is easy to learn.', '英語は学ぶのが簡単です。', 'The easy questions come first.', '簡単な問題が最初に出ます。', '/ˈiːzi/', null),
('adjective', 'difficult', '難しい', 'Math is difficult for me.', '数学は私には難しいです。', 'This problem is very difficult.', 'この問題はとても難しいです。', 'Learning Japanese is difficult but fun.', '日本語を学ぶのは難しいですが楽しいです。', '/ˈdɪfɪkəlt/', null),
('adjective', 'important', '重要な', 'Health is very important.', '健康はとても重要です。', 'This is an important meeting.', 'これは重要な会議です。', 'Education is important for everyone.', '教育は誰にとっても重要です。', '/ɪmˈpɔːrtənt/', null),
('adjective', 'interesting', '面白い', 'The movie was very interesting.', 'その映画はとても面白かったです。', 'I find science interesting.', '私は科学を面白いと思います。', 'She told us an interesting story.', '彼女は私たちに面白い話をしてくれました。', '/ˈɪntrəstɪŋ/', null),
('adjective', 'beautiful', '美しい', 'She is very beautiful.', '彼女はとても美しいです。', 'The sunset is beautiful today.', '今日の夕日は美しいです。', 'They visited a beautiful garden.', '彼らは美しい庭園を訪れました。', '/ˈbjuːtɪfəl/', null),
('adjective', 'new', '新しい', 'I bought a new car.', '私は新しい車を買いました。', 'This is my new house.', 'これは私の新しい家です。', 'She wore a new dress.', '彼女は新しいドレスを着ていました。', '/nuː/', null),

-- Common Adverbs (副詞)
('adverb', 'quickly', '早く', 'Please come here quickly.', 'ここに早く来てください。', 'Time passes quickly.', '時間は早く過ぎます。', 'She quickly finished her homework.', '彼女は素早く宿題を終わらせました。', '/ˈkwɪkli/', null),
('adverb', 'slowly', 'ゆっくりと', 'Please speak slowly.', 'ゆっくり話してください。', 'Walk slowly on the ice.', '氷の上はゆっくり歩いてください。', 'The old man walked slowly.', '老人はゆっくりと歩きました。', '/ˈsloʊli/', null),
('adverb', 'carefully', '注意深く', 'Drive carefully.', '注意深く運転してください。', 'Read the instructions carefully.', '説明書を注意深く読んでください。', 'She carefully chose her words.', '彼女は注意深く言葉を選びました。', '/ˈkerfəli/', null),
('adverb', 'usually', '普通は', 'I usually wake up at 7 AM.', '私は普通7時に起きます。', 'She usually walks to work.', '彼女は普通歩いて仕事に行きます。', 'We usually eat dinner at home.', '私たちは普通家で夕食を食べます。', '/ˈjuːʒuəli/', null),
('adverb', 'often', 'しばしば', 'I often visit my grandmother.', '私はしばしば祖母を訪ねます。', 'We often eat out on weekends.', '私たちは週末によく外食します。', 'He often helps his neighbors.', '彼はしばしば近所の人を助けます。', '/ˈɔːfən/', null),
('adverb', 'always', 'いつも', 'I always brush my teeth.', '私はいつも歯を磨きます。', 'She always arrives on time.', '彼女はいつも時間通りに到着します。', 'He always helps his friends.', '彼はいつも友達を助けます。', '/ˈɔːlweɪz/', null),
('adverb', 'never', '決して〜ない', 'I never smoke.', '私は決してタバコを吸いません。', 'She never gives up.', '彼女は決して諦めません。', 'He never forgets his promise.', '彼は決して約束を忘れません。', '/ˈnevər/', null),
('adverb', 'sometimes', '時々', 'I sometimes go shopping.', '私は時々買い物に行きます。', 'Sometimes it rains here.', 'ここは時々雨が降ります。', 'She sometimes visits her parents.', '彼女は時々両親を訪ねます。', '/ˈsʌmtaɪmz/', null),
('adverb', 'today', '今日', 'I am very busy today.', '私は今日とても忙しいです。', 'What are you doing today?', '今日は何をしていますか？', 'Today is a beautiful day.', '今日は美しい日です。', '/təˈdeɪ/', null),
('adverb', 'tomorrow', '明日', 'I will call you tomorrow.', '明日あなたに電話します。', 'Tomorrow is Saturday.', '明日は土曜日です。', 'She is leaving tomorrow.', '彼女は明日出発します。', '/təˈmɔːroʊ/', null),

-- Additional Categories

-- Colors (色)
('adjective', 'red', '赤い', 'She wore a red dress.', '彼女は赤いドレスを着ていました。', 'The red car is mine.', '赤い車は私のものです。', 'I like red apples.', '私は赤いリンゴが好きです。', '/red/', null),
('adjective', 'blue', '青い', 'The sky is blue today.', '今日の空は青いです。', 'He has blue eyes.', '彼は青い目をしています。', 'I bought a blue shirt.', '私は青いシャツを買いました。', '/bluː/', null),
('adjective', 'green', '緑の', 'The leaves are green.', '葉は緑色です。', 'She likes green tea.', '彼女は緑茶が好きです。', 'We have a green car.', '私たちは緑の車を持っています。', '/ɡriːn/', null),

-- Numbers (数字)
('noun', 'one', '一', 'I have one brother.', '私には兄弟が一人います。', 'One plus one equals two.', '1足す1は2です。', 'She bought one apple.', '彼女はリンゴを一つ買いました。', '/wʌn/', null),
('noun', 'two', '二', 'I have two sisters.', '私には姉妹が二人います。', 'Two plus two equals four.', '2足す2は4です。', 'He ate two sandwiches.', '彼はサンドイッチを二つ食べました。', '/tuː/', null),
('noun', 'three', '三', 'I have three cats.', '私は猫を三匹飼っています。', 'Three is my lucky number.', '3は私のラッキーナンバーです。', 'She read three books.', '彼女は本を三冊読みました。', '/θriː/', null),

-- Time (時間)
('noun', 'morning', '朝', 'I exercise every morning.', '私は毎朝運動します。', 'Good morning!', 'おはようございます！', 'The morning sun is beautiful.', '朝日は美しいです。', '/ˈmɔːrnɪŋ/', null),
('noun', 'afternoon', '午後', 'I study in the afternoon.', '私は午後に勉強します。', 'Good afternoon!', 'こんにちは！', 'The afternoon was very hot.', '午後はとても暑かったです。', '/ˌæftərˈnuːn/', null),
('noun', 'evening', '夕方', 'I walk in the evening.', '私は夕方に散歩します。', 'Good evening!', 'こんばんは！', 'The evening sky is beautiful.', '夕方の空は美しいです。', '/ˈiːvnɪŋ/', null),

-- Weather (天気)
('noun', 'sun', '太陽', 'The sun is shining.', '太陽が輝いています。', 'I love the warm sun.', '私は暖かい太陽が好きです。', 'The sun rises in the east.', '太陽は東から昇ります。', '/sʌn/', null),
('noun', 'rain', '雨', 'It will rain tomorrow.', '明日は雨が降ります。', 'I like the sound of rain.', '私は雨の音が好きです。', 'The rain stopped this morning.', '雨は今朝止みました。', '/reɪn/', null),
('noun', 'snow', '雪', 'I love snow in winter.', '私は冬の雪が好きです。', 'The snow is very white.', '雪はとても白いです。', 'Children play in the snow.', '子供たちは雪の中で遊びます。', '/snoʊ/', null); 