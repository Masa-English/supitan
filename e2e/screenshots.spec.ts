import { test, expect } from '@playwright/test';
import fs from 'fs';

const EMAIL = process.env.E2E_EMAIL || 'editer@example.com';
const PASSWORD = process.env.E2E_PASSWORD || 'editer1234';

test.describe('主要画面スクリーンショット', () => {
  test('ランディング → ログイン → ダッシュボード', async ({ page, baseURL }) => {
    const dir = 'screenshots';
    fs.mkdirSync(dir, { recursive: true });

    // ランディング
    await page.goto(`${baseURL}/landing`);
    await expect(page.getByRole('link', { name: '学習を始める' })).toBeVisible();
    await page.screenshot({ path: `${dir}/01-landing.png`, fullPage: true });

    // ログインページへ
    await page.getByRole('link', { name: '学習を始める' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    // フォーム要素でログインページ表示を検知
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await page.screenshot({ path: `${dir}/02-login.png`, fullPage: true });

    // 資格情報入力
    await page.getByLabel('メールアドレス').fill(EMAIL);
    await page.getByLabel('パスワード').fill(PASSWORD);
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ダッシュボード
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${dir}/03-dashboard.png`, fullPage: true });
    } catch {
      // 失敗時はエラーページを撮影
      await page.screenshot({ path: `${dir}/03-login-error.png`, fullPage: true });
      throw new Error('ダッシュボード遷移に失敗しました');
    }
  });

  test('ダッシュボードの主要ページのスクリーンショット', async ({ page, baseURL }) => {
    const dir = 'screenshots';
    fs.mkdirSync(dir, { recursive: true });

    // ログイン（前提）
    await page.goto(`${baseURL}/auth/login`);
    await page.getByLabel('メールアドレス').fill(EMAIL);
    await page.getByLabel('パスワード').fill(PASSWORD);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL(/\/dashboard/);

    // ダッシュボード
    await page.screenshot({ path: `${dir}/10-dashboard-home.png`, fullPage: true });

    // 学習開始
    await page.goto(`${baseURL}/dashboard/start-learning`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${dir}/11-start-learning.png`, fullPage: true });

    // プロフィール
    await page.goto(`${baseURL}/dashboard/profile`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${dir}/12-profile.png`, fullPage: true });

    // 統計
    await page.goto(`${baseURL}/dashboard/statistics`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `${dir}/13-statistics.png`, fullPage: true });

    // 検索
    await page.goto(`${baseURL}/dashboard/search`);
    await page.waitForSelector('input[placeholder="単語、意味、カテゴリーで検索..."]');
    await page.fill('input[placeholder="単語、意味、カテゴリーで検索..."]', 'test');
    await page.screenshot({ path: `${dir}/14-search.png`, fullPage: true });
  });
});


