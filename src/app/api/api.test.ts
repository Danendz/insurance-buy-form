import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as getActivities } from './dictionary/activities/route';
import { GET as getCountries } from './dictionary/countries/route';
import { GET as getMultipliers } from './dictionary/multipliers/route';
import { POST as createOrder } from './orders/route';
import { GET as getPrograms } from './dictionary/programs/route';
import { GET as getTripPrograms } from './programs/route';
import { POST as getQuote } from './quote/route';

const post = (body: unknown) =>
  new Request('http://localhost/api', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const tripPrograms = (query: string) =>
  getTripPrograms(new Request(`http://localhost/api/programs${query}`));

const order = {
  countryIds: [1],
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
    expect((await res.json())[0]).toEqual({ id: 1, name: 'Австралия', isInSchengen: false });
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

  it('GET /programs', async () => {
    const res = await tripPrograms('?countryIds=1,238');
    expect((await res.json()).map((p: { name: string }) => p.name)).toEqual(['Platinum']);

    expect((await tripPrograms('?countryIds=1,-1')).status).toBe(404);
    expect((await tripPrograms('?countryIds=1,abc')).status).toBe(400);
    expect((await tripPrograms('?countryIds=')).status).toBe(400);
    expect((await tripPrograms('')).status).toBe(400);
  });

  it('POST /quote', async () => {
    const request = {
      countryIds: order.countryIds,
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

  it('POST /orders rejects invalid details and programs not sold in every country', async () => {
    const invalid = await createOrder(post({ ...order, phone: '123' }));
    expect(invalid.status).toBe(400);
    expect(await invalid.json()).toMatchObject({ errors: { phone: expect.any(String) } });

    expect((await createOrder(post({ ...order, programId: 1 }))).status).toBe(400);
    expect((await createOrder(post({ ...order, countryIds: [1, 238], programId: 4 }))).status).toBe(
      400,
    );
    expect((await createOrder(post({ ...order, countryIds: [1, 1] }))).status).toBe(400);
    expect((await createOrder(post({ ...order, countryIds: [1, 2, 3, 4, 5, 6] }))).status).toBe(
      400,
    );
  });
});
