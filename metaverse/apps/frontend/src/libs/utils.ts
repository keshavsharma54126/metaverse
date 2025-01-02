import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-In", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function getRandomId(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
