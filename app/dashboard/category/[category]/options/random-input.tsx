'use client';

import { Input } from '@/components/ui/input';

interface RandomInputProps {
  wordsCount: number;
  defaultValue: number;
}

export function RandomInput({ wordsCount, defaultValue }: RandomInputProps) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > wordsCount) {
      e.target.value = wordsCount.toString();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > wordsCount) {
      e.target.value = wordsCount.toString();
    }
  };

  return (
    <Input 
      id="random-count" 
      type="number" 
      name="count" 
      min={1} 
      max={wordsCount}
      defaultValue={defaultValue} 
      className="w-full sm:w-40"
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}
