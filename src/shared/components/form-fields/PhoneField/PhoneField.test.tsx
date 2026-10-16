import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PhoneField, type PhoneValue } from './PhoneField';

function ControlledPhoneField({
  initial = { phone: '', country: 'UZ' },
  onChange,
}: {
  initial?: PhoneValue;
  onChange?: (value: PhoneValue) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <PhoneField
      id="phone"
      {...value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const setup = (props: Parameters<typeof ControlledPhoneField>[0] = {}) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<ControlledPhoneField onChange={onChange} {...props} />);
  return { user, onChange, input: screen.getByRole<HTMLInputElement>('textbox') };
};

describe('PhoneField', () => {
  it('formats typed digits with the country mask and reports E.164', async () => {
    const { user, onChange, input } = setup();
    await user.type(input, '90a1234567');

    expect(input).toHaveValue('90 123 45 67');
    expect(onChange).toHaveBeenLastCalledWith({ phone: '+998901234567', country: 'UZ' });
  });

  it('reports an empty phone once every digit is deleted', async () => {
    const { user, onChange, input } = setup();
    await user.type(input, '9{backspace}');
    expect(onChange).toHaveBeenLastCalledWith({ phone: '', country: 'UZ' });
  });

  it('keeps the caret after the edited digit', async () => {
    const { user, input } = setup({ initial: { phone: '+998901234567', country: 'UZ' } });
    input.focus();
    // After `90 1`.
    input.setSelectionRange(4, 4);
    await user.keyboard('{backspace}');

    expect(input).toHaveValue('90 234 56 7');
    expect(input.selectionStart).toBe(3);
  });

  it('deletes the digit before a separator on backspace', async () => {
    const { user, input } = setup({ initial: { phone: '+998901234567', country: 'UZ' } });
    input.focus();
    // After `90 `.
    input.setSelectionRange(3, 3);
    await user.keyboard('{backspace}');

    expect(input).toHaveValue('91 234 56 7');
    expect(input.selectionStart).toBe(1);
  });

  it('switches the country when an international number is pasted', async () => {
    const { user, onChange, input } = setup();
    await user.click(input);
    await user.paste('+7 912 345-67-89');

    expect(onChange).toHaveBeenLastCalledWith({ phone: '+79123456789', country: 'RU' });
    expect(input).toHaveValue('912 345 67 89');
    expect(screen.getByRole('combobox', { name: 'Код страны' })).toHaveValue('RU');
  });

  it('keeps the digits when the country changes', async () => {
    const { user, onChange, input } = setup({ initial: { phone: '', country: 'RU' } });
    await user.type(input, '7011234567');
    await user.selectOptions(screen.getByRole('combobox'), 'KZ');

    expect(onChange).toHaveBeenLastCalledWith({ phone: '+77011234567', country: 'KZ' });
    expect(input).toHaveValue('701 123 4567');
    expect(input).toHaveFocus();
  });
});
