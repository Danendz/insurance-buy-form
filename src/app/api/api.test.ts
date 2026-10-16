import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getActivities } from './dictionary/activities/route';
import { GET as getCountryPrograms } from './countries/[id]/programs/route';
import { GET as getCountries } from './dictionary/countries/route';
import { GET as getMultipliers } from './dictionary/multipliers/route';
import { POST as createOrder } from './orders/route';
import { GET as getPrograms } from './dictionary/programs/route';
import { POST as getQuote } from './quote/route';

const post = (body: unknown) =>
  new Request('http://localhost/api', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const order = {
  countryId: 1,
  coverageType: 'single',
  startDate: '2024-09-05',
  endDate: '2024-09-14',
  activityId: 0,
  phone: '+998901234567',
  programId: 3,
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2024, 8, 5, 12));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('/api', () => {
  it('GET /dictionary/countries', async () => {
    const res = await getCountries();
    expect(res.status).toBe(200);
    expect((await res.json())[0]).toEqual({ id: 1, name: 'АВСТРАЛИЯ', isInSchengen: false });
  });

  it('GET /dictionary/activities', async () => {
    expect(await (await getActivities()).json()).toHaveLength(4);
  });

  it('GET /dictionary/programs', async () => {
    expect(await (await getPrograms()).json()).toHaveLength(5);
  });

  it('GET /dictionary/multipliers', async () => {
    expect(await (await getMultipliers()).json()).toEqual({ multiTrip: 1.5, sport: 1.3 });
  });

  it('GET /countries/[id]/programs', async () => {
    const res = await getCountryPrograms(new Request('http://localhost'), params('238'));
    expect((await res.json()).map((p: { name: string }) => p.name)).toEqual(['Platinum']);

    expect((await getCountryPrograms(new Request('http://localhost'), params('-1'))).status).toBe(
      404,
    );
    expect((await getCountryPrograms(new Request('http://localhost'), params('abc'))).status).toBe(
      404,
    );
  });

  it('POST /quote', async () => {
    const request = {
      countryId: order.countryId,
      coverageType: order.coverageType,
      startDate: order.startDate,
      endDate: order.endDate,
      activityId: order.activityId,
    };
    const res = await getQuote(post(request));
    expect(await res.json()).toEqual({ 3: 35, 4: 30 });

    expect((await getQuote(post({ ...request, endDate: '2024-09-01' }))).status).toBe(400);
    expect((await getQuote(post('{broken'))).status).toBe(400);
  });

  it('POST /orders', async () => {
    const res = await createOrder(post(order));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ orderId: expect.any(String) });
  });

  it('POST /orders rejects invalid details and programs not sold in the country', async () => {
    const invalid = await createOrder(post({ ...order, phone: '123' }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ errors: { phone: expect.any(String) } });

    expect((await createOrder(post({ ...order, programId: 1 }))).status).toBe(400);
  });
});
