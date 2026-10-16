import { diffInDays } from '@/shared/utils/date';
import { isValidPhone } from '@/shared/utils/phone';
import type { DetailsErrors, IsoDate, TripDetails } from '../../types';

export const MAX_TRIP_DAYS = 365;
export const MAX_COUNTRIES = 5;

/** Everything but the phone, which a quote doesn't need. */
export function validateTrip(
  details: Omit<TripDetails, 'phone' | 'phoneCountry'>,
  today: IsoDate,
): DetailsErrors {
  const errors: DetailsErrors = {};
  const { countryIds, startDate, endDate, activityId } = details;

  if (countryIds.length === 0 || countryIds.includes(null)) {
    errors.countryIds = 'Укажите страну путешествия';
  } else if (new Set(countryIds).size !== countryIds.length) {
    errors.countryIds = 'Страны не должны повторяться';
  } else if (countryIds.length > MAX_COUNTRIES) {
    errors.countryIds = `Не больше ${MAX_COUNTRIES} стран`;
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

  return errors;
}

/** Shared by the form and `/api`, so both reject the same input. */
export function validateDetails(details: TripDetails, today: IsoDate): DetailsErrors {
  const errors = validateTrip(details, today);
  const { phone, phoneCountry } = details;

  if (!phone) {
    errors.phone = 'Укажите номер телефона';
  } else if (!isValidPhone(phone, phoneCountry)) {
    errors.phone = 'Неверный номер телефона';
  }

  return errors;
}

export const hasErrors = (errors: DetailsErrors) => Object.keys(errors).length > 0;
