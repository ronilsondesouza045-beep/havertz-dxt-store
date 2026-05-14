import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function safeDate(date: any): Date {
  if (!date) return new Date();
  if (typeof date.toDate === 'function') return date.toDate();
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function generateOrderCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
