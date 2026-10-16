'use client';

import { useLayoutEffect, useMemo, useRef, type ChangeEvent, type ClipboardEvent } from 'react';
import type { FieldControlProps } from '../Field';
import {
  PHONE_COUNTRIES,
  dialCodeOf,
  formatNational,
  nationalDigits,
  onlyDigits,
  parsePastedPhone,
  toE164,
  type PhoneCountry,
} from '@/shared/utils/phone';
import styles from './PhoneField.module.scss';

export type PhoneValue = {
  /** E.164, or `''` while no digits are entered. */
  phone: string;
  country: PhoneCountry;
};

type PhoneFieldProps = FieldControlProps &
  PhoneValue & {
    onChange: (value: PhoneValue) => void;
  };

/** Caret index after the first `count` digits of `text`, past any separator that follows them. */
function caretAfterDigits(text: string, count: number) {
  let seen = 0;
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text[index]) && seen++ === count) return index;
  }
  return text.length;
}

function useCountryOptions() {
  return useMemo(() => {
    const names = new Intl.DisplayNames('ru', { type: 'region' });
    return PHONE_COUNTRIES.map(({ iso2, dialCode }) => ({
      iso2,
      label: `${names.of(iso2) ?? iso2} +${dialCode}`,
    })).sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, []);
}

export function PhoneField({ phone, country, onChange, ...control }: PhoneFieldProps) {
  const options = useCountryOptions();
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const dialCode = dialCodeOf(country);
  const digits = nationalDigits(phone, country);
  const display = formatNational(digits, country);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (caretRef.current === null || !input) return;
    input.setSelectionRange(caretRef.current, caretRef.current);
    caretRef.current = null;
  });

  const emit = (nextDigits: string, nextCountry: PhoneCountry, digitsBeforeCaret: number) => {
    const nextDisplay = formatNational(nextDigits, nextCountry);
    caretRef.current = caretAfterDigits(nextDisplay, digitsBeforeCaret);
    const nextPhone = toE164(onlyDigits(nextDisplay), nextCountry);
    if (nextPhone === phone && nextCountry === country) {
      // Nothing to re-render, so restore the formatted text and caret here.
      const input = inputRef.current!;
      input.value = nextDisplay;
      input.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
      return;
    }
    onChange({ phone: nextPhone, country: nextCountry });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.target;
    let nextDigits = onlyDigits(value);
    let digitsBeforeCaret = onlyDigits(value.slice(0, selectionStart ?? value.length)).length;
    const deletedSeparator =
      nextDigits === digits &&
      value.length < display.length &&
      (event.nativeEvent as InputEvent).inputType === 'deleteContentBackward';
    if (deletedSeparator && digitsBeforeCaret > 0) {
      nextDigits = nextDigits.slice(0, digitsBeforeCaret - 1) + nextDigits.slice(digitsBeforeCaret);
      digitsBeforeCaret -= 1;
    }
    emit(nextDigits, country, digitsBeforeCaret);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const text = event.clipboardData.getData('text');
    if (!text.trim().startsWith('+')) return;
    event.preventDefault();
    const pasted = parsePastedPhone(text, country);
    emit(pasted.digits, pasted.country, pasted.digits.length);
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    inputRef.current?.focus();
    emit(digits, event.target.value as PhoneCountry, digits.length);
  };

  return (
    <div className={styles.row} data-invalid={control['aria-invalid']}>
      <div className={styles.country}>
        <span className={styles.countryLabel} aria-hidden>
          <span
            className={styles.flag}
            style={{ backgroundImage: `url(/flags/${country.toLowerCase()}.svg)` }}
          />
          (+{dialCode}) {country}
        </span>
        <select
          aria-label="Код страны"
          className={styles.countrySelect}
          value={country}
          onChange={handleCountryChange}
        >
          {options.map(({ iso2, label }) => (
            <option key={iso2} value={iso2}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <input
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="90 123 45 67"
        className={styles.input}
        value={display}
        onChange={handleChange}
        onPaste={handlePaste}
        {...control}
      />
    </div>
  );
}
