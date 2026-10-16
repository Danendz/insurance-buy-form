import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

const tap = (user: ReturnType<typeof userEvent.setup>, target: Element) =>
  user.pointer([{ keys: '[TouchA]', target }]);

const expectOpen = (open: boolean) =>
  expect(screen.getByRole('tooltip', { hidden: true })).toHaveAttribute('data-open', String(open));

describe('Tooltip', () => {
  it('opens on a tap and closes on the next one', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await tap(user, trigger);
    expectOpen(true);

    await tap(user, trigger);
    expectOpen(false);
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
    expectOpen(false);
  });

  it('opens on hover and closes when the mouse leaves', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);
    const trigger = screen.getByRole('button', { name: 'Подсказка' });

    await user.hover(trigger);
    expectOpen(true);
    await user.unhover(trigger);
    expectOpen(false);
  });

  it('toggles from the keyboard', async () => {
    const user = userEvent.setup();
    render(<Tooltip text="Hint" />);

    await user.tab();
    expectOpen(true);
    await user.keyboard('{Escape}');
    expectOpen(false);
  });
});
