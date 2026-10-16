import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, titleCaseUpper } from './format';

describe('titleCaseUpper', () => {
  it('title-cases text written in capitals', () => {
    expect(titleCaseUpper('ЛАТВИЯ')).toBe('Латвия');
    expect(titleCaseUpper('ПАПУА НОВАЯ ГВИНЕЯ')).toBe('Папуа Новая Гвинея');
    expect(titleCaseUpper('ШРИ-ЛАНКА')).toBe('Шри-Ланка');
  });

  it('applies lowercase and uppercase word lists', () => {
    const options = { lowercase: new Set(['и']), uppercase: new Set(['США']) };
    expect(titleCaseUpper('БОСНИЯ И ГЕРЦЕГОВИНА', options)).toBe('Босния и Герцеговина');
    expect(titleCaseUpper('ТЕРРИТОРИИ США', options)).toBe('Территории США');
  });

  it('leaves mixed-case text', () => {
    expect(titleCaseUpper('Весь мир')).toBe('Весь мир');
  });
});

describe('formatNumber', () => {
  it('groups thousands with plain spaces', () => {
    expect(formatNumber(20000)).toBe('20 000');
  });

  it('supports other locales and fraction digits', () => {
    expect(formatNumber(1234.5, { locale: 'en-US', fractionDigits: 2 })).toBe('1,234.50');
  });
});

describe('formatDate', () => {
  it('formats dates as DD/MM/YYYY', () => {
    expect(formatDate('2024-09-05')).toBe('05/09/2024');
  });
});
