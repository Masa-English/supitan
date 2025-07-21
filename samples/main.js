// ========================================
// 定数定義
// ========================================

// アプリケーション設定
const APP_CONFIG = {
    // 学習設定
    STUDY: {
        MAX_CARDS_PER_SESSION: 10,
        MASTERY_THRESHOLD: 0.8,
        MIN_SWIPE_DISTANCE: 80,
        MAX_SWIPE_TIME: 500,
        SWIPE_MOVE_THRESHOLD: 10,
        SWIPE_VISUAL_MAX_MOVE: 30,
        SWIPE_ROTATION_FACTOR: 10,
        SWIPE_OPACITY_FACTOR: 100
    },
    
    // 音声設定
    AUDIO: {
        DEFAULT_PLAYBACK_SPEED: 1.0,
        DEFAULT_VOLUME: 100,
        SPEEDS: [0.5, 1.0, 1.5, 2.0],
        DEFAULT_SPEED_INDEX: 1,
        VOLUME_THRESHOLDS: {
            MUTED: 0,
            LOW: 30,
            MEDIUM: 70
        }
    },
    
    // UI設定
    UI: {
        MOBILE_BREAKPOINT: 768,
        TABLET_BREAKPOINT: 1024,
        SMALL_MOBILE_BREAKPOINT: 480,
        TINY_MOBILE_BREAKPOINT: 400,
        SCROLL_THRESHOLD: 100,
        SCROLL_TOP_THRESHOLD: 50,
        INITIAL_SCROLL_DELAY: 50,
        CATEGORY_FILTER_UPDATE_DELAY: 10,
        CATEGORY_FILTER_RETRY_DELAY: 50,
        ANIMATION_DURATION: 300,
        TOUCH_ANIMATION_DURATION: 100,
        SUCCESS_NOTIFICATION_DURATION: 2000,
        SUCCESS_NOTIFICATION_FADE_DURATION: 300
    },
    
    // ローカルストレージキー
    STORAGE_KEYS: {
        THEME: 'vocabulary_theme',
        SETTINGS: 'vocabulary_settings',
        PROGRESS: 'vocabulary_progress',
        REVIEW_LIST: 'vocabulary_review_list',
        SESSION_DATA: 'session_data'
    },
    
    // カテゴリー名マッピング
    CATEGORY_NAMES: {
        'verb': '動詞',
        'adjective': '形容詞', 
        'adverb': '副詞',
        'noun': '名詞',
        '復習': '復習'
    },
    
    // 品詞記号マッピング
    POS_SYMBOLS: {
        '動詞': 'V',
        '形容詞': 'Adj',
        '副詞': 'Adv',
        '名詞': 'N',
        '前置詞': 'Prep',
        '接続詞': 'Conj',
        '代名詞': 'Pron',
        '冠詞': 'Art',
        '助動詞': 'Aux',
        '間投詞': 'Int'
    },
    
    // フィルター値
    FILTER_VALUES: {
        MASTERY: {
            MASTERED: 'mastered',
            STUDYING: 'studying',
            NEW: 'new'
        },
        FAVORITE: {
            FAVORITE: 'favorite'
        }
    },
    
    // デフォルト設定
    DEFAULTS: {
        THEME: 'light',
        VOLUME: 100,
        PLAYBACK_SPEED: 1.0
    }
};

// 英単語帳アプリケーション - メインクラス
class VocabularyApp {
    constructor() {
        this.dataManager = new DataManager();
        this.uiManager = new UIManager();
        this.studyManager = new StudyManager();
        this.audioManager = new AudioManager();
        this.sessionManager = new SessionManager();
        this.progressTracker = new ProgressTracker();
        this.reviewManager = new ReviewManager();
        
        this.currentCategory = null;
        this.currentMode = null;
        this.currentWords = [];
        this.navigationHistory = [];
        
        this.init();
    }
    
    async init() {
        try {
            // データ読み込み
            await this.dataManager.loadCSV();
            
            // UI初期化
            this.uiManager.init();
            
            // テーマ読み込み
            this.loadTheme();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // スマートヘッダー機能を初期化
            this.initSmartHeader();
            
            // ビューポート高さの動的調整を初期化
            this.initViewportHeight();
            
            // 統計情報更新
            this.updateStats();
            
            // 復習カウント更新
            this.uiManager.updateReviewCount();
            
            // 初期表示位置の調整
            this.adjustInitialScrollPosition();
            
            console.log('アプリケーションが正常に初期化されました');
        } catch (error) {
            console.error('アプリケーションの初期化に失敗しました:', error);
            this.uiManager.showError('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }
    
    adjustInitialScrollPosition() {
        // ページ読み込み後の初期スクロール位置を調整
        setTimeout(() => {
            // sticky headerのため、常にページ上部にスクロール
            window.scrollTo({
                top: 0,
                behavior: 'auto' // 初期化時は即座にスクロール
            });
        }, APP_CONFIG.UI.INITIAL_SCROLL_DELAY); // DOM描画完了後に実行
    }

    // ビューポート高さの動的調整（モバイルブラウザのアドレスバー対応）
    initViewportHeight() {
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        // 初期設定
        setViewportHeight();

        // リサイズ時に更新
        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', () => {
            // 画面回転時は少し遅延させてから更新
            setTimeout(setViewportHeight, 100);
        });

        // モバイルブラウザでのアドレスバー表示/非表示に対応
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', setViewportHeight);
        }
    }

    // スマートヘッダー機能の初期化
    initSmartHeader() {
        let lastScrollTop = 0;
        let scrollDirection = 'up';
        const header = document.getElementById('header');
        
        // モバイル端末でのみ動作
        const isMobile = window.innerWidth <= APP_CONFIG.UI.MOBILE_BREAKPOINT;
        if (!isMobile) return;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // スクロール方向を判定
            if (scrollTop > lastScrollTop && scrollTop > APP_CONFIG.UI.SCROLL_THRESHOLD) {
                // 下向きスクロール（100px以上スクロールした場合）
                if (scrollDirection !== 'down') {
                    scrollDirection = 'down';
                    header.classList.add('hidden');
                    header.classList.remove('visible');
                }
            } else if (scrollTop < lastScrollTop || scrollTop <= APP_CONFIG.UI.SCROLL_TOP_THRESHOLD) {
                // 上向きスクロールまたは上部付近
                if (scrollDirection !== 'up') {
                    scrollDirection = 'up';
                    header.classList.remove('hidden');
                    header.classList.add('visible');
                }
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
        
        // リサイズイベントでモバイル判定を再確認
        window.addEventListener('resize', () => {
            const isMobileNow = window.innerWidth <= APP_CONFIG.UI.MOBILE_BREAKPOINT;
            if (!isMobileNow) {
                header.classList.remove('hidden', 'visible');
            }
        });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // ボタンのアイコンを更新
        const themeBtn = document.getElementById('theme-toggle-btn');
        const themeIcon = themeBtn.querySelector('.theme-icon');
        
        if (newTheme === 'dark') {
            themeIcon.textContent = '🌙';
            themeBtn.title = 'ライトモードに切り替え';
        } else {
            themeIcon.textContent = '☀️';
            themeBtn.title = 'ダークモードに切り替え';
        }
        
        // テーマ設定を保存
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, newTheme);
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME) || APP_CONFIG.DEFAULTS.THEME;
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // ボタンの初期状態を設定
        const themeBtn = document.getElementById('theme-toggle-btn');
        const themeIcon = themeBtn.querySelector('.theme-icon');
        
        if (savedTheme === 'dark') {
            themeIcon.textContent = '🌙';
            themeBtn.title = 'ライトモードに切り替え';
        } else {
            themeIcon.textContent = '☀️';
            themeBtn.title = 'ダークモードに切り替え';
        }
    }
    
    setupEventListeners() {
        // ナビゲーション（Homeボタン削除済み）
        
        // テーマ切り替え
        document.getElementById('theme-toggle-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
        

        
        // ホーム画面
        document.getElementById('start-study-btn').addEventListener('click', () => {
            this.uiManager.showScreen('category');
        });
        
        document.getElementById('browse-words-btn').addEventListener('click', () => {
            // ホームから直接一覧に行く場合は現在のカテゴリーをクリア
            this.currentCategory = null;
            this.uiManager.showScreen('list');
            this.renderWordList();
        });
        
        // カテゴリー選択
        document.getElementById('category-grid').addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                this.currentCategory = categoryCard.dataset.category;
                console.log('Selected category:', this.currentCategory);
                this.uiManager.showScreen('mode');
                this.updateModeScreen();
            }
        });
        
        // 復習カテゴリー選択
        document.querySelector('.review-section').addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                this.currentCategory = categoryCard.dataset.category;
                console.log('Selected review category:', this.currentCategory);
                this.uiManager.showScreen('mode');
                this.updateModeScreen();
            }
        });
        
        // モード選択
        document.querySelector('.mode-grid').addEventListener('click', (e) => {
            const modeCard = e.target.closest('.mode-card');
            if (modeCard) {
                this.currentMode = modeCard.dataset.mode;
                this.startStudyMode();
            }
        });
        
        // フラッシュカード
        this.setupFlashcardListeners();
        
        // クイズ
        this.setupQuizListeners();
        
        // 単語一覧
        this.setupWordListListeners();
        
        // カテゴリー状態管理
        this.setupCategoryStateManagement();
        
        // 速度変更
        this.setupSpeedControl();
        
        // 音量調整
        this.setupVolumeControl();
        
        // キーボードショートカット
        this.setupKeyboardShortcuts();
    }
    
    setupFlashcardListeners() {
        const prevBtn = document.getElementById('prev-card-btn');
        const nextBtn = document.getElementById('next-card-btn');
        const audioBtn = document.getElementById('audio-btn');
        const retryBtn = document.getElementById('retry-btn');
        const masteredBtn = document.getElementById('mastered-btn');
        
        prevBtn.addEventListener('click', () => {
            this.studyManager.previousCard();
        });
        
        nextBtn.addEventListener('click', () => {
            this.studyManager.nextCard();
        });
        
        retryBtn.addEventListener('click', () => {
            this.studyManager.addToReview();
        });
        
        masteredBtn.addEventListener('click', () => {
            this.studyManager.markAsMastered();
        });
        
        audioBtn.addEventListener('click', () => {
            this.audioManager.playCurrentWord();
            
            // 日本語訳を表示
            const japaneseDisplay = document.getElementById('japanese-display');
            japaneseDisplay.style.display = 'block';
            japaneseDisplay.classList.add('revealed');
        });
    }
    
    setupQuizListeners() {
        document.getElementById('quiz-options').addEventListener('click', (e) => {
            const option = e.target.closest('.quiz-option');
            if (option && !option.classList.contains('selected')) {
                this.studyManager.selectQuizOption(option);
            }
        });
        
        document.getElementById('next-question-btn').addEventListener('click', () => {
            this.studyManager.nextQuestion();
        });
        
        document.getElementById('finish-quiz-btn').addEventListener('click', () => {
            this.studyManager.finishQuiz();
        });
    }
    
    setupWordListListeners() {
        // 検索機能
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                const results = window.vocabularyApp.dataManager.searchWords(query);
                this.renderWordList(results);
                
                // 検索結果の件数を表示
                const resultCount = document.createElement('div');
                resultCount.className = 'search-result-count';
                resultCount.textContent = `${results.length}件の単語が見つかりました`;
                resultCount.style.cssText = `
                    padding: var(--spacing-sm);
                    background: var(--surface-elevated);
                    border-radius: var(--border-radius-md);
                    margin: var(--spacing-sm) 0;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: var(--font-size-sm);
                `;
                
                const wordList = document.getElementById('word-list');
                if (wordList.parentNode.querySelector('.search-result-count')) {
                    wordList.parentNode.removeChild(wordList.parentNode.querySelector('.search-result-count'));
                }
                wordList.parentNode.insertBefore(resultCount, wordList);
            } else {
                // 検索クリア時は全単語を表示
                this.renderWordList();
                
                // 検索結果件数表示を削除
                const resultCount = document.querySelector('.search-result-count');
                if (resultCount) {
                    resultCount.remove();
                }
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // 検索ボタンのアイコンを改善
        searchBtn.innerHTML = '<span>🔍</span>';
        
        // フィルター機能
        const categoryFilter = document.getElementById('category-filter');
        const masteryFilter = document.getElementById('mastery-filter');
        const favoriteFilter = document.getElementById('favorite-filter');
        
        const applyFilters = () => {
            // renderWordListを呼び出してフィルタリングを実行
            this.renderWordList();
        };
        
        categoryFilter.addEventListener('change', applyFilters);
        masteryFilter.addEventListener('change', applyFilters);
        favoriteFilter.addEventListener('change', applyFilters);
        
        // お気に入りボタンのイベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                e.stopPropagation();
                const wordId = e.target.dataset.wordId;
                window.vocabularyApp.progressTracker.toggleFavorite(wordId);
                
                // ボタンの表示を更新
                const progress = window.vocabularyApp.progressTracker.getWordProgress(
                    window.vocabularyApp.dataManager.getWordById(wordId).word
                );
                e.target.innerHTML = progress.favorite ? '★' : '☆';
                
                // お気に入りフィルターが適用されている場合は一覧を再フィルタリング
                if (favoriteFilter.value === 'favorite') {
                    this.renderWordList();
                }
            }
        });
        
        // 音声ボタンのイベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('audio-btn')) {
                e.stopPropagation();
                const wordId = e.target.dataset.wordId;
                const word = window.vocabularyApp.dataManager.getWordById(wordId);
                window.vocabularyApp.audioManager.playAudio(word.audio_file);
            }
        });
        
        // 詳細ボタンのイベント
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('detail-btn')) {
                e.stopPropagation();
                const wordId = e.target.dataset.wordId;
                window.vocabularyApp.showWordDetail(wordId);
            }
        });
    }
    

    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (this.uiManager.currentScreen === 'flashcard') {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.studyManager.previousCard();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.studyManager.nextCard();
                        break;
                    case 'r':
                    case 'R':
                        this.studyManager.addToReview();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.audioManager.playCurrentWord();
                        break;
                }
            }
        });
        
        // タッチ操作とスワイプジェスチャーを設定
        this.setupTouchInteractions();
    }
    
    setupCategoryStateManagement() {
        // 画面遷移時のカテゴリー状態保持
        this.originalShowScreen = this.uiManager.showScreen.bind(this.uiManager);
        this.uiManager.showScreen = (screenName) => {
            this.originalShowScreen(screenName);
            
            // 一覧画面に遷移した際のカテゴリーフィルター設定
            if (screenName === 'list') {
                // DOM要素が確実に利用可能になってから実行
                setTimeout(() => {
                    this.applyCategoryFilter();
                }, APP_CONFIG.UI.CATEGORY_FILTER_UPDATE_DELAY);
            }
        };
    }
    
    applyCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) {
            console.warn('category-filter element not found');
            return;
        }

        console.log('Applying category filter for:', this.currentCategory);

        // まずカテゴリーフィルターのオプションを更新
        this.updateCategoryFilter();
        
        if (this.currentCategory) {
            console.log('Setting category filter value to:', this.currentCategory);
            // カテゴリーフィルターを現在のカテゴリーに設定
            categoryFilter.value = this.currentCategory;
            console.log('Category filter value after setting:', categoryFilter.value);
            
            // 値が正しく設定されたか確認
            if (categoryFilter.value !== this.currentCategory) {
                console.warn(`Failed to set category filter value: expected ${this.currentCategory}, got ${categoryFilter.value}`);
                
                // オプションが存在するかチェック
                const optionExists = Array.from(categoryFilter.options).some(option => option.value === this.currentCategory);
                console.log('Option exists for category:', this.currentCategory, optionExists);
                
                // 再試行
                setTimeout(() => {
                    categoryFilter.value = this.currentCategory;
                    console.log('Retry - Category filter value:', categoryFilter.value);
                    this.updateCategoryFilterStyle(categoryFilter);
                }, APP_CONFIG.UI.CATEGORY_FILTER_RETRY_DELAY);
            }
            
            // フィルターが適用されていることを視覚的に示す
            this.updateCategoryFilterStyle(categoryFilter);
        } else {
            console.log('No current category, setting to empty');
            // カテゴリーが指定されていない場合は「すべてのカテゴリー」に設定
            categoryFilter.value = '';
            this.updateCategoryFilterStyle(categoryFilter);
        }
        
        // 一覧を更新
        this.renderWordList();
    }
    
    updateCategoryFilterStyle(filterElement) {
        if (!filterElement) return;
        
        if (filterElement.value) {
            // カテゴリーが選択されている場合
            filterElement.style.borderColor = 'var(--accent-color)';
            filterElement.style.backgroundColor = 'var(--accent-color)';
            filterElement.style.color = 'var(--text-color)';
            filterElement.style.fontWeight = '600';
        } else {
            // 全カテゴリーが選択されている場合
            filterElement.style.borderColor = 'var(--input-border)';
            filterElement.style.backgroundColor = 'var(--input-background)';
            filterElement.style.color = 'var(--text-color)';
            filterElement.style.fontWeight = '500';
        }
    }
    
    setupSpeedControl() {
        const speedBtn = document.getElementById('speed-btn');
        const speeds = APP_CONFIG.AUDIO.SPEEDS;
        let currentSpeedIndex = APP_CONFIG.AUDIO.DEFAULT_SPEED_INDEX; // デフォルトは1.0x
        
        speedBtn.addEventListener('click', () => {
            currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
            const newSpeed = speeds[currentSpeedIndex];
            
            // ボタンのテキストを更新
            speedBtn.innerHTML = `${newSpeed}x`;
            
            // AudioManagerに速度を設定
            this.audioManager.setPlaybackSpeed(newSpeed);
            
            // 設定を保存
            const settings = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
            settings.playback_speed = newSpeed;
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        });
    }
    
    setupVolumeControl() {
        const volumeSlider = document.getElementById('volume-slider');
        const volumeIcon = document.querySelector('.volume-icon');
        const volumeValue = document.getElementById('volume-value');
        
        if (!volumeSlider || !volumeIcon || !volumeValue) return;
        
        // 保存された音量設定を読み込み
        const settings = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
        const savedVolume = settings.volume || APP_CONFIG.DEFAULTS.VOLUME;
        volumeSlider.value = savedVolume;
        volumeValue.textContent = savedVolume + '%';
        this.audioManager.setVolume(savedVolume / 100);
        this.updateVolumeIcon(savedVolume);
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            volumeValue.textContent = volume + '%';
            
            // AudioManagerに音量を設定
            this.audioManager.setVolume(volume / 100);
            
            // アイコンを更新
            this.updateVolumeIcon(volume);
            
            // 設定を保存
            const settings = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SETTINGS) || '{}');
            settings.volume = volume;
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        });
    }
    
    updateVolumeIcon(volume) {
        const volumeIcon = document.querySelector('.volume-icon');
        if (volume === APP_CONFIG.AUDIO.VOLUME_THRESHOLDS.MUTED) {
            volumeIcon.textContent = '🔇';
        } else if (volume < APP_CONFIG.AUDIO.VOLUME_THRESHOLDS.LOW) {
            volumeIcon.textContent = '🔈';
        } else if (volume < APP_CONFIG.AUDIO.VOLUME_THRESHOLDS.MEDIUM) {
            volumeIcon.textContent = '🔉';
        } else {
            volumeIcon.textContent = '🔊';
        }
    }
    
    setupTouchInteractions() {
        const flashcard = document.getElementById('flashcard');
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isDragging = false;
        const minSwipeDistance = APP_CONFIG.STUDY.MIN_SWIPE_DISTANCE; // より大きな距離でスワイプ判定
        const maxSwipeTime = APP_CONFIG.STUDY.MAX_SWIPE_TIME; // より長い時間を許可
        
        // タッチ開始
        flashcard.addEventListener('touchstart', (e) => {
            if (this.uiManager.currentScreen !== 'flashcard') return;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            isDragging = false;
        }, { passive: true });
        
        // タッチ移動中
        flashcard.addEventListener('touchmove', (e) => {
            if (this.uiManager.currentScreen !== 'flashcard') return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            // 水平方向の移動が垂直方向より大きい場合のみドラッグ
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > APP_CONFIG.STUDY.SWIPE_MOVE_THRESHOLD) {
                isDragging = true;
                
                // カードを移動させる視覚効果
                const movePercent = Math.max(-APP_CONFIG.STUDY.SWIPE_VISUAL_MAX_MOVE, Math.min(APP_CONFIG.STUDY.SWIPE_VISUAL_MAX_MOVE, deltaX / APP_CONFIG.STUDY.SWIPE_MOVE_THRESHOLD));
                flashcard.style.transform = `translateX(${movePercent}px) rotate(${movePercent / APP_CONFIG.STUDY.SWIPE_ROTATION_FACTOR}deg)`;
                flashcard.style.opacity = Math.max(0.7, 1 - Math.abs(movePercent) / APP_CONFIG.STUDY.SWIPE_OPACITY_FACTOR);
                
                // スワイプ方向のヒント表示
                const swipeHint = document.querySelector('.swipe-hint');
                if (swipeHint) {
                    if (deltaX > APP_CONFIG.STUDY.SWIPE_MOVE_THRESHOLD * 5) {
                        swipeHint.textContent = '← 前のカード';
                        swipeHint.style.opacity = '1';
                    } else if (deltaX < -APP_CONFIG.STUDY.SWIPE_MOVE_THRESHOLD * 5) {
                        swipeHint.textContent = '次のカード →';
                        swipeHint.style.opacity = '1';
                    } else {
                        swipeHint.style.opacity = '0.5';
                    }
                }
            }
        }, { passive: true });
        
        // タッチ終了
        flashcard.addEventListener('touchend', (e) => {
            if (this.uiManager.currentScreen !== 'flashcard') return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // カードの位置をリセット
            flashcard.style.transition = `all ${APP_CONFIG.UI.ANIMATION_DURATION}ms ease`;
            flashcard.style.transform = '';
            flashcard.style.opacity = '';
            
            // スワイプヒントを非表示
            const swipeHint = document.querySelector('.swipe-hint');
            if (swipeHint) {
                swipeHint.style.opacity = '0.5';
                swipeHint.textContent = '← スワイプして前後のカードに移動 →';
            }
            
            // スワイプ判定
            if (isDragging && Math.abs(deltaX) > minSwipeDistance && deltaTime < maxSwipeTime) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) {
                        // 右スワイプ - 前のカード
                        this.studyManager.previousCard();
                    } else {
                        // 左スワイプ - 次のカード
                        this.studyManager.nextCard();
                    }
                }
            }
            
            isDragging = false;
        }, { passive: true });
        
        // クイズ画面でのタッチ最適化
        document.getElementById('quiz-options').addEventListener('touchstart', (e) => {
            if (this.uiManager.currentScreen !== 'quiz') return;
            
            const option = e.target.closest('.quiz-option');
            if (option && !option.classList.contains('selected')) {
                option.style.transform = 'scale(0.98)';
                option.style.transition = `transform ${APP_CONFIG.UI.TOUCH_ANIMATION_DURATION}ms ease`;
            }
        }, { passive: true });
        
        document.getElementById('quiz-options').addEventListener('touchend', (e) => {
            if (this.uiManager.currentScreen !== 'quiz') return;
            
            const option = e.target.closest('.quiz-option');
            if (option) {
                option.style.transform = 'scale(1)';
                setTimeout(() => {
                    option.style.transition = '';
                }, APP_CONFIG.UI.TOUCH_ANIMATION_DURATION);
            }
        }, { passive: true });
    }
    
    async startStudyMode() {
        let words;
        if (this.currentCategory === '復習') {
            words = this.reviewManager.getReviewWords();
                    if (words.length === 0) {
            this.uiManager.showModal('お知らせ', '復習する単語がありません。');
            return;
        }
        } else {
            words = this.dataManager.getWordsByCategory(this.currentCategory);
        }
        this.currentWords = words;
        
        switch(this.currentMode) {
            case 'flashcard':
                this.uiManager.showScreen('flashcard');
                this.studyManager.startFlashcards(words);
                break;
            case 'quiz':
                this.uiManager.showScreen('quiz');
                this.studyManager.startQuiz(words);
                break;
            case 'list':
                this.uiManager.showScreen('list');
                // 一覧モードでは全単語を表示し、フィルターで絞り込む
                this.renderWordList();
                break;
        }
    }
    
    updateModeScreen() {
        let words;
        if (this.currentCategory === '復習') {
            words = this.reviewManager.getReviewWords();
        } else {
            words = this.dataManager.getWordsByCategory(this.currentCategory);
        }
        document.getElementById('current-category').textContent = this.currentCategory;
        document.getElementById('category-word-count').textContent = words.length;
    }
    
    renderWordList(words = null) {
        if (!words) {
            words = this.dataManager.getAllWords();
        }
        
        // カテゴリーフィルターのオプションを最初に更新
        this.updateCategoryFilter();
        
        // 現在のカテゴリーがある場合、プルダウンの値を設定
        const categoryFilterElement = document.getElementById('category-filter');
        if (categoryFilterElement && this.currentCategory && categoryFilterElement.value !== this.currentCategory) {
            categoryFilterElement.value = this.currentCategory;
            this.updateCategoryFilterStyle(categoryFilterElement);
        }
        
        // フィルタリング
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = categoryFilterElement ? categoryFilterElement.value : '';
        const masteryFilter = document.getElementById('mastery-filter').value;
        const favoriteFilter = document.getElementById('favorite-filter').value;
        
        let filteredWords = words.filter(word => {
            const matchesSearch = word.word.toLowerCase().includes(searchTerm) || 
                                word.japanese.includes(searchTerm);
            const matchesCategory = !categoryFilter || categoryFilter === 'all' || word.category === categoryFilter;
            const progress = this.progressTracker.getWordProgress(word.word);
            const matchesMastery = this.matchesMasteryFilter(progress, masteryFilter);
            const matchesFavorite = !favoriteFilter || favoriteFilter === 'all' || 
                                  (favoriteFilter === 'favorite' && progress.favorite);
            
            return matchesSearch && matchesCategory && matchesMastery && matchesFavorite;
        });
        
        this.uiManager.renderWordList(filteredWords);
    }
    
    matchesMasteryFilter(progress, filter) {
        if (!filter || filter === 'all' || filter === '') return true;
        
        switch(filter) {
            case APP_CONFIG.FILTER_VALUES.MASTERY.MASTERED:
                return progress.mastery_level >= APP_CONFIG.STUDY.MASTERY_THRESHOLD;
            case APP_CONFIG.FILTER_VALUES.MASTERY.STUDYING:
                return progress.studied && progress.mastery_level < APP_CONFIG.STUDY.MASTERY_THRESHOLD;
            case APP_CONFIG.FILTER_VALUES.MASTERY.NEW:
                return !progress.studied;
            default:
                return true;
        }
    }
    
    updateCategoryFilter() {
        const categories = this.dataManager.getCategories();
        const categoryFilter = document.getElementById('category-filter');
        
        if (!categoryFilter) {
            console.error('Category filter element not found');
            return;
        }
        
        console.log('Available categories:', categories);
        
        // 既存のオプションをクリア（最初のオプションは残す）
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }
        
        // 最初のオプション（すべてのカテゴリー）の値を設定
        if (categoryFilter.children.length > 0) {
            categoryFilter.children[0].value = 'all';
        }
        
        // カテゴリー名の日本語表示マッピング
        const categoryNames = APP_CONFIG.CATEGORY_NAMES;
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = categoryNames[category] || category;
            categoryFilter.appendChild(option);
            console.log('Added option:', category, '->', categoryNames[category] || category);
        });
        
        console.log('Total options in select:', categoryFilter.children.length);
        
        // プルダウンの状態をデバッグ
        this.debugCategoryFilter();
    }
    
    debugCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) {
            console.error('Category filter not found for debugging');
            return;
        }
        
        console.log('=== Category Filter Debug ===');
        console.log('Element:', categoryFilter);
        console.log('Current value:', categoryFilter.value);
        console.log('Options count:', categoryFilter.options.length);
        console.log('All options:');
        Array.from(categoryFilter.options).forEach((option, index) => {
            console.log(`  ${index}: value="${option.value}", text="${option.textContent}"`);
        });
        console.log('Is disabled:', categoryFilter.disabled);
        console.log('Is hidden:', categoryFilter.hidden || categoryFilter.style.display === 'none');
        console.log('==============================');
    }
    
    showWordDetail(wordId) {
        const word = this.dataManager.getWordById(wordId);
        if (word) {
            this.uiManager.showScreen('detail');
            this.uiManager.renderWordDetail(word);
        }
    }
    
    updateStats() {
        const allWords = this.dataManager.getAllWords();
        const totalWords = allWords.length;
        const studiedWords = allWords.filter(word => {
            const progress = this.progressTracker.getWordProgress(word.word);
            return progress.studied;
        }).length;
        const masteredWords = allWords.filter(word => {
            const progress = this.progressTracker.getWordProgress(word.word);
            return progress.mastery_level >= APP_CONFIG.STUDY.MASTERY_THRESHOLD;
        }).length;
        const totalStudyTime = this.progressTracker.getTotalStudyTime();
        
        document.getElementById('total-words').textContent = totalWords;
        document.getElementById('studied-words').textContent = studiedWords;
        document.getElementById('mastered-words').textContent = masteredWords;
        document.getElementById('study-time').textContent = Math.round(totalStudyTime / 60);
    }
    
    startReviewMode() {
        console.log('Starting review mode');
        this.currentCategory = '復習';
        this.currentMode = 'flashcard';
        this.startStudyMode();
    }
    

}

// データ管理クラス
class DataManager {
    constructor() {
        this.words = [];
        this.categories = [];
    }
    
    async loadCSV() {
        try {
            const response = await fetch('chunks.csv');
            const csvText = await response.text();
            this.parseCSV(csvText);
            this.extractCategories();
        } catch (error) {
            console.error('CSVの読み込みに失敗しました:', error);
            throw error;
        }
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        this.words = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = line.split(',');
                const word = {};
                headers.forEach((header, index) => {
                    word[header.trim()] = values[index] ? values[index].trim() : '';
                });
                word.id = word.word; // IDとして単語を使用
                this.words.push(word);
            }
        }
    }
    
    extractCategories() {
        const categorySet = new Set();
        this.words.forEach(word => {
            if (word.category) {
                categorySet.add(word.category);
            }
        });
        this.categories = Array.from(categorySet);
    }
    
    getCategories() {
        return this.categories;
    }
    
    getAllWords() {
        return this.words;
    }
    
    getWordsByCategory(category) {
        return this.words.filter(word => word.category === category);
    }
    
    getWordById(id) {
        return this.words.find(word => word.id === id);
    }
    
    searchWords(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.words.filter(word => 
            word.word.toLowerCase().includes(lowercaseQuery) ||
            word.japanese.includes(query) ||
            word.phonetic.includes(lowercaseQuery)
        );
    }
}

// UI管理クラス
class UIManager {
    constructor() {
        this.currentScreen = 'home';
    }
    
    init() {
        this.renderCategoryGrid();
    }
    
    showScreen(screenName) {
        // 現在のスクリーンを非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 新しいスクリーンを表示
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // フラッシュカード画面から離れる際に状態をリセット
            if (this.currentScreen !== 'flashcard') {
                this.resetFlashcardState();
            }
            
            // ページ上部にスクロール（sticky headerのため）
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    resetFlashcardState() {
        // 日本語表示をリセット
        const japaneseDisplay = document.getElementById('japanese-display');
        if (japaneseDisplay) {
            japaneseDisplay.style.display = 'none';
            japaneseDisplay.classList.remove('revealed');
        }
        
        // 例文の日本語訳をリセット
        const exampleTextJpElements = document.querySelectorAll('.example-text-jp');
        exampleTextJpElements.forEach(element => {
            element.style.display = 'none';
            element.classList.remove('revealed');
        });
        
        // 習得済みボタンを非表示にリセット
        const masteredBtn = document.getElementById('mastered-btn');
        if (masteredBtn) {
            masteredBtn.style.display = 'none';
        }
        
        // フラッシュカードの位置をリセット
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.style.transform = '';
            flashcard.style.opacity = '';
            flashcard.style.transition = '';
        }
        
        // スワイプヒントをリセット
        const swipeHint = document.querySelector('.swipe-hint');
        if (swipeHint) {
            swipeHint.style.opacity = '0.5';
            swipeHint.textContent = '← スワイプして前後のカードに移動 →';
        }
        
        // ナビゲーションボタンをリセット
        const prevBtn = document.getElementById('prev-card-btn');
        const nextBtn = document.getElementById('next-card-btn');
        const retryBtn = document.getElementById('retry-btn');
        
        if (prevBtn) {
            prevBtn.disabled = false;
            prevBtn.removeAttribute('aria-label');
        }
        
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.removeAttribute('aria-label');
        }
        
        if (retryBtn) {
            retryBtn.disabled = false;
            retryBtn.removeAttribute('aria-label');
        }
    }
    
    renderCategoryGrid() {
        const app = window.vocabularyApp;
        if (!app || !app.dataManager.words.length) {
            setTimeout(() => this.renderCategoryGrid(), 100);
            return;
        }
        
        // カテゴリー名と品詞記号のマッピング
        const categoryPosMap = APP_CONFIG.POS_SYMBOLS;
        
        const categories = app.dataManager.getCategories();
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = '';
        
        categories.forEach(category => {
            const words = app.dataManager.getWordsByCategory(category);
            const studiedWords = words.filter(word => {
                const progress = app.progressTracker.getWordProgress(word.word);
                return progress.studied;
            });
            const progressPercent = words.length > 0 ? (studiedWords.length / words.length) * 100 : 0;
            
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.dataset.category = category;
            categoryCard.dataset.pos = categoryPosMap[category] || category.charAt(0);
            categoryCard.innerHTML = `
                <div class="category-name">${category}</div>
                <div class="category-count">${words.length}個の単語</div>
                <div class="category-progress">
                    <div class="category-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            `;
            
            categoryGrid.appendChild(categoryCard);
        });
        
        // 復習カウントを更新
        this.updateReviewCount();
    }
    
    updateReviewCount() {
        const app = window.vocabularyApp;
        if (app && app.reviewManager) {
            const reviewCount = app.reviewManager.getReviewCount();
            const reviewCountElement = document.getElementById('review-count');
            if (reviewCountElement) {
                reviewCountElement.textContent = `${reviewCount}個の単語`;
            }
        }
    }
    
    renderWordList(words) {
        const wordList = document.getElementById('word-list');
        wordList.innerHTML = '';
        
        words.forEach(word => {
            const progress = window.vocabularyApp.progressTracker.getWordProgress(word.word);
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.dataset.wordId = word.id;
            
            wordItem.innerHTML = `
                <div class="word-content">
                    <div class="word-info">
                        <h3>${word.word}</h3>
                        <p class="word-translation">${word.japanese} - ${word.phonetic}</p>
                    </div>
                    <div class="word-actions">
                        <button class="favorite-btn" data-word-id="${word.id}" title="お気に入り">
                            ${progress.favorite ? '★' : '☆'}
                        </button>
                        <button class="audio-btn" data-word-id="${word.id}" title="音声再生">♪</button>
                        <button class="detail-btn" data-word-id="${word.id}" title="詳細表示">📖</button>
                    </div>
                </div>
            `;
            
            wordList.appendChild(wordItem);
        });
    }
    
    renderWordDetail(word) {
        const progress = window.vocabularyApp.progressTracker.getWordProgress(word.word);
        
        document.getElementById('detail-word').textContent = word.word;
        document.getElementById('detail-phonetic').textContent = word.phonetic;
        document.getElementById('detail-japanese').textContent = word.japanese;
        
        // 例文表示
        const examplesContainer = document.getElementById('detail-examples');
        examplesContainer.innerHTML = '';
        
        const examples = [
            { en: word.example1, jp: word.example1_jp },
            { en: word.example2, jp: word.example2_jp },
            { en: word.example3, jp: word.example3_jp }
        ];
        
        examples.forEach((example, index) => {
            if (example.en) {
                const exampleDiv = document.createElement('div');
                exampleDiv.className = 'example-item';
                
                const exampleTextEn = document.createElement('div');
                exampleTextEn.textContent = example.en;
                exampleTextEn.className = 'example-text example-text-en';
                
                const exampleTextJp = document.createElement('div');
                exampleTextJp.textContent = example.jp || '';
                exampleTextJp.className = 'example-text example-text-jp';
                
                exampleDiv.appendChild(exampleTextEn);
                if (example.jp) {
                    exampleDiv.appendChild(exampleTextJp);
                }
                examplesContainer.appendChild(exampleDiv);
            }
        });
        
        // 統計情報表示
        document.getElementById('study-count').textContent = progress.correct_count + progress.incorrect_count;
        document.getElementById('accuracy-rate').textContent = 
            progress.correct_count + progress.incorrect_count > 0 ? 
            Math.round((progress.correct_count / (progress.correct_count + progress.incorrect_count)) * 100) + '%' : 
            '0%';
        document.getElementById('last-studied').textContent = 
            progress.last_studied ? new Date(progress.last_studied).toLocaleDateString() : '未学習';
        document.getElementById('mastery-level').textContent = Math.round(progress.mastery_level * 100) + '%';
        
        // お気に入りボタン
        const favoriteBtn = document.getElementById('favorite-btn');
        favoriteBtn.innerHTML = progress.favorite ? '★' : '☆';
    }
    
    showError(message) {
        this.showModal('エラー', message);
    }
    
    showSuccess(message) {
        // 成功メッセージを表示する簡単な実装
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.className = 'success-notification';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = `slideOut ${APP_CONFIG.UI.ANIMATION_DURATION}ms ease`;
            setTimeout(() => {
                document.body.removeChild(notification);
            }, APP_CONFIG.UI.ANIMATION_DURATION);
        }, APP_CONFIG.UI.SUCCESS_NOTIFICATION_DURATION);
    }
    
    showModal(title, message, onConfirm = null, options = {}) {
        const modal = document.getElementById('modal-overlay');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        modalTitle.textContent = title;
        
        // モーダルボディをクリアして新しい構造を作成
        modalBody.innerHTML = '';
        
        // 学習完了メッセージと復習ボタンを同じ行に配置
        const headerRow = document.createElement('div');
        headerRow.className = 'modal-header-row';
        
        const completionText = document.createElement('h2');
        completionText.className = 'completion-text';
        completionText.textContent = options.completionText || '学習レポート';
        headerRow.appendChild(completionText);
        
        // 復習ボタンがある場合（同じ行に配置）
        if (options.showReviewButton && options.onReview) {
            const reviewBtn = document.createElement('button');
            reviewBtn.className = 'warning-btn inline-btn';
            reviewBtn.innerHTML = '<span>🔄</span> 復習する';
            reviewBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                options.onReview();
            });
            headerRow.appendChild(reviewBtn);
        }
        
        modalBody.appendChild(headerRow);
        
        // 統計情報を表示
        if (options.stats) {
            const statsContainer = document.createElement('div');
            statsContainer.className = 'stats-container';
            
            Object.entries(options.stats).forEach(([label, value]) => {
                const statItem = document.createElement('div');
                statItem.className = 'stat-item';
                statItem.innerHTML = `<span class="stat-label">${label}:</span> <span class="stat-value">${value}</span>`;
                statsContainer.appendChild(statItem);
            });
            
            modalBody.appendChild(statsContainer);
        } else {
            // 従来のメッセージ表示
            const messageDiv = document.createElement('div');
            messageDiv.className = 'modal-message';
            messageDiv.innerHTML = message.replace(/\n/g, '<br>');
            modalBody.appendChild(messageDiv);
        }
        
        // フッターをクリア
        modalFooter.innerHTML = '';
        
        // 左側のボタングループ
        const leftButtons = document.createElement('div');
        leftButtons.className = 'left-buttons';
        
        // 右側のボタングループ
        const rightButtons = document.createElement('div');
        rightButtons.className = 'right-buttons';
        
        // キャンセルボタン（左側に配置）
        if (options.showCancelButton !== false) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'secondary-btn';
            cancelBtn.textContent = 'キャンセル';
            cancelBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            leftButtons.appendChild(cancelBtn);
        }
        
        // ホームに戻るボタンがある場合（右側に配置）
        if (options.showHomeButton && options.onHome) {
            const homeBtn = document.createElement('button');
            homeBtn.className = 'primary-btn';
            homeBtn.textContent = 'ホームに戻る';
            homeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                options.onHome();
            });
            rightButtons.appendChild(homeBtn);
        }
        
        // 確認ボタン（右側に配置）
        if (onConfirm || options.confirmText) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'primary-btn';
            confirmBtn.textContent = options.confirmText || 'OK';
            confirmBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                if (onConfirm) onConfirm();
            });
            rightButtons.appendChild(confirmBtn);
        }
        
        // ボタングループをフッターに追加
        if (leftButtons.children.length > 0) {
            modalFooter.appendChild(leftButtons);
        }
        if (rightButtons.children.length > 0) {
            modalFooter.appendChild(rightButtons);
        }
        
        // 閉じるボタン
        const modalClose = modal.querySelector('#modal-close');
        const newClose = modalClose.cloneNode(true);
        modalClose.parentNode.replaceChild(newClose, modalClose);
        
        newClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.style.display = 'flex';
    }
}

// 学習管理クラス
class StudyManager {
    constructor() {
        this.currentWords = [];
        this.currentIndex = 0;
        this.isFlipped = false;
        this.startTime = null;
        this.quizScore = 0;
        this.quizAnswered = 0;
        this.quizCurrentQuestion = 0;
        this.quizQuestions = [];
    }
    
    startFlashcards(words) {
        this.currentWords = words;
        this.currentIndex = 0;
        this.startTime = Date.now();
        this.studiedCount = 0;
        this.reviewedWords = [];
        
        // フラッシュカード状態をリセット
        window.vocabularyApp.uiManager.resetFlashcardState();
        
        // 復習モードの場合は習得済みボタンを表示
        const masteredBtn = document.getElementById('mastered-btn');
        if (window.vocabularyApp.currentCategory === '復習') {
            masteredBtn.style.display = 'flex';
        } else {
            masteredBtn.style.display = 'none';
        }
        
        this.showCurrentCard();
    }
    
    showCurrentCard() {
        if (this.currentWords.length === 0) return;
        
        const word = this.currentWords[this.currentIndex];
        const progress = window.vocabularyApp.progressTracker.getWordProgress(word.word);
        
        // カード表示
        document.getElementById('word-display').textContent = word.word;
        document.getElementById('phonetic-display').textContent = word.phonetic;
        
        // 日本語は初期状態で非表示
        const japaneseDisplay = document.getElementById('japanese-display');
        japaneseDisplay.textContent = word.japanese;
        japaneseDisplay.style.display = 'none';
        japaneseDisplay.classList.remove('revealed');
        
        // 例文表示
        const examplesContainer = document.getElementById('examples-display');
        examplesContainer.innerHTML = '';
        
        const examples = [
            { en: word.example1, jp: word.example1_jp },
            { en: word.example2, jp: word.example2_jp },
            { en: word.example3, jp: word.example3_jp }
        ];
        
        examples.forEach((example, index) => {
            if (example.en) {
                const exampleDiv = document.createElement('div');
                exampleDiv.className = 'example-item';
                
                // 例文部分を包むコンテナ
                const exampleTextContainer = document.createElement('div');
                exampleTextContainer.className = 'example-text-container';
                
                const exampleTextEn = document.createElement('div');
                exampleTextEn.textContent = example.en;
                exampleTextEn.className = 'example-text example-text-en';
                
                const exampleTextJp = document.createElement('div');
                exampleTextJp.textContent = example.jp || '';
                exampleTextJp.className = 'example-text example-text-jp';
                exampleTextJp.style.display = 'none'; // 初期状態で非表示
                
                const playBtn = document.createElement('button');
                playBtn.className = 'example-play-btn';
                playBtn.innerHTML = '♪';
                playBtn.title = '例文を読み上げ';
                playBtn.addEventListener('click', () => {
                    window.vocabularyApp.audioManager.playText(example.en);
                    // 日本語訳を表示
                    exampleTextJp.style.display = 'block';
                    exampleTextJp.classList.add('revealed');
                });
                
                // 例文部分をコンテナに追加
                exampleTextContainer.appendChild(exampleTextEn);
                if (example.jp) {
                    exampleTextContainer.appendChild(exampleTextJp);
                }
                
                // 例文コンテナとボタンをexample-itemに追加
                exampleDiv.appendChild(exampleTextContainer);
                exampleDiv.appendChild(playBtn);
                examplesContainer.appendChild(exampleDiv);
            }
        });
        
        // 進捗表示
        document.getElementById('current-position').textContent = this.currentIndex + 1;
        document.getElementById('total-cards').textContent = this.currentWords.length;
        
        const progressPercent = ((this.currentIndex + 1) / this.currentWords.length) * 100;
        document.getElementById('flashcard-progress').style.width = progressPercent + '%';
        
        // ナビゲーションボタンの有効/無効状態を更新
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-card-btn');
        const nextBtn = document.getElementById('next-card-btn');
        const retryBtn = document.getElementById('retry-btn');
        
        // 前のカードボタン
        if (prevBtn) {
            if (this.currentIndex <= 0) {
                prevBtn.disabled = true;
                prevBtn.setAttribute('aria-label', '最初のカードです');
            } else {
                prevBtn.disabled = false;
                prevBtn.setAttribute('aria-label', '前のカードに移動');
            }
        }
        
        // 次のカードボタン
        if (nextBtn) {
            if (this.currentIndex >= this.currentWords.length - 1) {
                nextBtn.disabled = true;
                nextBtn.setAttribute('aria-label', '最後のカードです');
            } else {
                nextBtn.disabled = false;
                nextBtn.setAttribute('aria-label', '次のカードに移動');
            }
        }
        
        // 復習ボタン（常に有効）
        if (retryBtn) {
            retryBtn.disabled = false;
            retryBtn.setAttribute('aria-label', '復習リストに追加');
        }
    }
    
    nextCard() {
        this.studiedCount++;
        
        // 10問完了または最後のカードの場合
        if (this.studiedCount >= APP_CONFIG.STUDY.MAX_CARDS_PER_SESSION || this.currentIndex >= this.currentWords.length - 1) {
            this.completeSession();
            return;
        }
        
        if (this.currentIndex < this.currentWords.length - 1) {
            this.currentIndex++;
            this.showCurrentCard();
        } else {
            this.completeSession();
        }
    }
    
    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.showCurrentCard();
        }
    }
    
    addToReview() {
        const word = this.currentWords[this.currentIndex];
        window.vocabularyApp.reviewManager.addToReview(word);
        this.reviewedWords.push(word);
        window.vocabularyApp.uiManager.showSuccess(`「${word.word}」を復習リストに追加しました`);
        this.nextCard();
    }
    
    markAsMastered() {
        const word = this.currentWords[this.currentIndex];
        window.vocabularyApp.reviewManager.removeFromReview(word.word);
        window.vocabularyApp.uiManager.showSuccess(`「${word.word}」を習得済みにしました！`);
        
        // 復習モードの場合は、現在の単語を削除して次に進む
        if (window.vocabularyApp.currentCategory === '復習') {
            this.currentWords.splice(this.currentIndex, 1);
            
            // 削除後に単語がなくなった場合
            if (this.currentWords.length === 0) {
                window.vocabularyApp.uiManager.showModal('復習完了', 'すべての単語を習得しました！おめでとうございます🎉', () => {
                    window.vocabularyApp.uiManager.showScreen('home');
                    window.vocabularyApp.updateStats();
                });
                return;
            }
            
            // インデックスの調整
            if (this.currentIndex >= this.currentWords.length) {
                this.currentIndex = this.currentWords.length - 1;
            }
            
            // 進捗表示を更新
            document.getElementById('total-cards').textContent = this.currentWords.length;
            
            this.showCurrentCard();
        }
    }
    
    completeSession() {
        const totalStudied = this.studiedCount;
        const totalReviewed = this.reviewedWords.length;
        const accuracy = totalStudied > 0 ? Math.round(((totalStudied - totalReviewed) / totalStudied) * 100) : 0;
        
        // 復習モードの場合は特別な処理
        if (window.vocabularyApp.currentCategory === '復習') {
            const studiedWords = [];
            for (let i = 0; i <= this.currentIndex; i++) {
                if (this.currentWords[i]) {
                    studiedWords.push(this.currentWords[i]);
                }
            }
            
            const stats = {
                '学習した単語数': totalStudied,
                '新たに復習リストに追加': totalReviewed,
                '理解度': `${accuracy}%`
            };
            
            const options = {
                completionText: '復習完了',
                showHomeButton: true,
                showReviewButton: totalReviewed > 0,
                stats: stats,
                onReview: () => {
                    // 復習モードを再開始
                    window.vocabularyApp.startReviewMode();
                },
                onHome: () => {
                    // 学習した単語を復習リストから削除
                    studiedWords.forEach(word => {
                        window.vocabularyApp.reviewManager.removeFromReview(word.word);
                    });
                    window.vocabularyApp.uiManager.showSuccess(`${studiedWords.length}個の単語を習得済みにしました！`);
                    window.vocabularyApp.uiManager.showScreen('home');
                    window.vocabularyApp.updateStats();
                }
            };
            
            window.vocabularyApp.uiManager.showModal('復習完了', '', null, options);
        } else {
            // 通常の学習モードの場合
            const stats = {
                '学習した単語数': totalStudied,
                '復習リストに追加': totalReviewed,
                '理解度': `${accuracy}%`
            };
            
            const options = {
                completionText: '学習完了',
                showHomeButton: true,
                showReviewButton: totalReviewed > 0,
                stats: stats,
                onReview: () => {
                    // 復習モードを開始
                    window.vocabularyApp.startReviewMode();
                },
                onHome: () => {
                    window.vocabularyApp.uiManager.showScreen('home');
                    window.vocabularyApp.updateStats();
                }
            };
            
            window.vocabularyApp.uiManager.showModal('学習完了', '', null, options);
        }
    }
    
    startQuiz(words) {
        this.currentWords = words;
        this.quizScore = 0;
        this.quizAnswered = 0;
        this.quizCurrentQuestion = 0;
        this.generateQuizQuestions();
        this.showCurrentQuestion();
    }
    
    generateQuizQuestions() {
        this.quizQuestions = [];
        const allWords = window.vocabularyApp.dataManager.getAllWords();
        
        this.currentWords.forEach(word => {
            // 英→日の問題
            const question = {
                word: word,
                question: word.word,
                correct: word.japanese,
                type: 'en-to-ja'
            };
            
            // 間違いの選択肢を生成
            const wrongAnswers = allWords
                .filter(w => w.japanese !== word.japanese)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.japanese);
            
            question.options = [question.correct, ...wrongAnswers]
                .sort(() => Math.random() - 0.5);
            
            this.quizQuestions.push(question);
        });
    }
    
    showCurrentQuestion() {
        if (this.quizCurrentQuestion >= this.quizQuestions.length) {
            this.finishQuiz();
            return;
        }
        
        const question = this.quizQuestions[this.quizCurrentQuestion];
        
        // 質問表示
        document.getElementById('quiz-question').innerHTML = `<div>${question.question}</div>`;
        
        // 選択肢表示
        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.textContent = option;
            optionDiv.dataset.answer = option;
            optionsContainer.appendChild(optionDiv);
        });
        
        // 進捗表示
        document.getElementById('quiz-current').textContent = this.quizCurrentQuestion + 1;
        document.getElementById('quiz-total').textContent = this.quizQuestions.length;
        document.getElementById('quiz-score').textContent = this.quizScore;
        document.getElementById('quiz-answered').textContent = this.quizAnswered;
        
        const progressPercent = ((this.quizCurrentQuestion + 1) / this.quizQuestions.length) * 100;
        document.getElementById('quiz-progress').style.width = progressPercent + '%';
        
        // フィードバックを非表示
        document.getElementById('quiz-feedback').style.display = 'none';
        document.getElementById('next-question-btn').style.display = 'none';
        document.getElementById('finish-quiz-btn').style.display = 'none';
    }
    
    selectQuizOption(selectedOption) {
        const question = this.quizQuestions[this.quizCurrentQuestion];
        const isCorrect = selectedOption.dataset.answer === question.correct;
        
        // 全ての選択肢を無効化
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.style.pointerEvents = 'none';
            if (option.dataset.answer === question.correct) {
                option.classList.add('correct');
            } else if (option === selectedOption && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // スコア更新
        this.quizAnswered++;
        if (isCorrect) {
            this.quizScore++;
        }
        
        // 進捗記録
        window.vocabularyApp.progressTracker.recordProgress(question.word.word, isCorrect);
        
        // フィードバック表示
        const feedback = document.getElementById('quiz-feedback');
        feedback.style.display = 'block';
        feedback.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.textContent = isCorrect ? '正解です！' : `不正解です。正解は「${question.correct}」です。`;
        
        // 次の質問ボタン表示
        if (this.quizCurrentQuestion < this.quizQuestions.length - 1) {
            document.getElementById('next-question-btn').style.display = 'block';
        } else {
            document.getElementById('finish-quiz-btn').style.display = 'block';
        }
    }
    
    nextQuestion() {
        this.quizCurrentQuestion++;
        this.showCurrentQuestion();
    }
    
    finishQuiz() {
        const accuracy = this.quizAnswered > 0 ? (this.quizScore / this.quizAnswered) * 100 : 0;
        const message = `クイズ終了！\n\n正答率: ${Math.round(accuracy)}%\n正解数: ${this.quizScore}/${this.quizAnswered}`;
        
        // 復習リストにある単語があるかチェック
        const reviewCount = window.vocabularyApp.reviewManager.getReviewCount();
        
        const options = {
            confirmText: 'ホームに戻る',
            showReviewButton: reviewCount > 0,
            onReview: () => {
                // 復習モードを開始
                window.vocabularyApp.startReviewMode();
            }
        };
        
        window.vocabularyApp.uiManager.showModal('クイズ完了', message, () => {
            window.vocabularyApp.uiManager.showScreen('home');
            window.vocabularyApp.updateStats();
        }, options);
    }
}

// 音声管理クラス
class AudioManager {
    constructor() {
        this.audioElement = document.getElementById('audio-player');
        this.playbackSpeed = APP_CONFIG.AUDIO.DEFAULT_PLAYBACK_SPEED;
        this.volume = APP_CONFIG.AUDIO.DEFAULT_VOLUME / 100;
    }
    
    playCurrentWord() {
        const studyManager = window.vocabularyApp.studyManager;
        if (studyManager.currentWords.length > 0) {
            const word = studyManager.currentWords[studyManager.currentIndex];
            this.playText(word.word);
        }
    }
    
    playAudio(filename) {
        if (!filename) return;
        
        // 実際の音声ファイルがない場合は、Web Speech APIを使用
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(filename.replace('.mp3', ''));
            utterance.lang = 'en-US';
            utterance.rate = this.playbackSpeed;
            utterance.volume = this.volume;
            speechSynthesis.speak(utterance);
        }
    }
    
    playText(text) {
        if (!text) return;
        
        // Web Speech APIを使用してテキストを読み上げ
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = this.playbackSpeed;
            utterance.volume = this.volume;
            speechSynthesis.speak(utterance);
        }
    }
    
    setPlaybackSpeed(speed) {
        this.playbackSpeed = speed;
        this.audioElement.playbackRate = speed;
    }
    
    setVolume(volume) {
        this.volume = volume;
        this.audioElement.volume = volume;
    }
}

// セッション管理クラス
class SessionManager {
    constructor() {
        this.currentSession = null;
    }
    
    startSession(category, words) {
        this.currentSession = {
            category,
            words,
            startTime: Date.now(),
            currentPosition: 0,
            totalWords: words.length
        };
        
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SESSION_DATA, JSON.stringify(this.currentSession));
    }
    
    updateProgress(position) {
        if (this.currentSession) {
            this.currentSession.currentPosition = position;
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.SESSION_DATA, JSON.stringify(this.currentSession));
        }
    }
    
    endSession() {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.SESSION_DATA);
        this.currentSession = null;
    }
    
    getSessionData() {
        return this.currentSession;
    }
}

// 進捗追跡クラス
class ProgressTracker {
    constructor() {
        this.progress = this.loadProgress();
    }
    
    loadProgress() {
        const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.PROGRESS);
        return stored ? JSON.parse(stored) : {};
    }
    
    saveProgress() {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.PROGRESS, JSON.stringify(this.progress));
    }
    
    getWordProgress(wordId) {
        return this.progress[wordId] || {
            studied: false,
            correct_count: 0,
            incorrect_count: 0,
            last_studied: null,
            favorite: false,
            study_time: 0,
            mastery_level: 0
        };
    }
    
    recordProgress(wordId, correct) {
        if (!this.progress[wordId]) {
            this.progress[wordId] = this.getWordProgress(wordId);
        }
        
        const progress = this.progress[wordId];
        progress.studied = true;
        progress.last_studied = new Date().toISOString();
        
        if (correct) {
            progress.correct_count++;
        } else {
            progress.incorrect_count++;
        }
        
        // 習得度計算
        const total = progress.correct_count + progress.incorrect_count;
        progress.mastery_level = total > 0 ? progress.correct_count / total : 0;
        
        this.saveProgress();
    }
    
    recordStudyTime(wordId, duration) {
        if (!this.progress[wordId]) {
            this.progress[wordId] = this.getWordProgress(wordId);
        }
        
        this.progress[wordId].study_time += duration;
        this.saveProgress();
    }
    
    toggleFavorite(wordId) {
        if (!this.progress[wordId]) {
            this.progress[wordId] = this.getWordProgress(wordId);
        }
        
        this.progress[wordId].favorite = !this.progress[wordId].favorite;
        this.saveProgress();
    }
    
    getAllProgress() {
        return this.progress;
    }
    
    getTotalStudyTime() {
        return Object.values(this.progress).reduce((total, progress) => {
            return total + (progress.study_time || 0);
        }, 0);
    }
}

// 復習管理クラス
class ReviewManager {
    constructor() {
        this.reviewList = this.loadReviewList();
    }
    
    loadReviewList() {
        const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REVIEW_LIST);
        return stored ? JSON.parse(stored) : [];
    }
    
    saveReviewList() {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REVIEW_LIST, JSON.stringify(this.reviewList));
    }
    
    addToReview(word) {
        // 既に復習リストにある場合は追加しない
        const exists = this.reviewList.find(reviewWord => reviewWord.word === word.word);
        if (!exists) {
            this.reviewList.push({
                ...word,
                addedAt: new Date().toISOString()
            });
            this.saveReviewList();
            
            // UI更新
            const app = window.vocabularyApp;
            if (app && app.uiManager) {
                app.uiManager.updateReviewCount();
            }
        }
    }
    
    removeFromReview(wordId) {
        this.reviewList = this.reviewList.filter(word => word.word !== wordId);
        this.saveReviewList();
        
        // UI更新
        const app = window.vocabularyApp;
        if (app && app.uiManager) {
            app.uiManager.updateReviewCount();
        }
    }
    
    getReviewWords() {
        return this.reviewList;
    }
    
    getReviewCount() {
        return this.reviewList.length;
    }
    
    clearReviewList() {
        this.reviewList = [];
        this.saveReviewList();
        
        // UI更新
        const app = window.vocabularyApp;
        if (app && app.uiManager) {
            app.uiManager.updateReviewCount();
        }
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    window.vocabularyApp = new VocabularyApp();
});

// ========================================
// 定数整理完了
// ========================================
// 
// 以下の定数が整理されました：
// - 学習設定（MAX_CARDS_PER_SESSION, MASTERY_THRESHOLD等）
// - 音声設定（DEFAULT_PLAYBACK_SPEED, VOLUME_THRESHOLDS等）
// - UI設定（ブレークポイント、アニメーション時間等）
// - ローカルストレージキー
// - カテゴリー名マッピング
// - 品詞記号マッピング
// - フィルター値
// - デフォルト設定
//
// CSSファイルでも同様に定数が整理されています：
// - ブレークポイント
// - アニメーション時間
// - 間隔・サイズ
// - フォントサイズ
// - シャドウ
// - 透明度
// - Z-index
// ========================================
