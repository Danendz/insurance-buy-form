import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { createSessionPersistence } from './sessionPersistence';

const KEY = 'test:v1';

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
  const persistence = createSessionPersistence({ key: KEY, slice: counter });
  const store = configureStore({
    reducer: { counter: counter.reducer, other: other.reducer },
    middleware: (getDefault) => getDefault().prepend(persistence.middleware),
  });
  return { persistence, store };
}

describe('createSessionPersistence', () => {
  it('saves only its slice when it changes', () => {
    const { store } = setup();
    store.dispatch(other.actions.bump());
    expect(sessionStorage.getItem(KEY)).toBeNull();
    store.dispatch(counter.actions.increment());
    expect(JSON.parse(sessionStorage.getItem(KEY)!)).toEqual({ value: 1 });
  });

  it('restores saved state', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ value: 5 }));
    const { persistence, store } = setup();
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 5 });
  });

  it('ignores missing or corrupted data', () => {
    const { persistence, store } = setup();
    persistence.restore(store.dispatch);
    sessionStorage.setItem(KEY, '{not json');
    persistence.restore(store.dispatch);
    expect(store.getState().counter).toEqual({ value: 0 });
  });
});
