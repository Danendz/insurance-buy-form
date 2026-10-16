import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

const tap = (user: ReturnType<typeof userEvent.setup>, target: Element) =>
  user.pointer([{ keys: '[TouchA]', target }]);

describe('Tooltip', () => {
  it('opens on a tap and closes on the next one', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await tap(user, trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await tap(user, trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on a tap elsewhere', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip text="Hint" />
        <p>Outside</p>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await tap(user, trigger);
    await tap(user, screen.getByText('Outside'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on hover and closes when the mouse leaves', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await user.hover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.unhover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await user.tab();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
