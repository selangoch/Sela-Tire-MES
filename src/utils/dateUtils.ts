/**
 * Date utility functions for Sela Tire MES
 * Handles local date strings (YYYY-MM-DD), today's date detection, and formatting.
 */

/**
 * Returns today's date in local time formatted as 'YYYY-MM-DD'
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object or numeric timestamp to 'YYYY-MM-DD'
 */
export function formatDateToString(d: Date | number): string {
  const dateObj = typeof d === 'number' ? new Date(d) : d;
  if (isNaN(dateObj.getTime())) {
    return getTodayDateString();
  }
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' string safely into a Date object at local start of day
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map((p) => parseInt(p, 10));
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day);
}

/**
 * Formats a YYYY-MM-DD date into friendly Khmer display
 * Example: 2026-09-06 -> "ថ្ងៃទី ០៦ ខែកញ្ញា ឆ្នាំ២០២៦"
 */
const khmerMonths = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

export function formatKhmerDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map((p) => parseInt(p, 10));
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const monthIndex = parts[1] - 1;
  const day = parts[2];
  const monthName = khmerMonths[monthIndex] || `ខែ${parts[1]}`;
  return `ថ្ងៃទី ${day} ខែ${monthName} ឆ្នាំ${year}`;
}
