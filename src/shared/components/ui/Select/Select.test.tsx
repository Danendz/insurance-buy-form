import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('is disabled and busy while loading', () => {
    render(<Select aria-label="Страна" loading placeholder="Загружаем…" value="" />);
    const select = screen.getByRole('combobox', { name: 'Страна' });
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute('aria-busy', 'true');
  });
});
