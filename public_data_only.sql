SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."admins" ("id", "email", "name", "role", "is_active", "last_login", "created_at", "updated_at") FROM stdin;
93520150-b656-4f04-8d0c-d2319f12936b	admin@example.com	システム管理者	super_admin	t	\N	2025-08-06 16:25:14.32443+00	2025-08-06 16:25:14.32443+00
96f18261-ef4c-4ca9-8482-1664e25898af	content@example.com	コンテンツ管理者	admin	t	\N	2025-08-06 16:25:14.32443+00	2025-08-06 16:25:14.32443+00
ab6938bf-cfc8-40cf-a579-aa0ad9a58869	annya200279@gmail.com	BossBoss	admin	t	\N	2025-08-06 16:25:14.32443+00	2025-08-06 16:25:14.32443+00
31878e51-ddce-49a5-8bca-985c48ed887a	editer@test.local	編集者	admin	t	\N	2025-08-06 16:00:43.095447+00	2025-08-23 08:54:20.498235+00
\.


--
-- Data for Name: admin_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."admin_activity_logs" ("id", "admin_id", "action", "resource_type", "resource_id", "details", "ip_address", "user_agent", "created_at") FROM stdin;
\.


--
-- Data for Name: admin_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."admin_requests" ("id", "user_id", "email", "name", "reason", "status", "reviewed_by", "reviewed_at", "review_notes", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."admin_sessions" ("id", "admin_id", "token", "expires_at", "created_at") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."categories" ("id", "name", "description", "icon", "color", "sort_order", "is_active", "created_by", "created_at", "updated_at") FROM stdin;
b464ce08-9440-4178-923f-4d251b8dc0ab	動詞	動作や状態を表す動詞	⚡	#3B82F6	1	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
6effaf5d-619c-4a70-b36d-9464549eadda	句動詞	動詞と前置詞・副詞の組み合わせ	🔗	#8B5CF6	2	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
659c3f6d-2e93-47b9-9fe3-c6838a82f6b9	形容詞	人や物の性質・状態を表す形容詞	🎨	#10B981	3	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
71bfd0a1-cc79-4257-bd4a-15d30d37555f	副詞	動詞・形容詞・副詞を修飾する副詞	⚙️	#F59E0B	4	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
618464f6-6c7a-450a-9074-89e6d7becef9	名詞	人・物・事柄を表す名詞	📦	#EF4444	5	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
db7620f6-7347-4cec-8a88-da3f8a27cc98	フレーズ	よく使われる表現やフレーズ	💬	#06B6D4	6	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
fd181354-21ea-48d7-b4fa-8b6e1ca0264c	イディオム	慣用句やイディオム	🎭	#EC4899	7	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
301aab35-e5ee-4136-98ba-ca272bb813d4	リアクション	感情や反応を表す表現	😊	#84CC16	8	t	\N	2025-08-06 16:25:25.844459+00	2025-08-06 16:25:25.844459+00
\.


--
-- Data for Name: words; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."words" ("id", "category_id", "category", "section", "word", "japanese", "example1", "example2", "example3", "example1_jp", "example2_jp", "example3_jp", "audio_file", "phonetic", "is_active", "trivia_content_jp", "created_at", "updated_at") FROM stdin;
88aa10e8-fc4b-44c8-b4c8-3cb34a90450f	\N	句動詞	2	check out	確認する、見てみる、チェックアウトする	Check out this new cafe.	I’ll check out the sale later.	We checked out at 10 a.m.	この新しいカフェ見てみて。	後でセールを見てくるね。	私たちは午前10時にチェックアウトしたよ。	check out/word.mp3	\N	t	\N	2025-08-11 09:32:08.980776+00	2025-08-13 15:08:10.004006+00
d585996a-e2b4-4521-a55f-487fc7285cfc	\N	句動詞	2	come in	入る	Please come in.	Come in, it’s cold outside.	He came in without knocking.	どうぞ入って。	入って、外は寒いよ。	彼はノックせずに入ってきたよ。	come in/word.mp3	\N	t	\N	2025-08-11 09:32:08.128107+00	2025-08-13 15:08:10.109375+00
efacee31-ed6a-4b05-968c-c1afef6d10fe	\N	句動詞	1	find out	知る、分かる、見つけ出す	I found out she moved.	I found out the shop is closed today.	I found out it’s going to rain tomorrow.	彼女が引っ越したって知ったよ。	今日その店が休みって分かった。	明日雨が降るって分かったよ。	find out/word.mp3	\N	t	\N	2025-08-11 09:32:06.411086+00	2025-08-13 15:08:10.222436+00
3c403d35-0825-4a35-955a-b4beb725265e	\N	句動詞	2	get in	（車などに）乗る	Get in the car.	I got in the taxi.	She got in the bus quickly.	車に乗って。	タクシーに乗ったよ。	彼女は急いでバスに乗ったよ。	get in/word.mp3	\N	t	\N	2025-08-11 09:32:08.337263+00	2025-08-13 15:08:10.394131+00
8f703c54-33ca-4e3a-b999-40c02acd0f82	\N	句動詞	2	get out	（車などから）降りる、外へ出る	Get out of the car here.	I got out of the taxi.	She got out and ran inside.	ここで車から降りて。	タクシーから降りたよ。	彼女は降りて中へ走って行ったよ。	get out/word.mp3	\N	t	\N	2025-08-11 09:32:08.571921+00	2025-08-13 15:08:10.484482+00
2e15bbaa-8ae6-4255-b4de-53cb952b639a	\N	句動詞	1	get up	起きる、立ち上がる	I got up at six today.	Get up, it’s time for school.	I got up from the sofa.	今日は6時に起きたよ。	起きて、学校の時間だよ。	ソファから立ち上がった。	get up/word.mp3	\N	t	\N	2025-08-11 09:32:06.651274+00	2025-08-13 15:08:10.577871+00
b9e27bbf-f52a-497e-9e59-e83568ee46ed	\N	句動詞	1	give up	諦める、やめる	I won’t give up on my diet.	Don’t give up yet.	I gave up cooking and ordered pizza.	ダイエットは諦めないよ。	まだ諦めないで。	料理は諦めてピザを頼んだよ。	give up/word.mp3	\N	t	\N	2025-08-11 09:32:07.196408+00	2025-08-13 15:08:10.698507+00
d314fd74-a2f2-45d3-9706-eb6370b8af40	\N	句動詞	2	go out	外出する、出かける	I’m going out for dinner tonight.	Let’s go out for a walk.	She went out to buy milk.	今夜は夕飯を食べに出かけるよ。	散歩に行こうよ。	彼女は牛乳を買いに出かけたよ。	go out/word.mp3	\N	t	\N	2025-08-11 09:32:07.892522+00	2025-08-13 15:08:10.789707+00
4a5bf037-40b4-402c-a1ce-76c5e63089c4	\N	句動詞	2	hang out	遊ぶ、ぶらぶらする	Let’s hang out at the mall.	I’m hanging out with my friends today.	The kids are hanging out in the park.	モールで遊ぼうよ。	今日は友達と遊んでるよ。	子どもたちは公園で遊んでるよ。	hang out/word.mp3	\N	t	\N	2025-08-11 09:32:08.793716+00	2025-08-13 15:08:10.875311+00
6b4da5dc-a891-4542-9aa3-f45fd778737a	\N	句動詞	1	look for	探す	I’m looking for my glasses.	I’m looking for a parking spot.	I’m looking for my phone.	メガネを探してるの。	駐車場を探してるの。	携帯を探してるの。	look for/word.mp3	\N	t	\N	2025-08-11 09:32:06.204203+00	2025-08-13 15:08:11.133111+00
eab1c454-ffa2-4ae5-ab1d-2915817b4b6f	\N	句動詞	1	pick up	拾う、迎えに行く	I’ll pick up the kids from school.	Can you pick up that pen?	I’ll pick up some bread on the way home.	学校まで子どもを迎えに行くね。	そのペン拾ってくれる？	帰りにパンを買ってくるね。	pick up/word.mp3	\N	t	\N	2025-08-11 09:32:05.878858+00	2025-08-13 15:08:11.292003+00
b06f6883-bf86-4b4a-a74e-fd1422e8c70d	\N	句動詞	1	put on	着る、身につける	I put on my coat.	Put on your shoes.	I put on some makeup.	コートを着たよ。	靴を履いて。	化粧をしたよ。	put on/word.mp3	\N	t	\N	2025-08-11 09:32:07.430709+00	2025-08-13 15:08:11.379395+00
a097febb-0c44-4e94-a002-b8172ba78593	\N	句動詞	1	run out of	切らす、使い果たす	I ran out of milk this morning.	We ran out of toilet paper.	I ran out of sugar for the coffee.	今朝牛乳を切らしちゃった。	トイレットペーパーがなくなった。	コーヒー用の砂糖を切らしちゃった。	run out of/word.mp3	\N	t	\N	2025-08-11 09:32:05.188173+00	2025-08-13 15:08:11.472607+00
c6d3dddd-502d-4714-8727-c8186f549961	\N	句動詞	2	show up	現れる、姿を見せる	He showed up late.	She didn’t show up at the party.	My friend showed up at my house.	彼は遅れて現れたよ。	彼女はパーティーに来なかったよ。	友達が家に来たよ。	show up/word.mp3	\N	t	\N	2025-08-11 09:32:09.178983+00	2025-08-13 15:08:11.554418+00
6db1a413-a359-474a-956a-7d651752ec26	\N	句動詞	2	take off	脱ぐ、離陸する	I took off my jacket.	Take off your shoes here.	The plane took off on time.	ジャケットを脱いだよ。	ここで靴を脱いでね。	飛行機は時間通りに離陸したよ。	take off/word.mp3	\N	t	\N	2025-08-11 09:32:07.669046+00	2025-08-13 15:08:11.750253+00
79b18102-f86f-48df-ac7d-cdea6cfcbc39	\N	句動詞	1	turn off	（電気などを）消す	Please turn off the light.	I turned off the air conditioner.	Can you turn off the TV?	電気を消して。	エアコンを消したよ。	テレビを消してくれる？	turn off/word.mp3	\N	t	\N	2025-08-11 09:32:05.626681+00	2025-08-13 15:08:11.846635+00
835fa5a1-b7f6-43bd-b92d-7a072fad78e3	\N	句動詞	1	turn on	（電気などを）つける	Please turn on the light.	I turned on the heater.	Can you turn on the TV?	電気をつけて。	ヒーターをつけたよ。	テレビをつけてくれる？	turn on/word.mp3	\N	t	\N	2025-08-11 09:32:05.43866+00	2025-08-13 15:08:11.924743+00
6a3b25f5-487d-4672-8579-d95facb5587d	\N	句動詞	1	wake up	目を覚ます	I woke up at seven today.	Wake up, breakfast is ready.	I can’t wake up early on Sundays.	今日は7時に目が覚めたよ。	起きて、朝ごはんできたよ。	日曜は早く起きられないんだ。	wake up/word.mp3	\N	t	\N	2025-08-11 09:32:06.918478+00	2025-08-13 15:08:12.016763+00
7a239e43-fe4c-4bb4-aa64-528ff94da337	\N	句動詞	3	break up	別れる、解散する	They broke up last month.	The band broke up.	We decided to break up.	彼らは先月別れたよ。	そのバンドは解散したよ。	私たちは別れることにしたよ。	break up/word.mp3	\N	t	\N	2025-08-11 09:32:09.901859+00	2025-08-13 15:08:09.666045+00
30bf6fb7-fccd-45cd-a121-d09adc2e228b	\N	句動詞	2	carry on	続ける	Carry on with your work.	She carried on talking.	Carry on, you’re doing great.	仕事を続けて。	彼女は話し続けたよ。	続けて、その調子だよ。	carry on/word.mp3	\N	t	\N	2025-08-11 09:32:09.580075+00	2025-08-13 15:08:09.772809+00
1d917f4b-8664-458d-8fa5-726a2b0351f1	\N	句動詞	3	catch up	追いつく	I need to catch up on my laundry.	Run faster to catch up with her.	Let’s catch up over coffee.	たまった洗濯を片付けないと。	もっと走って彼女に追いついて。	コーヒーを飲みながら近況を話そう。	catch up/word.mp3	\N	t	\N	2025-08-11 09:32:10.434578+00	2025-08-13 15:08:09.895739+00
f06aa8f3-c4e0-428d-8acf-f6c5970e6aad	\N	句動詞	3	get along	仲良くする	They get along well.	Do you get along with your neighbors?	The kids don’t get along today.	彼らは仲がいいよ。	近所の人と仲良くしてる？	今日は子どもたち仲が悪いね。	get along/word.mp3	\N	t	\N	2025-08-11 09:32:09.73568+00	2025-08-13 15:08:10.31107+00
36df238e-c32b-4046-83db-5451755d121c	\N	句動詞	2	hold on	ちょっと待つ、電話を切らずに待つ	Hold on a second.	Hold on, I’ll get my bag.	Please hold on, I’ll transfer your call.	ちょっと待って。	待って、バッグ取ってくる。	お待ちください、お電話をおつなぎします。	hold on/word.mp3	\N	t	\N	2025-08-11 09:32:09.383068+00	2025-08-13 15:08:10.966372+00
c5319aa3-7b1b-4a5d-bbb3-1d1e0d527c30	\N	句動詞	3	keep up	遅れずについていく、維持する	Keep up the good work.	I can’t keep up with the kids.	She keeps up her English practice.	その調子で頑張って。	子どもたちについていけないよ。	彼女は英語の練習を続けてるよ。	keep up/word.mp3	\N	t	\N	2025-08-11 09:32:10.593209+00	2025-08-13 15:08:11.044535+00
8512d84e-9d26-4121-854f-b60fe9d92ece	\N	句動詞	3	make up	仲直りする、埋め合わせる、化粧する	They made up after the fight.	I’ll make up for being late.	She made up before going out.	けんかの後、仲直りしたよ。	遅れた分は埋め合わせするね。	彼女は出かける前に化粧をしたよ。	make up/word.mp3	\N	t	\N	2025-08-11 09:32:10.081008+00	2025-08-13 15:08:11.211782+00
6513d935-4f39-4a17-9541-ceb2a5803fce	\N	句動詞	3	watch out	気をつける、注意する	Watch out for cars.	Watch out, it’s slippery.	Watch out for that step.	車に気をつけて。	気をつけて、滑るよ。	その段差に気をつけて。	watch out/word.mp3	\N	t	\N	2025-08-11 09:32:10.263199+00	2025-08-13 15:08:12.096684+00
c1ef8163-c56c-42cc-b7e3-ab7249391238	\N	句動詞	3	take care of	世話をする、処理する	I’ll take care of dinner.	She takes care of the garden.	I’ll take care of the laundry.	夕食は私が作るね。	彼女は庭の世話をしてるよ。	洗濯は私がやるね。	take care of/word.mp3	teɪk keər ɒv	t		2025-08-11 09:32:10.754564+00	2025-08-16 10:35:20.770589+00
\.


--
-- Data for Name: audio_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."audio_files" ("id", "word_id", "file_name", "file_path", "file_size", "mime_type", "duration_seconds", "uploaded_by", "is_active", "file_index", "audio_type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: chunk_english_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."chunk_english_data" ("id", "chunk_text", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: contact_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."contact_inquiries" ("id", "name", "email", "subject", "message", "category", "priority", "status", "user_id", "assigned_to", "ip_address", "user_agent", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: review_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."review_sessions" ("id", "user_id", "total_words", "completed_words", "correct_answers", "start_time", "end_time", "created_at") FROM stdin;
e5e6bce2-74f8-48d3-9da2-be78de11248f	3b5b2498-86ed-4ed8-968d-b98a0e286c43	1	1	1	2025-08-14 15:18:10.581+00	2025-08-14 15:18:22.207+00	2025-08-14 15:18:10.582+00
\.


--
-- Data for Name: review_words; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."review_words" ("id", "user_id", "word_id", "added_at", "review_count", "last_reviewed", "next_review", "difficulty_level") FROM stdin;
b7f03c7f-a412-4458-b686-acf0384e4466	cf4c8052-b87b-41f8-90bd-4ff01118ab18	d585996a-e2b4-4521-a55f-487fc7285cfc	2025-08-13 13:52:34.196+00	0	\N	\N	3
18c6bbae-07fd-461a-a2cb-1886d51ecb22	3b5b2498-86ed-4ed8-968d-b98a0e286c43	6db1a413-a359-474a-956a-7d651752ec26	2025-08-30 03:42:40.221+00	0	\N	\N	3
9fb5b029-cbbe-4362-9410-e5dd0d80900a	cf4c8052-b87b-41f8-90bd-4ff01118ab18	a097febb-0c44-4e94-a002-b8172ba78593	2025-09-04 11:20:25.102+00	0	\N	\N	3
19536f2a-c2e8-4a74-a931-03f0d7988d11	cf4c8052-b87b-41f8-90bd-4ff01118ab18	79b18102-f86f-48df-ac7d-cdea6cfcbc39	2025-09-04 11:20:26.516+00	0	\N	\N	3
969dc834-0973-468a-a6e6-781a74f762c3	cf4c8052-b87b-41f8-90bd-4ff01118ab18	7a239e43-fe4c-4bb4-aa64-528ff94da337	2025-09-04 11:21:08.06+00	0	\N	\N	3
df82df41-3a5d-491d-89ed-8d2856d49cef	cf4c8052-b87b-41f8-90bd-4ff01118ab18	1d917f4b-8664-458d-8fa5-726a2b0351f1	2025-09-04 11:21:09.485+00	0	\N	\N	3
e4e87b68-201b-4783-b98a-10a18aa31255	cf4c8052-b87b-41f8-90bd-4ff01118ab18	f06aa8f3-c4e0-428d-8acf-f6c5970e6aad	2025-09-04 11:21:10.483+00	0	\N	\N	3
2412eb54-9215-4652-99df-f0481261d29c	cf4c8052-b87b-41f8-90bd-4ff01118ab18	88aa10e8-fc4b-44c8-b4c8-3cb34a90450f	2025-09-04 11:22:22.079+00	0	\N	\N	3
471e1c9f-e34a-4440-8509-0e1d03b837c2	cf4c8052-b87b-41f8-90bd-4ff01118ab18	3c403d35-0825-4a35-955a-b4beb725265e	2025-09-04 11:22:26.2+00	0	\N	\N	3
9c8b6ca6-813a-4417-8b63-da22bf5f7fee	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	efacee31-ed6a-4b05-968c-c1afef6d10fe	2025-09-07 11:06:24.695+00	0	\N	\N	3
\.


--
-- Data for Name: security_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."security_audit_log" ("id", "user_id", "action", "table_name", "record_id", "ip_address", "user_agent", "created_at") FROM stdin;
\.


--
-- Data for Name: study_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."study_sessions" ("id", "user_id", "category", "mode", "total_words", "completed_words", "correct_answers", "start_time", "end_time", "created_at") FROM stdin;
687950df-dbaa-4ff5-89cc-fedc806c2c37	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	2	2	2	2025-08-10 05:50:07.803+00	2025-08-10 05:50:07.803+00	2025-08-10 05:50:07.803+00
358343cc-8cc8-4255-b209-a4a3f941dda9	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	14	14	14	2025-08-11 13:40:05.442+00	2025-08-11 13:40:05.442+00	2025-08-11 13:40:05.442+00
478b2283-eb7b-45f7-bb51-b15f918cabdc	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	14	14	14	2025-08-11 13:40:06.729+00	2025-08-11 13:40:06.729+00	2025-08-11 13:40:06.729+00
8be283b4-1f8c-48b8-9b33-f6fe6ff91ac9	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	27	27	27	2025-08-13 13:49:18.537+00	2025-08-13 13:49:18.537+00	2025-08-13 13:49:18.537+00
2cc70fb6-5ca4-465d-9ce9-e315cd1afdf3	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	27	27	27	2025-08-13 13:50:53.232+00	2025-08-13 13:50:53.232+00	2025-08-13 13:50:53.232+00
601ef37a-1d30-4ec7-a3f2-638bb7a61c05	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-13 16:36:36.074+00	2025-08-13 16:36:36.074+00	2025-08-13 16:36:36.074+00
e63f3362-c3de-47ad-a4d0-9233c38cf209	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	16	16	16	2025-08-13 16:40:58.983+00	2025-08-13 16:40:58.983+00	2025-08-13 16:40:58.983+00
f7859442-f8c3-4ac0-a696-ed2cc814e2f2	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-13 23:54:09.976+00	2025-08-13 23:54:09.977+00	2025-08-13 23:54:09.977+00
9ecd0722-5203-40d7-baa2-44788d29fea4	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-13 23:55:49.76+00	2025-08-13 23:55:49.76+00	2025-08-13 23:55:49.761+00
7b7dcb4a-55b5-47b3-bf08-bec9a471d105	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-13 23:56:46.161+00	2025-08-13 23:56:46.161+00	2025-08-13 23:56:46.161+00
f3d954ac-9f5e-4a6b-824c-c5608e70d03e	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-13 23:57:49.783+00	2025-08-13 23:57:49.783+00	2025-08-13 23:57:49.783+00
2cb1af38-6d90-42be-884c-0666c349df9b	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-13 23:59:18.342+00	2025-08-13 23:59:18.342+00	2025-08-13 23:59:18.342+00
dd5f14ed-f90f-48ed-ab9a-17ec65a59106	876333fe-6b05-49a9-a732-1e67a07c9f19	句動詞	flashcard	10	10	10	2025-08-14 02:09:31.959+00	2025-08-14 02:09:31.959+00	2025-08-14 02:09:31.959+00
88f04c33-3972-4424-a00f-e764d0caea11	876333fe-6b05-49a9-a732-1e67a07c9f19	句動詞	flashcard	10	10	10	2025-08-14 02:11:13.186+00	2025-08-14 02:11:13.186+00	2025-08-14 02:11:13.187+00
79638638-490d-4727-b524-1910a952cee3	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 08:46:33.813+00	2025-08-14 08:46:33.813+00	2025-08-14 08:46:33.814+00
aef33d2c-80ab-4a22-b6e1-dccd262d7377	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 08:46:48.346+00	2025-08-14 08:46:48.346+00	2025-08-14 08:46:48.346+00
23f4f988-f260-4670-8841-26447bf0c961	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 08:55:58.8+00	2025-08-14 08:55:58.8+00	2025-08-14 08:55:58.8+00
066cbbdf-bea7-4806-806f-b9d32fba6aea	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:04:33.462+00	2025-08-14 11:04:33.464+00	2025-08-14 11:04:33.465+00
e54642b3-a41d-4853-9783-bd8266c96bd7	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:04:54.766+00	2025-08-14 11:04:54.766+00	2025-08-14 11:04:54.766+00
eb12c638-2af1-4ca0-a316-d5258f6a4a88	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-14 11:05:12.314+00	2025-08-14 11:05:12.314+00	2025-08-14 11:05:12.315+00
4dc95177-1ed0-4eea-a43e-a5dd96b9d254	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:05:38.02+00	2025-08-14 11:05:38.02+00	2025-08-14 11:05:38.02+00
2ffb4d18-9cb4-4e05-82f8-5e58cdec2409	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:05:53.796+00	2025-08-14 11:05:53.796+00	2025-08-14 11:05:53.796+00
c5d584d7-e2f0-44df-8516-08a9c79c26ba	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:06:09.6+00	2025-08-14 11:06:09.6+00	2025-08-14 11:06:09.6+00
1c625a68-80a6-4fe5-a5c3-04791c165249	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:06:13.112+00	2025-08-14 11:06:13.112+00	2025-08-14 11:06:13.112+00
74d8824e-5fd9-436c-a249-9e8c0031b5c5	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:06:32.302+00	2025-08-14 11:06:32.302+00	2025-08-14 11:06:32.302+00
c6ec74f2-bb26-4461-abec-acd5ca8dad9f	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-14 11:06:48.525+00	2025-08-14 11:06:48.525+00	2025-08-14 11:06:48.525+00
c7faf0fe-7fc3-49ff-80f4-9ab5404f1800	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-14 11:09:20.564+00	2025-08-14 11:09:20.564+00	2025-08-14 11:09:20.565+00
7149afba-3739-4ed8-93fa-dedfee96259c	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	39	39	38	2025-08-14 15:13:51.154+00	2025-08-14 15:13:51.154+00	2025-08-14 15:13:51.154+00
ad2636b0-61e6-4452-ae2f-9859cef3b7b6	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	40	40	39	2025-08-14 15:14:14.675+00	2025-08-14 15:14:14.675+00	2025-08-14 15:14:14.675+00
46977244-bcd0-4fd5-ac26-c5b4dfb60813	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	41	41	40	2025-08-14 15:14:23.289+00	2025-08-14 15:14:23.289+00	2025-08-14 15:14:23.29+00
a9f2e0b8-1341-4a2a-9c8b-f345582d3a17	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	17	17	16	2025-08-14 22:03:11.328+00	2025-08-14 22:03:11.33+00	2025-08-14 22:03:11.33+00
1fd1027b-ef4b-4e2f-b4b7-4d77920709f4	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:28:40.763+00	2025-08-15 01:28:40.765+00	2025-08-15 01:28:40.765+00
559fc592-40e7-4136-acd2-4c345fbf4c23	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:28:48.31+00	2025-08-15 01:28:48.31+00	2025-08-15 01:28:48.311+00
34b4b96f-eb66-462f-a6d1-34f2d62b43c8	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:29:19.966+00	2025-08-15 01:29:19.966+00	2025-08-15 01:29:19.966+00
ca3ffa42-7ec1-4519-b6bd-4a559135f36c	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:35:21.253+00	2025-08-15 01:35:21.253+00	2025-08-15 01:35:21.254+00
0bd3247d-d713-40fa-b433-bba999eebedc	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-15 01:38:33.876+00	2025-08-15 01:38:33.876+00	2025-08-15 01:38:33.877+00
67d43625-645b-427b-ae4f-7e9b6eff65e0	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:43:15.974+00	2025-08-15 01:43:15.974+00	2025-08-15 01:43:15.975+00
7fd41bc2-4388-4a1e-9503-a6a87c0cf9cb	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	7	7	7	2025-08-15 01:48:50.007+00	2025-08-15 01:48:50.007+00	2025-08-15 01:48:50.007+00
33f0306e-bc4d-41bd-b512-04ee101ba608	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-15 02:00:10.447+00	2025-08-15 02:00:10.447+00	2025-08-15 02:00:10.448+00
5ba443b5-ca53-4ca2-9c5a-424ae8857082	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	10	10	10	2025-08-15 02:00:17.818+00	2025-08-15 02:00:17.818+00	2025-08-15 02:00:17.818+00
33715e0b-093f-47d9-9339-48cf762feea3	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	16	16	16	2025-08-15 02:11:44.896+00	2025-08-15 02:11:44.896+00	2025-08-15 02:11:44.897+00
fec8a2f0-06e5-40cd-bf78-e04e225dffcc	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	quiz	17	17	17	2025-08-15 02:11:51.29+00	2025-08-15 02:11:51.29+00	2025-08-15 02:11:51.29+00
dcda17e4-c143-4761-ad26-e338e094c91b	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-18 10:42:26.14+00	2025-08-18 10:42:26.14+00	2025-08-18 10:42:26.141+00
dbf3c0b1-64c5-4e59-bd87-c321445c461d	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-19 14:05:01.009+00	2025-08-19 14:05:01.011+00	2025-08-19 14:05:01.012+00
cd24207c-a21d-4adb-b57f-6352e9a00257	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 07:00:08.152+00	2025-08-20 07:00:08.152+00	2025-08-20 07:00:08.153+00
2245b546-8766-45a0-878e-7adc6681877b	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 07:03:53.66+00	2025-08-20 07:03:53.66+00	2025-08-20 07:03:53.66+00
485aa0ad-6719-42fd-bdea-7599a675f0df	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 07:05:49.389+00	2025-08-20 07:05:49.389+00	2025-08-20 07:05:49.389+00
50eaad2a-097e-4a88-9956-a1bb10e201d0	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 10:47:15.954+00	2025-08-20 10:47:15.954+00	2025-08-20 10:47:15.954+00
d9f3a098-5019-4a34-b133-5d4ad5fe1458	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 10:48:27.96+00	2025-08-20 10:48:27.96+00	2025-08-20 10:48:27.96+00
e426a31d-1174-4b1c-b57c-26f23fa816da	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 10:49:44.991+00	2025-08-20 10:49:44.991+00	2025-08-20 10:49:44.991+00
f9394631-21b5-409c-8d70-dec92a20374e	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	quiz	18	18	17	2025-08-20 11:11:47.844+00	2025-08-20 11:11:47.844+00	2025-08-20 11:11:47.844+00
e19ff6bf-71d5-440d-b4c1-57543a97510b	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 11:12:29.769+00	2025-08-20 11:12:29.77+00	2025-08-20 11:12:29.77+00
691b5495-6a03-4269-b8fe-4b35927551bf	5a245507-ee0b-424f-ab87-bee233346fb5	句動詞	flashcard	0	0	0	2025-08-20 11:12:37.942+00	2025-08-20 11:12:37.942+00	2025-08-20 11:12:37.942+00
195db5e1-5092-492a-8b46-b387eea2da92	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-20 11:54:21.674+00	2025-08-20 11:54:21.676+00	2025-08-20 11:54:21.677+00
5abdcf9c-dfe4-46cd-b273-73549ae01313	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-20 12:00:34.959+00	2025-08-20 12:00:34.959+00	2025-08-20 12:00:34.959+00
5b87166b-3aaa-4a6f-b699-2b53a48fa150	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-20 12:06:18.495+00	2025-08-20 12:06:18.495+00	2025-08-20 12:06:18.495+00
118f78a0-e2c3-44ec-bfe6-75e42ae7f421	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-22 11:08:30.058+00	2025-08-22 11:08:30.058+00	2025-08-22 11:08:30.058+00
b6dce146-7a47-4d5c-9cc5-2bf62fe117b1	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-22 15:54:25.699+00	2025-08-22 15:54:25.699+00	2025-08-22 15:54:25.7+00
2ef98616-f25a-4d20-871a-60552522a525	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-24 09:56:30.994+00	2025-08-24 09:56:30.994+00	2025-08-24 09:56:30.995+00
ee9f047a-59a3-4d9a-b1b8-20c2aa81f86d	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-27 11:32:31.939+00	2025-08-27 11:32:31.939+00	2025-08-27 11:32:31.939+00
497412a1-85d4-47e1-8bc5-4c6ba37ccf19	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 03:33:55.636+00	2025-08-30 03:33:55.636+00	2025-08-30 03:33:55.636+00
ad2b0279-f810-41b4-a75c-d97717b4fc3a	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 03:42:47.598+00	2025-08-30 03:42:47.598+00	2025-08-30 03:42:47.598+00
4b145727-dcd4-4c69-9006-cbb8474d67af	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-08-30 08:01:00.729+00	2025-08-30 08:01:00.729+00	2025-08-30 08:01:00.729+00
0274982a-1f18-496f-8b23-54201834d83e	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 09:42:39.518+00	2025-08-30 09:42:39.518+00	2025-08-30 09:42:39.519+00
32d4df3e-ad1e-4f51-a494-9cc532450e3d	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 09:55:43.948+00	2025-08-30 09:55:43.95+00	2025-08-30 09:55:43.95+00
a2996128-be3f-4b8b-a606-95c2a3b9d8c4	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 09:55:56.581+00	2025-08-30 09:55:56.581+00	2025-08-30 09:55:56.581+00
3c99bcab-b696-40cb-b58f-4777ed4abc3e	3b5b2498-86ed-4ed8-968d-b98a0e286c43	句動詞	flashcard	0	0	0	2025-08-30 10:00:51.653+00	2025-08-30 10:00:51.653+00	2025-08-30 10:00:51.653+00
1d3c3047-dd63-40c0-ab28-a0370dac9525	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-09-04 11:20:49.944+00	2025-09-04 11:20:49.944+00	2025-09-04 11:20:49.945+00
20161489-c9ee-411f-b04f-50f05e45b3e4	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-09-04 11:20:54.112+00	2025-09-04 11:20:54.112+00	2025-09-04 11:20:54.112+00
a307acee-fd7f-4268-86b8-2af7d27cc156	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-09-04 11:21:18.193+00	2025-09-04 11:21:18.193+00	2025-09-04 11:21:18.194+00
d4880119-781f-4aa1-90b9-c92070bd8c20	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-09-04 11:22:10.208+00	2025-09-04 11:22:10.208+00	2025-09-04 11:22:10.208+00
729451fd-f00d-4446-a252-791f9808d000	cf4c8052-b87b-41f8-90bd-4ff01118ab18	句動詞	flashcard	0	0	0	2025-09-04 11:22:30.709+00	2025-09-04 11:22:30.709+00	2025-09-04 11:22:30.709+00
6193e8d7-3a4a-4606-949e-f820030a2f36	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	句動詞	flashcard	0	0	0	2025-09-06 11:01:25.124+00	2025-09-06 11:01:25.124+00	2025-09-06 11:01:25.124+00
4d2dca10-a216-403a-92a9-309d3a5a9241	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	句動詞	flashcard	0	0	0	2025-09-07 08:53:20.775+00	2025-09-07 08:53:20.775+00	2025-09-07 08:53:20.775+00
4e995322-e6a3-412f-9fc5-e212e461cda8	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	句動詞	flashcard	0	0	0	2025-09-07 08:53:26.196+00	2025-09-07 08:53:26.196+00	2025-09-07 08:53:26.196+00
b90e8d2a-a350-4a33-814a-8176cb5ec4f0	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	句動詞	flashcard	0	0	0	2025-09-07 11:10:54.579+00	2025-09-07 11:10:54.579+00	2025-09-07 11:10:54.579+00
5788144a-cd1d-414d-9eff-630fd5a727ed	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	%E5%8F%A5%E5%8B%95%E8%A9%9E	flashcard	0	0	0	2025-09-07 14:10:17.517+00	2025-09-07 14:10:17.517+00	2025-09-07 14:10:17.517+00
771cb374-24ea-4820-9e2a-29e00048e636	3e79da44-bdb3-4518-9651-6cca4bf1d4e8	%E5%8F%A5%E5%8B%95%E8%A9%9E	flashcard	0	0	0	2025-09-07 14:10:22.778+00	2025-09-07 14:10:22.778+00	2025-09-07 14:10:22.778+00
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."system_settings" ("id", "key", "value", "description", "category", "is_public", "updated_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: trivia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."trivia" ("id", "word_id", "category", "question", "correct_answer", "wrong_answers", "explanation", "difficulty_level", "is_featured", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_profiles" ("id", "user_id", "display_name", "avatar_url", "bio", "study_goal", "preferred_language", "timezone", "notification_settings", "study_streak", "last_study_date", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_progress" ("id", "user_id", "word_id", "mastery_level", "study_count", "correct_count", "incorrect_count", "last_studied", "is_favorite", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: user_trivia_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_trivia_progress" ("id", "user_id", "trivia_id", "is_correct", "attempts", "is_bookmarked", "created_at", "updated_at") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

RESET ALL;
