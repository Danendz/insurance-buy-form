import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { IsoDate } from '@/shared/types/date';
import { DateField } from './DateField';

function Controlled(props: {
  min: IsoDate;
  max?: IsoDate;
  onChange: (value: IsoDate | null) => void;
}) {
  const [value, setValue] = useState<IsoDate | null>(null);
  return (
    <DateField
      id="date"
      value={value}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
      years={[2024, 2025]}
      min={props.min}
      max={props.max}
    />
  );
}

function setup(range: { min: IsoDate; max?: IsoDate }) {
  const onChange = vi.fn();
  render(<Controlled {...range} onChange={onChange} />);
  return {
    user: userEvent.setup(),
    onChange,
    day: screen.getByLabelText<HTMLSelectElement>('День'),
    month: screen.getByLabelText<HTMLSelectElement>('Месяц'),
    year: screen.getByLabelText<HTMLSelectElement>('Год'),
  };
}

const option = (select: HTMLSelectElement, value: string) =>
  select.querySelector<HTMLOptionElement>(`option[value="${value}"]`)!;

describe('DateField', () => {
  it('disables months and days before min', async () => {
    const { user, day, month, year } = setup({ min: '2024-09-05' });
    expect(option(month, '1')).toBeEnabled();

    await user.selectOptions(year, '2024');
    expect(option(month, '8')).toBeDisabled();
    expect(option(month, '9')).toBeEnabled();

    await user.selectOptions(month, '9');
    expect(option(day, '4')).toBeDisabled();
    expect(option(day, '5')).toBeEnabled();
  });

  it('clears parts that stop fitting the range', async () => {
    const { user, day, month, year, onChange } = setup({ min: '2024-09-05' });
    await user.selectOptions(year, '2025');
    await user.selectOptions(month, '9');
    await user.selectOptions(day, '1');
    expect(onChange).toHaveBeenLastCalledWith('2025-09-01');

    await user.selectOptions(year, '2024');
    expect(day).toHaveValue('');
    expect(month).toHaveValue('9');
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('disables dates after max', async () => {
    const { user, day, month, year } = setup({ min: '2024-09-06', max: '2025-09-05' });
    await user.selectOptions(year, '2025');
    expect(option(month, '10')).toBeDisabled();
    await user.selectOptions(month, '9');
    expect(option(day, '5')).toBeEnabled();
    expect(option(day, '6')).toBeDisabled();
  });
});
