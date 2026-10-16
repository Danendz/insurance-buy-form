import { MAIN_COUNTRY_BY_DIAL_CODE, PHONE_COUNTRIES, type PhoneCountry } from './countries';

type CountryRule = {
  iso2: PhoneCountry;
  dialCode: string;
  lengths: readonly number[];
  mask: string;
};

const RULES = new Map<string, CountryRule>(PHONE_COUNTRIES.map((rule) => [rule.iso2, rule]));
const MAX_DIAL_CODE_LENGTH = 3;

const rule = (country: PhoneCountry) => RULES.get(country)!;
export const onlyDigits = (text: string) => text.replace(/\D/g, '');
const maxLength = (country: PhoneCountry) => Math.max(...rule(country).lengths);

export const isPhoneCountry = (value: unknown): value is PhoneCountry =>
  typeof value === 'string' && RULES.has(value);

export const dialCodeOf = (country: PhoneCountry) => rule(country).dialCode;

/** Fills the country mask; digits past it are appended, past the longest allowed length dropped. */
export function formatNational(digits: string, country: PhoneCountry) {
  const rest = [...digits.slice(0, maxLength(country))];
  let result = '';
  for (const char of rule(country).mask) {
    if (rest.length === 0) break;
    result += char === 'X' ? rest.shift() : char;
  }
  return result + rest.join('');
}

/** `''` without digits, so an untouched field stays empty. */
export const toE164 = (digits: string, country: PhoneCountry) =>
  digits ? `+${dialCodeOf(country)}${digits}` : '';

/** National digits of an E.164 number, `''` if it has another dial code. */
export function nationalDigits(phone: string, country: PhoneCountry) {
  const prefix = `+${dialCodeOf(country)}`;
  return phone.startsWith(prefix) ? phone.slice(prefix.length) : '';
}

/** Expects E.164. */
export function isValidPhone(phone: string, country: string) {
  if (!isPhoneCountry(country) || !/^\+\d+$/.test(phone)) return false;
  const prefix = `+${dialCodeOf(country)}`;
  return phone.startsWith(prefix) && rule(country).lengths.includes(phone.length - prefix.length);
}

/** `+998 90 123 45 67`. */
export const formatPhone = (phone: string, country: PhoneCountry) =>
  `+${dialCodeOf(country)} ${formatNational(nationalDigits(phone, country), country)}`;

/** A leading `+` is read as a dial code; otherwise the text is a national number. */
export function parsePastedPhone(text: string, country: PhoneCountry) {
  const digits = onlyDigits(text);
  if (!text.trim().startsWith('+')) return { country, digits };

  for (let length = 1; length <= MAX_DIAL_CODE_LENGTH; length++) {
    const dialCode = digits.slice(0, length);
    const match = PHONE_COUNTRIES.find((rule) => rule.dialCode === dialCode);
    if (!match) continue;
    const resolved =
      dialCodeOf(country) === dialCode
        ? country
        : (MAIN_COUNTRY_BY_DIAL_CODE[dialCode] ?? match.iso2);
    return { country: resolved, digits: digits.slice(length) };
  }
  return { country, digits };
}
