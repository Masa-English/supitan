"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Laptop, Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;
  
  // テーマアイコンの判定を改善
  const getThemeIcon = () => {
    if (theme === "monochrome") {
      return <Palette key="monochrome" size={ICON_SIZE} className="text-muted-foreground" />;
    }
    if (theme === "system") {
      return <Laptop key="system" size={ICON_SIZE} className="text-muted-foreground" />;
    }
    if (theme === "light" || (theme === "system" && resolvedTheme === "light")) {
      return <Sun key="light" size={ICON_SIZE} className="text-muted-foreground" />;
    }
    if (theme === "dark" || (theme === "system" && resolvedTheme === "dark")) {
      return <Moon key="dark" size={ICON_SIZE} className="text-muted-foreground" />;
    }
    // デフォルト
    return <Laptop key="default" size={ICON_SIZE} className="text-muted-foreground" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 h-9">
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="monochrome">
            <Palette size={ICON_SIZE} className="text-muted-foreground" />
            <span>Monochrome</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
