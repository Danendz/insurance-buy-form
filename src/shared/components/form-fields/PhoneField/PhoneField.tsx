'use client';

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useState } from 'react';
import {
  CountrySelector,
  defaultCountries,
  parseCountry,
  usePhoneInput,
  type CountryIso2,
} from 'react-international-phone';
import 'react-international-phone/style.css';
import type { FieldControlProps } from '../Field';
import { isValidPhone } from '@/shared/utils/phone';
import styles from './PhoneField.module.scss';

const DEFAULT_COUNTRY: CountryIso2 = 'uz';
// Self-hosted: the library otherwise loads every flag from a third-party CDN.
const FLAGS = defaultCountries.map((country) => {
  const { iso2 } = parseCountry(country);
  return { iso2, src: `/flags/${iso2}.svg` };
});

type PhoneFieldProps = FieldControlProps & {
  /** E.164, or `''` while only the dial code is entered. */
  value: string;
  onChange: (value: string) => void;
  defaultCountry?: CountryIso2;
  /** Checks the number for its country on every change and reports it to `onValidityChange`. */
  validate?: boolean;
  onValidityChange?: (valid: boolean) => void;
};

/**
 * The input keeps its own formatting state, so it is remounted when the value changes
 * from outside (restore from storage, reset) rather than from typing.
 */
export function PhoneField({
  value,
  onChange,
  defaultCountry = DEFAULT_COUNTRY,
  validate = false,
  onValidityChange,
  ...control
}: PhoneFieldProps) {
  const [ownValue, setOwnValue] = useState(value);
  const [generation, setGeneration] = useState(0);
  if (value !== ownValue) {
    setOwnValue(value);
    setGeneration((current) => current + 1);
  }

  return (
    <PhoneInput
      key={generation}
      initialValue={value}
      defaultCountry={defaultCountry}
      onChange={(phone) => {
        setOwnValue(phone);
        if (phone === value) return;
        onChange(phone);
        if (validate) onValidityChange?.(isValidPhone(phone));
      }}
      {...control}
    />
  );
}

type PhoneInputProps = FieldControlProps & {
  initialValue: string;
  defaultCountry: CountryIso2;
  onChange: (value: string) => void;
};

function PhoneInput({ initialValue, defaultCountry, onChange, ...control }: PhoneInputProps) {
  const [initial] = useState(() => {
    const parsed = initialValue ? parsePhoneNumberFromString(initialValue) : undefined;
    return {
      country: (parsed?.country?.toLowerCase() as CountryIso2 | undefined) ?? defaultCountry,
      national: parsed?.nationalNumber ?? '',
    };
  });

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry: initial.country,
    value: initial.national,
    disableDialCodeAndPrefix: true,
    onChange: ({ phone, country }) => onChange(phone === `+${country.dialCode}` ? '' : phone),
  });

  return (
    <div className={styles.row} data-invalid={control['aria-invalid']}>
      <CountrySelector
        selectedCountry={country.iso2}
        onSelect={({ iso2 }) => setCountry(iso2, { focusOnInput: true })}
        flags={FLAGS}
        className={styles.selector}
        flagClassName={styles.flag}
        dropdownArrowClassName={styles.libraryArrow}
        dropdownStyleProps={{ className: styles.dropdown }}
        renderButtonWrapper={({ children, rootProps }) => (
          <button
            type="button"
            {...rootProps}
            aria-label={`Код страны: +${country.dialCode}`}
            className={styles.countryButton}
          >
            {children}
            <span className={styles.dialCode}>
              (+{country.dialCode}) {country.iso2.toUpperCase()}
            </span>
          </button>
        )}
      />
      <input
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="90 123 45 67"
        className={styles.input}
        value={inputValue}
        onChange={handlePhoneValueChange}
        {...control}
      />
    </div>
  );
}
