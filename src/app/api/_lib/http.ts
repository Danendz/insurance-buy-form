import 'server-only';
import { connection } from 'next/server';
import type { CoverageType, TripDetails } from '@/features/insurance-form/server';
import { delay } from '@/shared/utils/delay';

export const API_DELAY_MS = Number(process.env.API_DELAY_MS ?? 800);

/** `connection()` keeps handlers out of prerendering under `cacheComponents`. */
export async function simulateNetwork(): Promise<void> {
  await connection();
  await delay(API_DELAY_MS);
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export const badRequest = (body: object) => Response.json(body, { status: 400 });

export const notFound = () => Response.json({ message: 'Not found' }, { status: 404 });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asNumber = (value: unknown) => (typeof value === 'number' ? value : null);
const asString = (value: unknown) => (typeof value === 'string' ? value : null);
const asNumbers = (value: unknown) => (Array.isArray(value) ? value.map(asNumber) : []);

/** Reads trip details from an untrusted body; wrong types become empty fields for the validator. */
export function parseTripDetails(body: unknown): TripDetails | undefined {
  if (!isRecord(body)) return undefined;
  return {
    countryIds: asNumbers(body.countryIds),
    coverageType: (body.coverageType === 'multi' ? 'multi' : 'single') satisfies CoverageType,
    startDate: asString(body.startDate),
    endDate: asString(body.endDate),
    activityId: asNumber(body.activityId),
    phone: asString(body.phone) ?? '',
  };
}
