/**
 * Timezone utilities for Caspiy Futsal Club (Asia/Aqtau, Aktau, UTC+5)
 */

export const TEAM_TIMEZONE = 'Asia/Aqtau';

/**
 * Returns YYYY-MM-DD string in Asia/Aqtau timezone.
 */
export function getAqtauDate(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TEAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d); // Returns YYYY-MM-DD
  } catch {
    // Fallback if environment lacks specific timezone data
    const offset = 5 * 60; // UTC+5 in minutes for Aktau
    const local = new Date(d.getTime() + (offset + d.getTimezoneOffset()) * 60000);
    return local.toISOString().split('T')[0];
  }
}

// Backward-compatible alias for existing codebase
export const getAlmatyDate = getAqtauDate;


/**
 * Formats YYYY-MM-DD string to Russian readable date (e.g., "23 сентября 2026")
 */
export function formatRussianDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  return `${day} ${months[month]} ${year}`;
}

/**
 * Formats date to short Russian format (e.g., "23.09.2026")
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

/**
 * Generates an array of last N days in YYYY-MM-DD ending at baseDate
 */
export function getLastNDays(days: number, baseDateStr?: string): string[] {
  const result: string[] = [];
  const base = baseDateStr ? new Date(baseDateStr) : new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const target = new Date(base.getTime() - i * 24 * 60 * 60 * 1000);
    result.push(getAlmatyDate(target));
  }
  return result;
}
