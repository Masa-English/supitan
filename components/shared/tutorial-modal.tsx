"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Zap, Brain, Target, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'スピ単へようこそ！',
    description: '効率的な英語学習を始めましょう',
    icon: Zap,
  },
  {
    title: '学習法',
    description: 'スピ単は、Masa式学習法に基づいた英単語学習アプリです。',
    icon: Brain,
  },
  {
    title: '3つの学習モード',
    description: 'フラッシュカード、クイズ、復習の3つのモードで効率的に学習できます。',
    icon: Target,
  },
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function TutorialModal({ isOpen, onClose, onComplete }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    if (isOpen && !hasSeenTutorial) {
      setCurrentStep(0);
    }
  }, [isOpen, hasSeenTutorial]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasSeenTutorial(true);
      onComplete?.();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setHasSeenTutorial(true);
    onComplete?.();
    onClose();
  };

  const currentStepData = tutorialSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* アイコン */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>

          {/* タイトル */}
          <h2 className="text-xl font-bold text-foreground mb-3">
            {currentStepData.title}
          </h2>

          {/* 説明 */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* プログレスインジケーター */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              スキップ
            </Button>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="border-border"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  前へ
                </Button>
              )}

              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {currentStep === tutorialSteps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    完了
                  </>
                ) : (
                  <>
                    次へ
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}