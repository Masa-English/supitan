"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export function Toast({ isOpen, onClose, title, message, type = 'info', duration = 3000 }: ToastProps) {
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={cn(
        "max-w-sm w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4",
        getStyles()
      )}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {title}
              </p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast context for managing multiple toasts
interface ToastContextType {
  showToast: (message: string, options?: { title?: string; type?: 'success' | 'error' | 'info'; duration?: number }) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    message: string;
    title?: string;
    type: 'success' | 'error' | 'info';
    duration: number;
  }>>([]);

  const showToast = React.useCallback((
    message: string, 
    options: { title?: string; type?: 'success' | 'error' | 'info'; duration?: number } = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = {
      id,
      message,
      title: options.title,
      type: options.type || 'info',
      duration: options.duration || 3000
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="animate-in slide-in-from-top-2 duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Toast
              isOpen={true}
              onClose={() => removeToast(toast.id)}
              title={toast.title}
              message={toast.message}
              type={toast.type}
              duration={0} // Handled by provider
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 