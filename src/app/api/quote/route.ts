import { hasErrors, validateDetails } from '@/features/insurance-form/server';
import { todayIsoDate } from '@/shared/utils/date';
import { calculateQuote } from '../_lib/catalog';
import { badRequest, parseTripDetails, readJson, simulateNetwork } from '../_lib/http';

export async function POST(request: Request) {
  await simulateNetwork();
  const details = parseTripDetails(await readJson(request));
  if (!details) return badRequest({ message: 'Invalid JSON body' });

  const errors = validateDetails(details, todayIsoDate());
  delete errors.phone;
  if (hasErrors(errors)) return badRequest({ errors });

  const quote = calculateQuote({
    countryId: details.countryId!,
    coverageType: details.coverageType,
    startDate: details.startDate!,
    endDate: details.endDate!,
    activityId: details.activityId!,
  });
  return quote ? Response.json(quote) : badRequest({ errors: { countryId: 'Неизвестная страна' } });
}
