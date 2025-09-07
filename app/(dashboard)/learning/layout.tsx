import { ReactNode } from 'react';

export default function LearningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="learning-layout">
      {children}
    </div>
  );
}