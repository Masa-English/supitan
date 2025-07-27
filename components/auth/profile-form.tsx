'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UserProfile } from '@/lib/types';
import { User, Save, Bell, Target } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ProfileFormProps {
  userId: string;
  userEmail: string;
  onProfileUpdate?: (profile: UserProfile) => void;
}

export function ProfileForm({ userId, userEmail, onProfileUpdate }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    study_goal: 10,
    preferred_language: 'ja' as 'ja' | 'en',
    timezone: 'Asia/Tokyo',
    notification_settings: {
      daily_reminder: true,
      achievement: true,
      review_reminder: true,
    }
  });

  const supabase = createClient();
  const { showToast } = useToast();

  const loadProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          bio: data.bio || '',
          study_goal: data.study_goal || 10,
          preferred_language: (data.preferred_language || 'ja') as 'ja' | 'en',
          timezone: data.timezone || 'Asia/Tokyo',
          notification_settings: (data.notification_settings || {
            daily_reminder: true,
            achievement: true,
            review_reminder: true
          }) as { daily_reminder: boolean; achievement: boolean; review_reminder: boolean; },
        });
      } else {
        // プロフィールが存在しない場合は初期値を設定
        setFormData(prev => ({
          ...prev,
          display_name: userEmail.split('@')[0], // メールアドレスの@より前を初期表示名に
        }));
      }
    } catch (error) {
      console.error('プロフィール読み込みエラー:', error);
      showToast('プロフィールの読み込みに失敗しました', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail, supabase, showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const profileData = {
        user_id: userId,
        display_name: formData.display_name,
        bio: formData.bio,
        study_goal: formData.study_goal,
        preferred_language: formData.preferred_language,
        timezone: formData.timezone,
        notification_settings: formData.notification_settings,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (profile) {
        // 更新
        result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // 新規作成
        result = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setProfile(result.data);
      onProfileUpdate?.(result.data);
      showToast('プロフィールを保存しました', { type: 'success' });
    } catch (error) {
      console.error('プロフィール保存エラー:', error);
      showToast('プロフィールの保存に失敗しました', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [field]: checked
      }
    }));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-3 text-amber-700 dark:text-amber-300">プロフィールを読み込み中...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <User className="h-5 w-5" />
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">表示名</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="表示名を入力してください"
                  className="border-amber-200 focus:border-amber-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="自己紹介を入力してください"
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 学習設定 */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Target className="h-5 w-5" />
            学習設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="study_goal">1日の学習目標（単語数）</Label>
              <Input
                id="study_goal"
                type="number"
                min="1"
                max="100"
                value={formData.study_goal}
                onChange={(e) => handleInputChange('study_goal', parseInt(e.target.value) || 10)}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-sm text-muted-foreground">
                1日に学習する単語の目標数を設定します
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language">優先言語</Label>
              <select
                id="preferred_language"
                value={formData.preferred_language}
                onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
              <p className="text-sm text-muted-foreground">
                アプリの表示言語を設定します
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知設定 */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Bell className="h-5 w-5" />
            通知設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="daily_reminder"
                  checked={formData.notification_settings.daily_reminder}
                  onCheckedChange={(checked) => handleNotificationChange('daily_reminder', checked as boolean)}
                />
                <Label htmlFor="daily_reminder">日次リマインダー</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                毎日の学習を忘れないようリマインダーを送信します
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="achievement"
                  checked={formData.notification_settings.achievement}
                  onCheckedChange={(checked) => handleNotificationChange('achievement', checked as boolean)}
                />
                <Label htmlFor="achievement">達成通知</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                学習目標達成時に通知を送信します
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="review_reminder"
                  checked={formData.notification_settings.review_reminder}
                  onCheckedChange={(checked) => handleNotificationChange('review_reminder', checked as boolean)}
                />
                <Label htmlFor="review_reminder">復習リマインダー</Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                復習が必要な単語がある場合に通知を送信します
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  設定を保存
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 