'use client';

import { useEffect, useRef } from 'react';
import { useGetCountriesQuery } from '@/shared/api/dictionary';
import { Field } from '@/shared/components/form-fields/Field';
import { IconButton } from '@/shared/components/ui/IconButton';
import { LoadError } from '@/shared/components/ui/LoadError';
import { Select } from '@/shared/components/ui/Select';
import { useDispatch } from 'react-redux';
import { useFormSelector } from '../../model/hooks';
import { countryAdded, countryChanged, countryRemoved, selectDetails } from '../../model/slice';
import { MAX_COUNTRIES } from '../../model/validation';
import styles from './CountriesField.module.scss';

const LABEL = 'Страна путешествия';

export function CountriesField({ error }: { error?: string }) {
  const dispatch = useDispatch();
  const { countryIds } = useFormSelector(selectDetails);
  const countries = useGetCountriesQuery();

  const selects = useRef<(HTMLSelectElement | null)[]>([]);
  const removeButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<(() => HTMLElement | null | undefined) | null>(null);
  const canAdd = !countryIds.includes(null) && countryIds.length < MAX_COUNTRIES;

  useEffect(() => {
    pendingFocus.current?.()?.focus();
    pendingFocus.current = null;
  }, [countryIds.length]);

  const add = () => {
    if (!canAdd) return;
    const index = countryIds.length;
    pendingFocus.current = () => selects.current[index];
    dispatch(countryAdded());
  };

  // Focuses a button, not a select: iOS Safari opens the picker of a focused select.
  const remove = (index: number) => {
    const next = Math.min(index, countryIds.length - 2);
    pendingFocus.current = () =>
      countryIds.length > 2 ? removeButtons.current[next] : addButton.current;
    dispatch(countryRemoved(index));
  };

  return (
    <Field
      label={LABEL}
      hint="Страны, в которые вы едете. От них зависят доступные программы страхования."
      error={error}
    >
      {(control) =>
        countries.isError ? (
          <LoadError message="Не удалось загрузить страны" onRetry={countries.refetch} />
        ) : (
          <div className={styles.rows}>
            {countryIds.map((countryId, index) => {
              const isLast = index === countryIds.length - 1;
              return (
                <div key={index} className={styles.row}>
                  <Select
                    ref={(select) => {
                      selects.current[index] = select;
                    }}
                    id={index === 0 ? control.id : undefined}
                    aria-label={index === 0 ? undefined : `${LABEL} ${index + 1}`}
                    aria-describedby={control['aria-describedby']}
                    invalid={Boolean(error) && countryId === null}
                    loading={countries.isLoading}
                    placeholder={countries.isLoading ? 'Загружаем страны…' : 'Выберите страну'}
                    value={countries.isLoading ? '' : (countryId ?? '')}
                    onChange={(event) =>
                      dispatch(countryChanged({ index, countryId: Number(event.target.value) }))
                    }
                  >
                    {countries.data
                      ?.filter(({ id }) => id === countryId || !countryIds.includes(id))
                      .map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                  </Select>
                  {countryIds.length > 1 && (
                    <IconButton
                      ref={(button) => {
                        removeButtons.current[index] = button;
                      }}
                      icon="/icons/minus.svg"
                      size={32}
                      label={`Удалить страну ${index + 1}`}
                      className={styles.action}
                      onClick={() => remove(index)}
                    />
                  )}
                  {isLast ? (
                    <IconButton
                      ref={addButton}
                      icon="/icons/plus.svg"
                      size={32}
                      label="Добавить страну"
                      aria-disabled={!canAdd}
                      className={styles.action}
                      onClick={add}
                    />
                  ) : (
                    <span className={styles.actionSlot} />
                  )}
                </div>
              );
            })}
          </div>
        )
      }
    </Field>
  );
}
