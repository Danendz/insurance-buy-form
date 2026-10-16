'use client';

import { useRef, useState } from 'react';
import { IconButton } from '@/shared/components/ui/IconButton';
import { Select } from '@/shared/components/ui/Select';
import type { FieldControlProps } from '../Field';
import type { IsoDate } from '@/shared/types/date';
import { daysInMonth, MONTHS, parseIsoDate, toIsoDate } from '@/shared/utils/date';
import styles from './DateField.module.scss';

type Parts = { day: string; month: string; year: string };

const EMPTY: Parts = { day: '', month: '', year: '' };

const toParts = (value: IsoDate | null): Parts => {
  if (!value) return EMPTY;
  const { year, month, day } = parseIsoDate(value);
  return { day: String(day), month: String(month), year: String(year) };
};

type DateFieldProps = FieldControlProps & {
  value: IsoDate | null;
  onChange: (value: IsoDate | null) => void;
  /** Earliest date in the calendar picker. */
  min: IsoDate;
  years: number[];
};

/** Day/month/year selects plus a calendar button that opens the native date picker. */
export function DateField({ value, onChange, min, years, id, ...aria }: DateFieldProps) {
  // Partially filled selects have no ISO value yet, so they live here until complete.
  const [parts, setParts] = useState(() => toParts(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setParts(toParts(value));
  }
  const pickerRef = useRef<HTMLInputElement>(null);

  const emit = (next: IsoDate | null) => {
    setSyncedValue(next);
    if (next !== value) onChange(next);
  };

  const change = (key: keyof Parts, partValue: string) => {
    const next = { ...parts, [key]: partValue };
    const { day, month, year } = next;
    if (day && month && year) {
      const iso = toIsoDate(Number(year), Number(month), Number(day));
      setParts(toParts(iso));
      emit(iso);
    } else {
      setParts(next);
      emit(null);
    }
  };

  const openPicker = () => {
    try {
      pickerRef.current?.showPicker();
    } catch {
      // `showPicker` is missing in old browsers; the selects still work.
    }
  };

  const dayCount =
    parts.month && parts.year ? daysInMonth(Number(parts.year), Number(parts.month)) : 31;

  return (
    <div className={styles.row}>
      <Select
        id={id}
        size="sm"
        className={styles.day}
        aria-label="День"
        placeholder="ДД"
        value={parts.day}
        onChange={(event) => change('day', event.target.value)}
        {...aria}
      >
        {Array.from({ length: dayCount }, (_, index) => (
          <option key={index} value={index + 1}>
            {String(index + 1).padStart(2, '0')}
          </option>
        ))}
      </Select>
      <Select
        size="sm"
        className={styles.month}
        aria-label="Месяц"
        placeholder="Месяц"
        value={parts.month}
        onChange={(event) => change('month', event.target.value)}
        {...aria}
      >
        {MONTHS.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </Select>
      <Select
        size="sm"
        className={styles.year}
        aria-label="Год"
        placeholder="ГГГГ"
        value={parts.year}
        onChange={(event) => change('year', event.target.value)}
        {...aria}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
      <span className={styles.calendar}>
        <IconButton
          icon="/icons/calendar.svg"
          size={25}
          label="Выбрать в календаре"
          onClick={openPicker}
        />
        <input
          ref={pickerRef}
          type="date"
          className={styles.picker}
          tabIndex={-1}
          aria-hidden
          min={min}
          value={value ?? ''}
          onChange={(event) => {
            const picked = event.target.value || null;
            setParts(toParts(picked));
            emit(picked);
          }}
        />
      </span>
    </div>
  );
}
