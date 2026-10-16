import { hasErrors, validateDetails } from '@/features/insurance-form/server';
import { isValidPhone } from '@/shared/components/form-fields/PhoneField/phone';
import { todayIsoDate } from '@/shared/utils/date';
import { getCountryPrograms } from '../_lib/catalog';
import { badRequest, parseTripDetails, readJson, simulateNetwork } from '../_lib/http';

export async function POST(request: Request) {
  await simulateNetwork();
  const body = await readJson(request);
  const details = parseTripDetails(body);
  if (!details) return badRequest({ message: 'Invalid JSON body' });

  const errors = validateDetails(details, todayIsoDate(), {
    phoneValid: isValidPhone(details.phone),
  });
  if (hasErrors(errors)) return badRequest({ errors });

  const programId = (body as { programId?: unknown }).programId;
  const programs = getCountryPrograms(details.countryId!) ?? [];
  if (!programs.some((program) => program.id === programId)) {
    return badRequest({ errors: { programId: 'Программа недоступна для этой страны' } });
  }

  return Response.json({ orderId: crypto.randomUUID() }, { status: 201 });
}
