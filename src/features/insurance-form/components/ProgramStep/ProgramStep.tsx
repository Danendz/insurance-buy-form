'use client';

import { Button } from '@/shared/components/ui/Button';
import { LoadError } from '@/shared/components/ui/LoadError';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useDispatch } from 'react-redux';
import type { IsoDate, ValidTripDetails } from '../../types';
import { useCreateOrderMutation, useGetTripProgramsQuery, useGetQuoteQuery } from '../../model/api';
import { useFormSelector } from '../../model/hooks';
import { formatPrice } from '../../model/format';
import {
  goToDetails,
  orderPlaced,
  selectDetails,
  selectDetailsErrors,
  selectProgram,
  selectProgramId,
} from '../../model/slice';
import { hasErrors } from '../../model/validation';
import { ProgramCard } from '../ProgramCard';
import { SaveNote } from '../SaveNote';
import styles from './ProgramStep.module.scss';

export function ProgramStep({ today }: { today: IsoDate }) {
  const details = useFormSelector(selectDetails);
  const errors = useFormSelector((state) => selectDetailsErrors(state, today));

  // A restored session can be outdated, e.g. the start date is now in the past.
  if (hasErrors(errors)) {
    return <StaleDetails />;
  }
  return <ProgramChoice details={details as ValidTripDetails} />;
}

function StaleDetails() {
  const dispatch = useDispatch();
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Выберите программу</h1>
      <p className={styles.message}>Данные поездки устарели. Проверьте их, чтобы продолжить.</p>
      <Button onClick={() => dispatch(goToDetails())}>Проверить данные</Button>
    </div>
  );
}

function ProgramChoice({ details }: { details: ValidTripDetails }) {
  const dispatch = useDispatch();
  const chosenId = useFormSelector(selectProgramId);
  const { coverageType, startDate, endDate, activityId } = details;
  // Sorted, so the order of the rows doesn't split the cache.
  const countryIds = details.countryIds.toSorted((a, b) => a - b);
  const several = countryIds.length > 1;

  const programs = useGetTripProgramsQuery(countryIds);
  const quote = useGetQuoteQuery({ countryIds, coverageType, startDate, endDate, activityId });
  const [createOrder, order] = useCreateOrderMutation();

  const selected = programs.data?.find((program) => program.id === chosenId) ?? programs.data?.[0];
  const price = selected && quote.data?.[selected.id];

  const handleOrder = async () => {
    if (!selected) return;
    try {
      const { orderId } = await createOrder({ ...details, programId: selected.id }).unwrap();
      dispatch(orderPlaced(orderId));
    } catch {
      // Rendered from `order.isError`.
    }
  };

  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Выберите программу</h1>

      <fieldset className={styles.programs} aria-busy={programs.isFetching}>
        <legend className={styles.legend}>Программа страхования</legend>
        {programs.isLoading ? (
          [0, 1, 2].map((index) => <Skeleton key={index} className={styles.programSkeleton} />)
        ) : programs.isError ? (
          <LoadError message="Не удалось загрузить программы" onRetry={programs.refetch} />
        ) : programs.data?.length === 0 ? (
          <p className={styles.message}>
            {several
              ? 'Для выбранных стран нет общих программ.'
              : 'Для выбранной страны нет доступных программ.'}{' '}
            <Button variant="link" onClick={() => dispatch(goToDetails())}>
              {several ? 'Изменить страны' : 'Изменить страну'}
            </Button>
          </p>
        ) : (
          programs.data?.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              checked={program.id === selected?.id}
              onSelect={() => dispatch(selectProgram(program.id))}
            />
          ))
        )}
      </fieldset>

      <div className={styles.footer}>
        <Button variant="link" className={styles.compare} aria-disabled title="Скоро">
          Сравнить программы
        </Button>
        {order.isError && <LoadError message="Не удалось оформить полис" onRetry={handleOrder} />}
        {quote.isError && (
          <LoadError message="Не удалось рассчитать стоимость" onRetry={quote.refetch} />
        )}
        <Button
          wide
          disabled={!selected || price === undefined || order.isLoading}
          aria-busy={order.isLoading}
          onClick={handleOrder}
        >
          <span>{selected ? `Выбрать ${selected.name}` : 'Выбрать'}</span>
          {quote.isFetching ? (
            <Skeleton className={styles.priceSkeleton} />
          ) : (
            price !== undefined && <span>{formatPrice(price)}</span>
          )}
        </Button>
        <SaveNote />
      </div>
    </div>
  );
}
