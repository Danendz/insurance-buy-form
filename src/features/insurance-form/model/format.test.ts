import { describe, expect, it } from 'vitest';
import { formatCountryName, formatLiability, formatPrice } from './format';

describe('insurance formatters', () => {
  it('formats country names', () => {
    expect(formatCountryName('БОСНИЯ И ГЕРЦЕГОВИНА')).toBe('Босния и Герцеговина');
    expect(formatCountryName('МАЛЫЕ ОСТРОВНЫЕ ТЕРРИТОРИИ США')).toBe(
      'Малые Островные Территории США',
    );
  });

  it('formats coverage and prices', () => {
    expect(formatLiability(20000)).toBe('20 000 EUR');
    expect(formatPrice(1234.5)).toBe('EUR 1,234.50');
  });
});
