"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeSwitcherProps {
  inline?: boolean;
}

const ThemeSwitcher = ({ inline = false }: ThemeSwitcherProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;
  
  // テーマアイコンの判定
  const getThemeIcon = () => {
    if (theme === "light") {
      return <Sun key="light" size={ICON_SIZE} className="text-muted-foreground" />;
    }
    // ダークテーマまたはその他の場合
    return <Moon key="dark" size={ICON_SIZE} className="text-muted-foreground" />;
  };

  // インライン表示の場合
  if (inline) {
    return (
      <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1">
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className="h-8 w-8 p-0"
          title="ライトテーマ"
        >
          <Sun size={14} />
        </Button>
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="h-8 w-8 p-0"
          title="ダークテーマ"
        >
          <Moon size={14} />
        </Button>
      </div>
    );
  }

  // ドロップダウン表示（デフォルト）
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 h-9" title="テーマを変更">
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />
            <span>ライト</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />
            <span>ダーク</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
