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

type Range = { min: IsoDate; max?: IsoDate };

// ISO dates compare correctly as strings.
const overlaps = (from: IsoDate, to: IsoDate, { min, max }: Range) =>
  to >= min && (!max || from <= max);

const yearAllowed = (year: number, range: Range) =>
  overlaps(`${year}-01-01`, `${year}-12-31`, range);

const monthAllowed = (year: number, month: number, range: Range) =>
  overlaps(toIsoDate(year, month, 1), toIsoDate(year, month, 31), range);

const dateAllowed = (date: IsoDate, range: Range) => overlaps(date, date, range);

/** Drops the smallest parts that no longer fit the range. */
function fitRange(parts: Parts, range: Range): Parts {
  const year = Number(parts.year);
  const month = Number(parts.month);
  if (year && month && !monthAllowed(year, month, range)) {
    return { year: parts.year, month: '', day: '' };
  }
  if (
    year &&
    month &&
    parts.day &&
    !dateAllowed(toIsoDate(year, month, Number(parts.day)), range)
  ) {
    return { ...parts, day: '' };
  }
  return parts;
}

type DateFieldProps = FieldControlProps & {
  value: IsoDate | null;
  onChange: (value: IsoDate | null) => void;
  min: IsoDate;
  max?: IsoDate;
  years: number[];
};

/** Day/month/year selects plus a calendar button that opens the native date picker. */
export function DateField({ value, onChange, min, max, years, id, ...aria }: DateFieldProps) {
  const range = { min, max };
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
    const next = fitRange({ ...parts, [key]: partValue }, range);
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

  const year = Number(parts.year);
  const month = Number(parts.month);
  const dayCount = year && month ? daysInMonth(year, month) : 31;

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
          <option
            key={index}
            value={index + 1}
            disabled={
              Boolean(year && month) && !dateAllowed(toIsoDate(year, month, index + 1), range)
            }
          >
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
          <option
            key={name}
            value={index + 1}
            disabled={Boolean(year) && !monthAllowed(year, index + 1, range)}
          >
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
        {years.map((option) => (
          <option key={option} value={option} disabled={!yearAllowed(option, range)}>
            {option}
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
          max={max}
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
