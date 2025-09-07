import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名を結合し、Tailwind CSSのクラスを適切にマージする
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}