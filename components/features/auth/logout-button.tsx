"use client";

import { createClient as createBrowserClient } from "@/lib/api/supabase/client";
import { Button } from "@/components/ui/button";
import {
  useNavigationStore,
  useUserStore,
  useAudioStore,
  useLearningSessionStore,
} from "@/lib/stores";

export function LogoutButton() {
  const { start, stop } = useNavigationStore();

  const logout = async () => {
    console.log("[LogoutButton] ログアウト処理開始");

    try {
      start();

      // まずストレージを先にクリア（Supabaseクライアントが古いトークンを使わないように）
      console.log("[LogoutButton] ブラウザストレージを事前クリア");
      if (typeof window !== "undefined") {
        // セッションストレージを完全にクリア
        sessionStorage.clear();

        // ローカルストレージからSupabase関連のキーを全て削除
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("sb-")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => {
          console.log("[LogoutButton] ローカルストレージキー削除:", key);
          localStorage.removeItem(key);
        });

        // 追加でよく使われるキーも削除
        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("redirectAfterLogin");
      }

      // ストレージクリア後に新しいSupabaseクライアントを作成
      const supabase = createBrowserClient();

      console.log("[LogoutButton] Supabaseからログアウト実行");
      // Supabaseからログアウト（scope: 'global'で全てのタブからログアウト）
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        console.error("[LogoutButton] Supabaseログアウトエラー:", error);
        // エラーがあっても処理を続行
      }

      // サーバーサイドでもログアウト処理を実行
      try {
        console.log("[LogoutButton] サーバーサイドログアウトAPI呼び出し");
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include", // クッキーを含める
        });
        if (!response.ok) {
          console.warn(
            "[LogoutButton] ログアウトAPI応答エラー:",
            response.status
          );
        }
      } catch (apiError) {
        console.error("[LogoutButton] ログアウトAPI呼び出しエラー:", apiError);
        // APIエラーは無視して処理を続行
      }

      console.log("[LogoutButton] ストア状態をクリア");
      // 全てのストア状態をクリア
      try {
        useUserStore.getState().clearUserData();
        useAudioStore.getState().clearCache();
        useLearningSessionStore.getState().clearSession();
      } catch (storeError) {
        console.error("[LogoutButton] ストアクリアエラー:", storeError);
        // ストアエラーも無視して処理を続行
      }

      console.log("[LogoutButton] ナビゲーション状態を停止");
      stop();

      console.log("[LogoutButton] ページリダイレクト実行");
      // 少し待ってからリダイレクト（全ての処理が完了するのを待つ）
      setTimeout(() => {
        if (typeof window !== "undefined") {
          // location.replaceを使用してブラウザ履歴も置き換える
          window.location.replace("/login");
        }
      }, 200);
    } catch (error) {
      console.error("[LogoutButton] ログアウト処理エラー:", error);

      const digest = (error as { digest?: string } | undefined)?.digest || "";
      const message = String((error as Error | undefined)?.message || "");

      if (
        digest.startsWith("NEXT_REDIRECT") ||
        message.includes("NEXT_REDIRECT")
      ) {
        console.log("[LogoutButton] リダイレクトエラーを検出、処理を続行");
        stop();
        return;
      }

      stop();

      // エラーが発生した場合でも強制リダイレクト
      setTimeout(() => {
        if (typeof window !== "undefined") {
          console.log("[LogoutButton] エラー時の強制リダイレクト");
          window.location.replace("/login");
        }
      }, 200);
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}
