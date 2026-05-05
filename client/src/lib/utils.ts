import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function capitalizeFirstLetter(str: string) {
  if (!str) {
    return "";
  }
  const firstChar = str.charAt(0).toUpperCase();
  const restOfString = str.slice(1);
  return firstChar + restOfString;
}