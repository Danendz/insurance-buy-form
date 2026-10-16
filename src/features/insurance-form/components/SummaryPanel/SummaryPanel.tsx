'use client';

import { useId } from 'react';
import Image from 'next/image';
import { useGetActivitiesQuery, useGetCountriesQuery } from '@/shared/api/dictionary';
import { formatPhone } from '@/shared/utils/phone';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { formatDate } from '@/shared/utils/format';
import { useDispatch } from 'react-redux';
import { useFormSelector } from '../../model/hooks';
import { COVERAGE_TYPE_LABELS } from '../../model/labels';
import { goToDetails, selectDetails } from '../../model/slice';
import styles from './SummaryPanel.module.scss';

export function SummaryPanel() {
  const dispatch = useDispatch();
  const titleId = useId();
  const details = useFormSelector(selectDetails);
  const countries = useGetCountriesQuery();
  const activities = useGetActivitiesQuery();

  const countryNames = details.countryIds
    .map((countryId) => countries.data?.find(({ id }) => id === countryId)?.name)
    .filter((name) => name !== undefined);
  const activity = activities.data?.find(({ id }) => id === details.activityId);

  const rows: { label: string; value: string | undefined; loading?: boolean }[] = [
    {
      label: details.countryIds.length > 1 ? 'Страны путешествия' : 'Страна путешествия',
      value: countryNames.length > 0 ? countryNames.join(', ') : undefined,
      loading: countries.isLoading,
    },
    { label: 'Тип покрытия', value: COVERAGE_TYPE_LABELS[details.coverageType] },
    {
      label: 'Начало страхования',
      value: details.startDate ? formatDate(details.startDate) : undefined,
    },
    {
      label: 'Конец страхования',
      value: details.endDate ? formatDate(details.endDate) : undefined,
    },
    { label: 'Цель', value: activity?.name, loading: activities.isLoading },
    {
      label: 'Номер телефона',
      value: details.phone ? formatPhone(details.phone, details.phoneCountry) : undefined,
    },
  ];

  return (
    <aside className={styles.panel} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        Ваши данные
      </h2>
      <dl className={styles.list}>
        {rows.map(({ label, value, loading }) => (
          <div key={label} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>
              {loading ? <Skeleton className={styles.skeleton} /> : (value ?? '—')}
              <button
                type="button"
                className={styles.edit}
                aria-label={`Изменить: ${label}`}
                onClick={() => dispatch(goToDetails())}
              >
                <Image src="/icons/edit.svg" alt="" width={10} height={10} unoptimized />
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
