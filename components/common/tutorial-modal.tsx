"use client";

import { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Target, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Masa Flashへようこそ！',
    description: '効率的な英単語学習を始めましょう',
    icon: BookOpen,
    content: (
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-lg text-muted-foreground">
          Masa Flashは、科学的な学習法に基づいた英単語学習アプリです。
          フラッシュカードとクイズを組み合わせて、効率的に単語を覚えることができます。
        </p>
      </div>
    )
  },
  {
    id: 'flashcard',
    title: 'フラッシュカード学習',
    description: 'カードをめくって単語を覚える',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="w-32 h-48 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-blue-800">Hello</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>音声機能付きで発音も確認</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>意味と例文で理解を深める</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>自分のペースで学習可能</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'quiz',
    title: 'クイズ学習',
    description: '選択問題で理解度を確認',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6 mb-4">
          <p className="text-lg font-semibold text-purple-800 mb-4">「Hello」の意味は？</p>
          <div className="space-y-2">
            <div className="bg-white rounded p-3 border border-purple-200">A. さようなら</div>
            <div className="bg-green-100 rounded p-3 border border-green-300 font-semibold">B. こんにちは</div>
            <div className="bg-white rounded p-3 border border-purple-200">C. ありがとう</div>
            <div className="bg-white rounded p-3 border border-purple-200">D. おはよう</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>間違えた問題は自動で復習リストに追加</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>正答率で学習進捗を確認</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'review',
    title: '復習システム',
    description: '間隔反復で確実に定着',
    icon: Target,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold">1</span>
            </div>
            <p className="text-sm text-muted-foreground">今日</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-yellow-600 font-bold">3</span>
            </div>
            <p className="text-sm text-muted-foreground">3日後</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">7</span>
            </div>
            <p className="text-sm text-muted-foreground">1週間後</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>忘却曲線に基づく科学的な復習タイミング</span>
          </div>
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <span>長期的な記憶定着をサポート</span>
          </div>
        </div>
      </div>
    )
  }
];

export function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    // スキップ時もlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenTutorial', 'true');
    }
    onClose();
  };

  const currentTutorialStep = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title=""
      className="max-w-2xl mx-4 sm:mx-6"
    >
      <ModalBody className="p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <currentTutorialStep.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
            {currentTutorialStep.title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            {currentTutorialStep.description}
          </p>
        </div>

        <div className="mb-4 sm:mb-6">
          {currentTutorialStep.content}
        </div>

        {/* ステップインジケーター */}
        <div className="flex justify-center space-x-2 mb-4 sm:mb-6">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-primary' 
                  : index < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </ModalBody>

      <ModalFooter className="p-4 sm:p-6 lg:p-8 pt-0">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground text-sm sm:text-base"
          >
            スキップ
          </Button>
          
          <div className="flex gap-2 sm:gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                前へ
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 text-sm sm:text-base"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  完了
                </>
              ) : (
                <>
                  次へ
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
} 