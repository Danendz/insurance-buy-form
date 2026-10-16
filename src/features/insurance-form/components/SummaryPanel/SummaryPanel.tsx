'use client';

import Image from 'next/image';
import { useGetActivitiesQuery, useGetCountriesQuery } from '@/shared/api/dictionary';
import { formatPhone } from '@/shared/components/form-fields/PhoneField';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { formatDate } from '@/shared/utils/format';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatCountryName } from '../../model/format';
import { COVERAGE_TYPE_LABELS } from '../../model/labels';
import { goToDetails, selectDetails } from '../../model/slice';
import styles from './SummaryPanel.module.scss';

export function SummaryPanel() {
  const dispatch = useAppDispatch();
  const details = useAppSelector(selectDetails);
  const countries = useGetCountriesQuery();
  const activities = useGetActivitiesQuery();

  const country = countries.data?.find(({ id }) => id === details.countryId);
  const activity = activities.data?.find(({ id }) => id === details.activityId);

  const rows: { label: string; value: string | undefined; loading?: boolean }[] = [
    {
      label: 'Страна путешествия',
      value: country && formatCountryName(country.name),
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
      value: formatPhone(details.phone),
    },
  ];

  return (
    <aside className={styles.panel} aria-labelledby="summary-title">
      <h2 id="summary-title" className={styles.title}>
        Ваши данные
      </h2>
      <dl className={styles.list}>
        {rows.map(({ label, value, loading }) => (
          <div key={label} className={styles.row}>
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>
              {loading ? <Skeleton className={styles.skeleton} /> : (value ?? 'DD/MM/YYYY')}
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
