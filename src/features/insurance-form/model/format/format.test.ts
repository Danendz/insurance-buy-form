import { describe, expect, it } from 'vitest';
import { formatLiability, formatPrice } from './format';

describe('insurance formatters', () => {
  it('formats coverage and prices', () => {
    expect(formatLiability(20000)).toBe('20 000 EUR');
    expect(formatPrice(1234.5)).toBe('EUR 1,234.50');
  });
});
