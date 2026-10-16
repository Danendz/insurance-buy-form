import type { IsoDate } from '@/shared/types/date';
import { parseIsoDate } from './date';

type NumberOptions = {
  locale?: string;
  fractionDigits?: number;
};

/** Group separators are plain spaces, so the output is predictable in markup and tests. */
export function formatNumber(
  value: number,
  { locale = 'ru-RU', fractionDigits = 0 }: NumberOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
    .format(value)
    .replace(/\s/g, ' ');
}

type TitleCaseOptions = {
  lowercase?: ReadonlySet<string>;
  uppercase?: ReadonlySet<string>;
};

/** `ЛАТВИЯ` → `Латвия`; mixed-case text is returned as is. */
export function titleCaseUpper(
  text: string,
  { lowercase = new Set(), uppercase = new Set() }: TitleCaseOptions = {},
): string {
  if (text !== text.toUpperCase()) return text;
  return text.replace(/[^\s\-()]+/g, (word) => {
    if (uppercase.has(word)) return word;
    const lower = word.toLowerCase();
    if (lowercase.has(lower)) return lower;
    return word.charAt(0) + lower.slice(1);
  });
}

/** `DD/MM/YYYY`. */
export function formatDate(date: IsoDate): string {
  const { year, month, day } = parseIsoDate(date);
  return [day, month].map((part) => String(part).padStart(2, '0')).join('/') + `/${year}`;
}
