import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSSクラスをマージするユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて、条件付きクラスと競合するクラスを適切に処理
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
