import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return String(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD'): string {
  const val = amount || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `$${val.toLocaleString()}`;
  }
}

export function calculateDurationDays(startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays || 1;
}

export function toNormalizedYMD(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    // If it's already YYYY-MM-DD or contains T, extract YYYY-MM-DD
    const match = dateInput.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function isDateWithinRange(
  targetDate: string | Date,
  rangeStart: string | Date,
  rangeEnd: string | Date
): boolean {
  const target = toNormalizedYMD(targetDate);
  const start = toNormalizedYMD(rangeStart);
  const end = toNormalizedYMD(rangeEnd);
  if (!target || !start || !end) return false;
  return target >= start && target <= end;
}

