import { describe, expect, it } from 'vitest';
import { formatPhone, isValidPhone } from './phone';

describe('phone helpers', () => {
  it('checks the number against its country', () => {
    expect(isValidPhone('+998901234567')).toBe(true);
    expect(isValidPhone('+99890123')).toBe(false);
  });

  it('formats international numbers', () => {
    expect(formatPhone('+998901234567')).toBe('+998 90 123 45 67');
    expect(formatPhone('')).toBeUndefined();
  });
});
