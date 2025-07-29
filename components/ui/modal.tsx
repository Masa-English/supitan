"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // 少し遅延させてアニメーションを開始
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
    // アニメーション完了後にレンダリングを停止
    const timer = setTimeout(() => setShouldRender(false), 300);
    return () => clearTimeout(timer);
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className={cn(
        "relative z-50 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 transform",
        isVisible 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-95 translate-y-4",
        className
      )}>
        {/* ヘッダー */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* コンテンツ */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("mb-6", className)}>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("flex gap-3 justify-end", className)}>
      {children}
    </div>
  );
} 