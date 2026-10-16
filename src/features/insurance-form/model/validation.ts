import { diffInDays } from '@/shared/utils/date';
import type { DetailsErrors, IsoDate, TripDetails } from '../types';

export const MAX_TRIP_DAYS = 365;

type ValidationOptions = {
  /** `false` adds a phone format error; `null` checks only that the phone is filled in. */
  phoneValid?: boolean | null;
};

/** Shared by the form and `/api`, so both reject the same input. */
export function validateDetails(
  details: TripDetails,
  today: IsoDate,
  { phoneValid = null }: ValidationOptions = {},
): DetailsErrors {
  const errors: DetailsErrors = {};
  const { countryId, startDate, endDate, activityId, phone } = details;

  if (countryId === null) {
    errors.countryId = 'Укажите страну путешествия';
  }

  if (!startDate) {
    errors.startDate = 'Укажите дату начала';
  } else if (diffInDays(today, startDate) < 0) {
    errors.startDate = 'Дата начала не может быть в прошлом';
  }

  if (!endDate) {
    errors.endDate = 'Укажите дату окончания';
  } else if (startDate) {
    const days = diffInDays(startDate, endDate);
    if (days <= 0) {
      errors.endDate = 'Дата окончания должна быть позже даты начала';
    } else if (days > MAX_TRIP_DAYS) {
      errors.endDate = `Срок страхования не может превышать ${MAX_TRIP_DAYS} дней`;
    }
  }

  if (activityId === null) {
    errors.activityId = 'Выберите цель поездки';
  }

  if (!phone) {
    errors.phone = 'Укажите номер телефона';
  } else if (phoneValid === false) {
    errors.phone = 'Неверный номер телефона';
  }

  return errors;
}

export const hasErrors = (errors: DetailsErrors) => Object.keys(errors).length > 0;
