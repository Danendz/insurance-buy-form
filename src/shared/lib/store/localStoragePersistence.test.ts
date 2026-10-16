import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLocalStoragePersistence } from './localStoragePersistence';

const KEY = 'test:v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date(2024, 8, 5, 12).getTime();

const save = (state: unknown, savedAt = NOW) =>
  localStorage.setItem(KEY, JSON.stringify({ savedAt, state }));

const counter = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1;
    },
    hydrate: (_state, action: PayloadAction<{ value: number }>) => action.payload,
  },
});

const other = createSlice({
  name: 'other',
  initialState: { value: 0 },
  reducers: {
    bump(state) {
      state.value += 1;
    },
  },
});

function setup() {
  const persistence = createLocalStoragePersistence({ key: KEY, slice: counter, maxAgeDays: 30 });
  const store = configureStore({
    reducer: { counter: counter.reducer, other: other.reducer },
    middleware: (getDefault) => getDefault().prepend(persistence.middleware),
  });
  return { persistence, store };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createLocalStoragePersistence', () => {
  it('saves only its slice when it changes', () => {
    const { store } = setup();
    store.dispatch(other.actions.bump());
    expect(localStorage.getItem(KEY)).toBeNull();
    store.dispatch(counter.actions.increment());
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ savedAt: NOW, state: { value: 1 } });
  });

  it('restores saved state', () => {
    save({ value: 5 });
    const { persistence, store } = setup();
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 5 });
  });

  it('ignores missing or corrupted data', () => {
    const { persistence, store } = setup();
    persistence.restore(store.dispatch);
    localStorage.setItem(KEY, '{not json');
    persistence.restore(store.dispatch);
    localStorage.setItem(KEY, JSON.stringify({ value: 5 }));
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 0 });
  });

  it('drops data saved longer than maxAgeDays ago', () => {
    save({ value: 5 }, NOW - 30 * DAY_MS);
    const { persistence, store } = setup();
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 5 });

    save({ value: 7 }, NOW - 30 * DAY_MS - 1);
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 5 });
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
