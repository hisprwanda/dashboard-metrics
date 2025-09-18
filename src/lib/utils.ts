import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function capitalizeFirstChar(input: string): string {
  if (!input) return input; // Handle empty or null strings
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function formatDate(date: Date | null): string {
  return date ? date.toLocaleDateString() : "N/A"; // Format date or return "N/A" if null
}

export const formatDateToYYYYMMDD = (date: Date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
