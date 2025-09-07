import { createClient } from '@/lib/api/supabase/client';
import { createClient as createServerClient } from '@/lib/api/supabase/server';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  avatar_url?: string;
}

/**
 * 認証サービスクラス
 * クライアントサイドとサーバーサイド両方で使用可能
 */
export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * ユーザー登録
   */
  async signUp(data: SignUpData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || '',
          }
        }
      });

      if (error) {
        return { user: null, error };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Sign up failed') 
      };
    }
  }

  /**
   * ログイン
   */
  async signIn(data: SignInData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Sign in failed') 
      };
    }
  }

  /**
   * ログアウト
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Sign out failed') 
      };
    }
  }

  /**
   * パスワードリセット要求
   */
  async resetPassword(data: ResetPasswordData): Promise<{ error: Error | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Password reset failed') 
      };
    }
  }

  /**
   * パスワード更新
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ error: Error | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error : new Error('Password update failed') 
      };
    }
  }

  /**
   * プロフィール更新
   */
  async updateProfile(data: UpdateProfileData): Promise<{ user: User | null; error: Error | null }> {
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
        }
      });

      if (error) {
        return { user: null, error };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Profile update failed') 
      };
    }
  }

  /**
   * 現在のユーザー取得（クライアントサイド）
   */
  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error };
      }

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Get user failed') 
      };
    }
  }

  /**
   * 現在のセッション取得（クライアントサイド）
   */
  async getCurrentSession(): Promise<{ session: Session | null; error: Error | null }> {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { session: null, error };
      }

      return { session, error: null };
    } catch (error) {
      return { 
        session: null, 
        error: error instanceof Error ? error : new Error('Get session failed') 
      };
    }
  }

  /**
   * サーバーサイドでのユーザー取得
   */
  async getServerUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const supabase = await createServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return { user: null, error };
      }

      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Get server user failed') 
      };
    }
  }

  /**
   * 認証状態の監視（クライアントサイド）
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * デモユーザーでのログイン
   */
  async signInAsDemo(): Promise<{ user: User | null; error: Error | null }> {
    const demoCredentials = {
      email: 'demo@example.com',
      password: 'demo123456'
    };

    return this.signIn(demoCredentials);
  }
}

// シングルトンインスタンスをエクスポート
export const authService = AuthService.getInstance();