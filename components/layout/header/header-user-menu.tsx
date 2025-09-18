/**
 * ヘッダーのユーザーメニューコンポーネント
 * ユーザー情報とドロップダウンメニューを管理
 */

'use client';

import { User, LogOut, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderUserMenuProps {
  user: SupabaseUser | null;
  userEmail?: string;
  onSignOut: () => void;
  showUserInfo?: boolean;
}

export function HeaderUserMenu({ 
  user, 
  userEmail, 
  onSignOut, 
  showUserInfo = true 
}: HeaderUserMenuProps) {
  if (!showUserInfo || !user) {
    return null;
  }

  const displayEmail = userEmail || user.email || 'ゲスト';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
        >
          <UserCircle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">
            {displayEmail.length > 20 ? `${displayEmail.substring(0, 20)}...` : displayEmail}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayEmail}</p>
          <p className="text-xs text-muted-foreground">
            {user.user_metadata?.full_name || 'ユーザー'}
          </p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="h-4 w-4" />
          プロフィール
        </DropdownMenuItem>
        
        <DropdownMenuItem className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          設定
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
