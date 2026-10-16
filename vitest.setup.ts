import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// `server-only` throws outside the react-server condition; tests import server modules directly.
vi.mock('server-only', () => ({}));

// Route handlers call `connection()`, which throws outside a Next.js request scope.
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  connection: () => Promise.resolve(),
}));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
});
