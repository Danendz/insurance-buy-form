import { describe, expect, it } from 'vitest';
import { daysInMonth, diffInDays, parseIsoDate, toIsoDate } from './date';

describe('date helpers', () => {
  it('formats and parses ISO dates', () => {
    expect(toIsoDate(2024, 9, 5)).toBe('2024-09-05');
    expect(parseIsoDate('2024-09-05')).toEqual({ year: 2024, month: 9, day: 5 });
  });

  it('clamps the day to the length of the month', () => {
    expect(toIsoDate(2025, 2, 31)).toBe('2025-02-28');
    expect(toIsoDate(2024, 2, 31)).toBe('2024-02-29');
  });

  it('knows month lengths', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2024, 12)).toBe(31);
  });

  it('counts days between dates, ignoring DST', () => {
    expect(diffInDays('2024-03-30', '2024-04-02')).toBe(3);
    expect(diffInDays('2024-09-05', '2024-09-05')).toBe(0);
  });
});
