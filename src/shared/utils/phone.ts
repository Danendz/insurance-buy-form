import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

/** Expects E.164. */
export const isValidPhone = (phone: string) => isValidPhoneNumber(phone);

/** `+998 90 123 45 67`, or `undefined` if the number can't be parsed. */
export const formatPhone = (phone: string) =>
  parsePhoneNumberFromString(phone)?.formatInternational();
