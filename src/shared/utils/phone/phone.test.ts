import { describe, expect, it } from 'vitest';
import { PHONE_COUNTRIES } from './countries';
import {
  formatNational,
  formatPhone,
  isPhoneCountry,
  isValidPhone,
  nationalDigits,
  parsePastedPhone,
  toE164,
} from './phone';

describe('formatNational', () => {
  it('fills the country mask as digits are typed', () => {
    expect(formatNational('', 'UZ')).toBe('');
    expect(formatNational('90', 'UZ')).toBe('90');
    expect(formatNational('901', 'UZ')).toBe('90 1');
    expect(formatNational('901234567', 'UZ')).toBe('90 123 45 67');
  });

  it('appends digits past the mask up to the longest allowed length', () => {
    // AT: mask `XXX XXXXXX`, up to 13 digits.
    expect(formatNational('6641234567890', 'AT')).toBe('664 1234567890');
    expect(formatNational('66412345678901', 'AT')).toBe('664 1234567890');
  });

  it('drops digits past the longest allowed length', () => {
    expect(formatNational('9012345678', 'UZ')).toBe('90 123 45 67');
  });
});

describe('isValidPhone', () => {
  it('accepts a number of an allowed length for the country', () => {
    expect(isValidPhone('+998901234567', 'UZ')).toBe(true);
    expect(isValidPhone('+79123456789', 'RU')).toBe(true);
    expect(isValidPhone('+4915123456789', 'DE')).toBe(true);
    expect(isValidPhone('+491512345678', 'DE')).toBe(true);
  });

  it('rejects a number that is too short or too long', () => {
    expect(isValidPhone('+99890123456', 'UZ')).toBe(false);
    expect(isValidPhone('+9989012345678', 'UZ')).toBe(false);
  });

  it("rejects a number with another country's dial code", () => {
    expect(isValidPhone('+79123456789', 'UZ')).toBe(false);
  });

  it('rejects anything but E.164 and unknown countries', () => {
    expect(isValidPhone('', 'UZ')).toBe(false);
    expect(isValidPhone('998901234567', 'UZ')).toBe(false);
    expect(isValidPhone('+998 90 123 45 67', 'UZ')).toBe(false);
    expect(isValidPhone('+998901234567', 'ZZ')).toBe(false);
  });
});

describe('toE164 and nationalDigits', () => {
  it('round-trips the national number', () => {
    expect(toE164('901234567', 'UZ')).toBe('+998901234567');
    expect(nationalDigits('+998901234567', 'UZ')).toBe('901234567');
  });

  it('keeps an empty field empty rather than a bare dial code', () => {
    expect(toE164('', 'UZ')).toBe('');
    expect(nationalDigits('', 'UZ')).toBe('');
  });

  it("ignores a stored number that doesn't match the country", () => {
    expect(nationalDigits('+79123456789', 'UZ')).toBe('');
  });
});

describe('formatPhone', () => {
  it('formats with the dial code', () => {
    expect(formatPhone('+998901234567', 'UZ')).toBe('+998 90 123 45 67');
  });
});

describe('parsePastedPhone', () => {
  it('reads a leading + as a dial code and switches to its country', () => {
    expect(parsePastedPhone('+998 90 123-45-67', 'RU')).toEqual({
      country: 'UZ',
      digits: '901234567',
    });
  });

  it('keeps the current country when it already has the pasted dial code', () => {
    expect(parsePastedPhone('+7 701 123 45 67', 'KZ')).toEqual({
      country: 'KZ',
      digits: '7011234567',
    });
  });

  it("picks the dial code's main country otherwise", () => {
    expect(parsePastedPhone('+7 701 123 45 67', 'UZ')).toEqual({
      country: 'RU',
      digits: '7011234567',
    });
    expect(parsePastedPhone('+1 415 555 0123', 'UZ').country).toBe('US');
  });

  it('treats text without + as a national number', () => {
    expect(parsePastedPhone('(90) 123-45-67', 'UZ')).toEqual({
      country: 'UZ',
      digits: '901234567',
    });
  });

  it('keeps the current country for an unknown dial code', () => {
    expect(parsePastedPhone('+999 123', 'UZ')).toEqual({ country: 'UZ', digits: '999123' });
  });
});

describe('isPhoneCountry', () => {
  it('accepts known ISO codes only', () => {
    expect(isPhoneCountry('UZ')).toBe(true);
    expect(isPhoneCountry('uz')).toBe(false);
    expect(isPhoneCountry(1)).toBe(false);
  });
});

describe('PHONE_COUNTRIES', () => {
  it('masks every country for a number it accepts', () => {
    for (const { iso2, dialCode, mask } of PHONE_COUNTRIES) {
      const digits = mask.replace(/X/g, '1').replace(/\D/g, '');
      expect(isValidPhone(`+${dialCode}${digits}`, iso2), iso2).toBe(true);
      expect(formatNational(digits, iso2), iso2).toBe(mask.replace(/X/g, '1'));
    }
  });
});
