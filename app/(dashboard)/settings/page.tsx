'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Label } from '@/components/ui/form/label';
import { Button } from '@/components/ui/button/button';
import { Badge } from '@/components/ui/navigation/badge';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Monitor,
  Bell,
  BellOff,
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';

interface SettingsData {
  audio: {
    enabled: boolean;
    autoPlay: boolean;
    volume: number;
    voice: string;
  };
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    reviewReminder: boolean;
    achievementNotifications: boolean;
  };
  learning: {
    autoAdvance: boolean;
    showHints: boolean;
    reviewInterval: number;
    dailyGoal: number;
  };
}

const defaultSettings: SettingsData = {
  audio: {
    enabled: true,
    autoPlay: false,
    volume: 0.8,
    voice: 'default'
  },
  theme: 'system',
  notifications: {
    enabled: true,
    dailyReminder: true,
    reviewReminder: true,
    achievementNotifications: true
  },
  learning: {
    autoAdvance: false,
    showHints: true,
    reviewInterval: 7,
    dailyGoal: 20
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // 設定の読み込み
  useEffect(() => {
    const loadSettings = () => {
      try {
        // 保存された設定を読み込み
        const savedSettings = localStorage.getItem('spitan-settings');
        let loadedSettings = defaultSettings;
        
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          loadedSettings = { ...defaultSettings, ...parsed };
        }
        
        // テーマ設定の同期
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (savedTheme) {
          loadedSettings.theme = savedTheme;
        }
        
        // 音声設定の同期
        const savedAudioSettings = localStorage.getItem('audio-settings');
        if (savedAudioSettings) {
          try {
            const audioSettings = JSON.parse(savedAudioSettings);
            loadedSettings.audio = { ...loadedSettings.audio, ...audioSettings };
            
            // 音声ストアとの同期（非同期で実行）
            setTimeout(async () => {
              try {
                const { useAudioStore } = await import('@/lib/stores');
                const audioStore = useAudioStore.getState();
                
                // 音量設定を同期
                if (audioStore.volume !== audioSettings.volume) {
                  audioStore.setVolume(audioSettings.volume);
                }
                
                // 音声有効/無効を同期
                if (audioStore.isAudioEnabled !== audioSettings.enabled) {
                  audioStore.toggleAudioEnabled();
                }
              } catch (error) {
                console.log('音声ストアとの初期同期をスキップ:', error);
              }
            }, 100);
            
          } catch (error) {
            console.error('音声設定の読み込みエラー:', error);
          }
        }
        
        setSettings(loadedSettings);
        
        // 初回読み込み時にテーマを適用
        if (loadedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (loadedSettings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // system
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', isDark);
        }
        
      } catch (error) {
        console.error('設定の読み込みエラー:', error);
        setSettings(defaultSettings);
      }
    };
    
    loadSettings();
  }, []);

  // 設定の更新
  const updateSettings = (section: keyof SettingsData, key: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // 設定の保存
  const saveSettings = async () => {
    setSaving(true);
    try {
      // ローカルストレージに保存
      localStorage.setItem('spitan-settings', JSON.stringify(settings));
      setHasChanges(false);
      
      // テーマの適用
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        // system
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('theme', 'system');
      }
      
      // 通知権限の要求
      if (settings.notifications.enabled && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission === 'denied') {
            // 通知が拒否された場合は設定を無効にする
            updateSettings('notifications', 'enabled', false);
          }
        }
      }
      
      // 音声設定の適用（グローバル音声ストアとの連携）
      if (typeof window !== 'undefined') {
        // 音声設定をローカルストレージに保存
        const audioSettings = {
          enabled: settings.audio.enabled,
          autoPlay: settings.audio.autoPlay,
          volume: settings.audio.volume
        };
        localStorage.setItem('audio-settings', JSON.stringify(audioSettings));
        
        // 音声ストアが利用可能な場合は直接更新
        try {
          const { useAudioStore } = await import('@/lib/stores');
          const audioStore = useAudioStore.getState();
          
          // 音量設定を反映
          audioStore.setVolume(settings.audio.volume);
          
          // 音声有効/無効を反映（音声ストアにisAudioEnabledがある場合）
          if (audioStore.isAudioEnabled !== settings.audio.enabled) {
            audioStore.toggleAudioEnabled();
          }
        } catch (error) {
          console.log('音声ストアとの連携をスキップ:', error);
        }
      }
      
    } catch (error) {
      console.error('設定の保存エラー:', error);
      // エラー時は変更フラグを戻す
      setHasChanges(true);
    } finally {
      setSaving(false);
    }
  };

  // 設定のリセット
  const resetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // 簡易テスト用のHTMLAudio再生（進行中の音量変更が反映される）
  const testAudio = async () => {
    if (!settings.audio.enabled) return;
    
    try {
      // 音声ストアの正解音を使用してテスト
      const { useAudioStore } = await import('@/lib/stores');
      const audioStore = useAudioStore.getState();
      
      // 音声ストアが初期化されている場合は正解音を再生
      if (audioStore.isInitialized && audioStore.correctAudio) {
        await audioStore.playCorrectSound();
        return;
      }
    } catch (error) {
      console.error('音声ストア経由のテストでエラー:', error);
    }

    // フォールバック: HTMLAudioの簡易ビープ（Web Speech APIを使わない）
    const beepDataUri =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';
    try {
      const audio = new Audio(beepDataUri);
      audio.volume = settings.audio.volume;
      await audio.play();
    } catch (error) {
      console.error('フォールバック音声の再生に失敗しました:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            設定
          </h1>
          <p className="text-muted-foreground">
            学習体験をカスタマイズして、より効果的に学習しましょう
          </p>
        </div>

        {/* 開発中機能の注意書き */}
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  設定機能について
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  現在、設定はブラウザのローカルストレージに保存されます。一部の機能（通知、サーバー連携など）は開発中のため、完全には動作しない場合があります。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 変更の保存バー */}
        {hasChanges && (
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-900 dark:text-blue-100">
                  設定に変更があります
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSettings}
                    disabled={saving}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    リセット
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveSettings}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* 音声設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                音声設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">音声機能</Label>
                  <p className="text-sm text-muted-foreground">単語の発音を音声で再生</p>
                </div>
                <Button
                  variant={settings.audio.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings('audio', 'enabled', !settings.audio.enabled)}
                >
                  {settings.audio.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>

              {settings.audio.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">自動再生</Label>
                      <p className="text-sm text-muted-foreground">単語表示時に自動で音声再生</p>
                    </div>
                    <Button
                      variant={settings.audio.autoPlay ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings('audio', 'autoPlay', !settings.audio.autoPlay)}
                    >
                      {settings.audio.autoPlay ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div>
                    <Label className="text-base font-medium">音量</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.audio.volume}
                        onChange={(e) => updateSettings('audio', 'volume', parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">
                        {Math.round(settings.audio.volume * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testAudio}
                      >
                        テスト
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* テーマ設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                テーマ設定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'light', label: 'ライト', icon: Sun },
                  { key: 'dark', label: 'ダーク', icon: Moon },
                  { key: 'system', label: 'システム', icon: Monitor }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant={settings.theme === key ? "default" : "outline"}
                    className="h-20 flex-col gap-2"
                    onClick={() => updateSettings('theme', 'theme', key)}
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 通知設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">通知機能</Label>
                  <p className="text-sm text-muted-foreground">学習リマインダーや達成通知</p>
                </div>
                <Button
                  variant={settings.notifications.enabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings('notifications', 'enabled', !settings.notifications.enabled)}
                >
                  {settings.notifications.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </Button>
              </div>

              {settings.notifications.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">日次リマインダー</Label>
                      <p className="text-sm text-muted-foreground">毎日の学習を促す通知</p>
                    </div>
                    <Button
                      variant={settings.notifications.dailyReminder ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings('notifications', 'dailyReminder', !settings.notifications.dailyReminder)}
                    >
                      {settings.notifications.dailyReminder ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">復習リマインダー</Label>
                      <p className="text-sm text-muted-foreground">復習が必要な単語の通知</p>
                    </div>
                    <Button
                      variant={settings.notifications.reviewReminder ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings('notifications', 'reviewReminder', !settings.notifications.reviewReminder)}
                    >
                      {settings.notifications.reviewReminder ? 'ON' : 'OFF'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">達成通知</Label>
                      <p className="text-sm text-muted-foreground">目標達成や記録更新の通知</p>
                    </div>
                    <Button
                      variant={settings.notifications.achievementNotifications ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings('notifications', 'achievementNotifications', !settings.notifications.achievementNotifications)}
                    >
                      {settings.notifications.achievementNotifications ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 学習設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                学習設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">自動進行</Label>
                  <p className="text-sm text-muted-foreground">正解時に自動で次の問題へ</p>
                </div>
                <Button
                  variant={settings.learning.autoAdvance ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings('learning', 'autoAdvance', !settings.learning.autoAdvance)}
                >
                  {settings.learning.autoAdvance ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">ヒント表示</Label>
                  <p className="text-sm text-muted-foreground">学習時にヒントを表示</p>
                </div>
                <Button
                  variant={settings.learning.showHints ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings('learning', 'showHints', !settings.learning.showHints)}
                >
                  {settings.learning.showHints ? 'ON' : 'OFF'}
                </Button>
              </div>

              <div>
                <Label className="text-base font-medium">復習間隔（日）</Label>
                <p className="text-sm text-muted-foreground mb-2">基本的な復習間隔</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.learning.reviewInterval}
                    onChange={(e) => updateSettings('learning', 'reviewInterval', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="w-16 justify-center">
                    {settings.learning.reviewInterval}日
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">1日の目標単語数</Label>
                <p className="text-sm text-muted-foreground mb-2">毎日の学習目標</p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={settings.learning.dailyGoal}
                    onChange={(e) => updateSettings('learning', 'dailyGoal', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="w-16 justify-center">
                    {settings.learning.dailyGoal}語
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            設定はブラウザに保存され、次回アクセス時に復元されます
          </p>
        </div>
      </div>
    </div>
  );
}