'use client';

import { Input } from '@/components/ui/form/input';

interface RandomInputProps {
  wordsCount: number;
  defaultValue: number;
  value?: number;
  onChange?: (value: number) => void;
}

export function RandomInput({ wordsCount, defaultValue, value, onChange }: RandomInputProps) {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 1;
    let finalValue = inputValue;

    if (inputValue > wordsCount) {
      finalValue = wordsCount;
      e.target.value = wordsCount.toString();
    }

    if (inputValue < 1) {
      finalValue = 1;
      e.target.value = '1';
    }

    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value) || 1;

    if (inputValue > wordsCount) {
      e.target.value = wordsCount.toString();
    }

    if (inputValue < 1) {
      e.target.value = '1';
    }
  };

  return (
    <Input
      id="random-count"
      type="number"
      name="count"
      min={1}
      max={wordsCount}
      value={value !== undefined ? value : defaultValue}
      className="w-full sm:w-40"
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}
