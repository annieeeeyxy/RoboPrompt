import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 * Handles conflicting Tailwind classes properly
 * 
 * @example
 * cn("px-4", "px-8") // px-8 wins
 * cn("px-4", condition && "px-8")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Common button style combinations
 */
export const buttonStyles = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'bg-transparent hover:bg-gray-800 text-white border border-gray-700',
};

/**
 * Common input style combinations
 */
export const inputStyles = {
  default: 'bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  error: 'bg-gray-900 border border-red-500/50 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500',
  disabled: 'bg-gray-900 border border-gray-700 text-gray-500 placeholder-gray-600 cursor-not-allowed opacity-50',
};

/**
 * Common card style combinations
 */
export const cardStyles = {
  default: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8',
  interactive: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all hover:shadow-2xl',
};
