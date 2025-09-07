// Component-related types
import type { ReactNode } from 'react';
import type { Word, UserProfile, ReviewWord } from './database';
import type { AppStats } from './api';

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Button component types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Toast component types
export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Learning component types
export interface FlashcardProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  category: string;
  onAddToReview?: (wordId: string) => void;
}

export interface QuizProps {
  words: Word[];
  onComplete: (results: { wordId: string; correct: boolean }[]) => void;
  category: string;
}

export interface ReviewProps {
  onComplete: () => void;
  initialWords?: ReviewWord[];
}

export interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    totalWords: number;
    correctAnswers: number;
    accuracy: number;
    timeSpent: number;
  };
  onRetry?: () => void;
  onContinue?: () => void;
}

// Statistics component types
export interface StatisticsDashboardProps {
  stats: AppStats;
  isLoading?: boolean;
  variant?: 'default' | 'compact';
}

// Audio component types
export interface AudioControlsProps extends BaseComponentProps {
  audioUrl?: string;
  autoPlay?: boolean;
  showControls?: boolean;
}

export interface AudioProviderProps extends BaseComponentProps {
  preloadAudio?: boolean;
}

// Auth component types
export interface LoginFormProps extends BaseComponentProps {
  variant?: 'card' | 'inline';
  showCard?: boolean;
  onSuccess?: () => void;
  redirectTo?: string;
}

export interface ProfileFormProps extends BaseComponentProps {
  onProfileUpdate?: (profile: UserProfile) => void;
  initialData?: Partial<UserProfile>;
}

export interface AuthWrapperProps extends BaseComponentProps {
  fallback?: ReactNode;
  redirectTo?: string;
}

// Layout component types
export interface HeaderProps extends BaseComponentProps {
  title?: string;
  showBackButton?: boolean;
  showUserMenu?: boolean;
  variant?: 'default' | 'minimal' | 'dashboard';
}

export interface FooterProps extends BaseComponentProps {
  variant?: 'default' | 'minimal';
  showThemeSwitcher?: boolean;
  showLinks?: boolean;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen?: boolean;
  onToggle?: () => void;
  variant?: 'default' | 'compact';
}

// Category component types
export interface CategoryBadgeProps extends BaseComponentProps {
  categoryName: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface CategoryDisplayProps extends BaseComponentProps {
  categoryName: string;
  showEnglishName?: boolean;
  showDescription?: boolean;
}

export interface CategoryProgressProps extends BaseComponentProps {
  categoryName: string;
  current: number;
  total: number;
  showPercentage?: boolean;
}

// Contact component types
export interface ContactFormProps extends BaseComponentProps {
  variant?: 'default' | 'minimal';
  onSubmit?: (data: Record<string, unknown>) => void;
}

// Theme component types
export interface ThemeSwitcherProps extends BaseComponentProps {
  inline?: boolean;
  showLabel?: boolean;
}

// Tutorial component types
export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TutorialStep[];
}

export interface TutorialStep {
  title: string;
  content: string;
  image?: string;
  action?: string;
}

export interface TutorialWrapperProps extends BaseComponentProps {
  tutorialKey: string;
  autoShow?: boolean;
}

// Suspense and loading component types
export interface SuspenseWrapperProps extends BaseComponentProps {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse';
}

// Error boundary types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: Record<string, unknown>) => void;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}