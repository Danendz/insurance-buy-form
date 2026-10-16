'use client';

import { useEffect, type FormEvent } from 'react';
import { useGetActivitiesQuery } from '@/shared/api/dictionary';
import { DateField } from '@/shared/components/form-fields/DateField';
import { Field } from '@/shared/components/form-fields/Field';
import { PhoneField } from '@/shared/components/form-fields/PhoneField';
import { Button } from '@/shared/components/ui/Button';
import { LoadError } from '@/shared/components/ui/LoadError';
import { Radio } from '@/shared/components/ui/Radio';
import { addDays, parseIsoDate } from '@/shared/utils/date';
import { useDispatch } from 'react-redux';
import type { CoverageType, IsoDate } from '../../types';
import { useFormSelector } from '../../model/hooks';
import { COVERAGE_TYPE_LABELS } from '../../model/labels';
import { MAX_TRIP_DAYS } from '../../model/validation';
import {
  selectDetails,
  selectDetailsErrors,
  selectSubmitAttempted,
  startDatePrefilled,
  submitDetails,
  updateDetails,
} from '../../model/slice';
import { CountriesField } from '../CountriesField';
import { SaveNote } from '../SaveNote';
import { ActivitiesSkeleton } from './DetailsStepSkeleton';
import styles from './DetailsStep.module.scss';

const COVERAGE_TYPES = Object.entries(COVERAGE_TYPE_LABELS) as [CoverageType, string][];

export function DetailsStep({ today }: { today: IsoDate }) {
  const dispatch = useDispatch();
  const details = useFormSelector(selectDetails);
  const submitAttempted = useFormSelector(selectSubmitAttempted);
  const allErrors = useFormSelector((state) => selectDetailsErrors(state, today));
  const errors = submitAttempted ? allErrors : {};

  useEffect(() => {
    dispatch(startDatePrefilled(today));
  }, [dispatch, today]);

  const activities = useGetActivitiesQuery();

  const update = (patch: Parameters<typeof updateDetails>[0]) => dispatch(updateDetails(patch));
  const currentYear = parseIsoDate(today).year;
  const years = [currentYear, currentYear + 1, currentYear + 2];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(submitDetails(today));
    const form = event.currentTarget;
    // Errors render on the next frame.
    requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid]')?.focus());
  };

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <h1 className={styles.title} tabIndex={-1}>
        Покупка страхового полиса
      </h1>

      <CountriesField error={errors.countryIds} />

      <Field
        label="Тип покрытия"
        kind="group"
        hint="Однократное — одна поездка. Многократное — любое число поездок в течение срока полиса."
      >
        {(control) => (
          <div className={styles.coverageTypes}>
            {COVERAGE_TYPES.map(([value, label]) => (
              <Radio
                key={value}
                name="coverageType"
                value={value}
                label={label}
                className={styles.coverageType}
                checked={details.coverageType === value}
                aria-describedby={control['aria-describedby']}
                onChange={() => update({ coverageType: value })}
              />
            ))}
          </div>
        )}
      </Field>

      <Field
        label="Начало страхования"
        kind="group"
        className={styles.indented}
        hint="Первый день действия полиса — не раньше сегодняшнего."
        error={errors.startDate}
      >
        {(control) => (
          <DateField
            {...control}
            value={details.startDate}
            onChange={(startDate) => update({ startDate })}
            min={today}
            years={years}
          />
        )}
      </Field>

      <Field
        label="Конец страхования"
        kind="group"
        className={styles.indented}
        hint="Последний день действия полиса. Срок — до 365 дней."
        error={errors.endDate}
      >
        {(control) => (
          <DateField
            {...control}
            value={details.endDate}
            onChange={(endDate) => update({ endDate })}
            min={addDays(details.startDate ?? today, 1)}
            max={details.startDate ? addDays(details.startDate, MAX_TRIP_DAYS) : undefined}
            years={years}
          />
        )}
      </Field>

      <Field
        label="Цель поездки"
        kind="group"
        hideLabel
        hint="Цель поездки. Для занятий спортом действует повышенный тариф."
        error={errors.activityId}
      >
        {(control) =>
          activities.isLoading ? (
            <ActivitiesSkeleton />
          ) : activities.isError ? (
            <LoadError message="Не удалось загрузить цели поездки" onRetry={activities.refetch} />
          ) : (
            <div className={styles.activities}>
              {activities.data?.map((activity) => (
                <Radio
                  key={activity.id}
                  name="activityId"
                  value={activity.id}
                  label={activity.name}
                  className={styles.activity}
                  checked={details.activityId === activity.id}
                  aria-describedby={control['aria-describedby']}
                  aria-invalid={control['aria-invalid']}
                  onChange={() => update({ activityId: activity.id })}
                />
              ))}
            </div>
          )
        }
      </Field>

      <Field
        label="Номер мобильного телефона"
        className={styles.indented}
        hint="Отправим на этот номер полис и уведомления о нём."
        error={errors.phone}
      >
        {(control) => (
          <PhoneField
            {...control}
            phone={details.phone}
            country={details.phoneCountry}
            onChange={({ phone, country }) => update({ phone, phoneCountry: country })}
          />
        )}
      </Field>

      <div className={styles.footer}>
        <Button type="submit">Далее</Button>
        <SaveNote />
      </div>
    </form>
  );
}
