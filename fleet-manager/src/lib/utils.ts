import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formats a UTC timestamp as an Argentina local date (avoids UTC midnight → previous day issue)
export function formatDate(date: Date | string, fmt = "dd/MM/yy"): string {
  const d = typeof date === "string" ? new Date(date) : date
  // Use UTC parts to reconstruct the date without timezone shifting
  const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  return format(utcDate, fmt, { locale: es })
}

// Parses a "YYYY-MM-DD" string from an HTML date input into a UTC timestamp
// stored at 15:00 UTC (= noon Argentina time, UTC-3), so day-boundary is always safe
export function parseDateInput(dateStr: string): Date {
  const [yr, mo, dy] = dateStr.split("-").map(Number)
  return new Date(Date.UTC(yr, mo - 1, dy, 15, 0, 0))
}
