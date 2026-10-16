import { screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubApi } from '@/app/api/_lib/testing';
import { renderWithStore } from '@/store/test-utils';
import { initialState } from '../../model/slice';
import type { InsuranceFormState } from '../../types';
import { InsuranceFormPage } from './InsuranceFormPage';

const filled: InsuranceFormState = {
  ...initialState,
  step: 'program',
  details: {
    countryIds: [1],
    coverageType: 'single',
    startDate: '2024-09-05',
    endDate: '2024-09-14',
    activityId: 0,
    phone: '+998901234567',
  },
};

beforeEach(() => {
  // Only `Date`: RTK Query and `findBy*` need real timers.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2024, 8, 5, 12));
  stubApi();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function pickDate(user: UserEvent, group: string, day: string, month: string) {
  const field = screen.getByRole('group', { name: group });
  await user.selectOptions(within(field).getByLabelText('День'), day);
  await user.selectOptions(within(field).getByLabelText('Месяц'), month);
  await user.selectOptions(within(field).getByLabelText('Год'), '2024');
}

async function fillDetails(user: UserEvent, country: string) {
  const option = await screen.findByRole('option', { name: country });
  await user.selectOptions(screen.getByLabelText('Страна путешествия'), option);
  await pickDate(user, 'Начало страхования', '05', 'Сентябрь');
  await pickDate(user, 'Конец страхования', '14', 'Сентябрь');
  await user.click(await screen.findByRole('radio', { name: 'Туризм' }));
  await user.type(screen.getByLabelText('Номер мобильного телефона'), '901234567');
}

describe('InsuranceFormPage', () => {
  it('shows the four trip purposes', async () => {
    renderWithStore(<InsuranceFormPage />);
    const purposes = within(await screen.findByRole('group', { name: 'Цель поездки' }));
    expect(
      (await purposes.findAllByRole('radio')).map((radio) => radio.closest('label')?.textContent),
    ).toEqual(['Туризм', 'Работа', 'Учёба', 'Спорт']);
  });

  it('shows the country field as loading until countries arrive', async () => {
    renderWithStore(<InsuranceFormPage />);
    const country = screen.getByLabelText('Страна путешествия');
    expect(country).toBeDisabled();
    expect(country).toHaveAttribute('aria-busy', 'true');
    await screen.findByRole('option', { name: 'Латвия' });
    expect(country).toBeEnabled();
    expect(country).not.toHaveAttribute('aria-busy');
  });

  it('starts a fresh form today, without a back button', async () => {
    renderWithStore(<InsuranceFormPage />);
    const start = within(screen.getByRole('group', { name: 'Начало страхования' }));
    expect(start.getByLabelText('День')).toHaveValue('5');
    expect(start.getByLabelText('Месяц')).toHaveValue('9');
    expect(start.getByLabelText('Год')).toHaveValue('2024');
    expect(screen.queryByRole('button', { name: 'Назад' })).not.toBeInTheDocument();
  });

  it('adds a country row, focuses it and offers only countries not chosen yet', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />);
    const add = screen.getByRole('button', { name: 'Добавить страну' });
    await screen.findByRole('option', { name: 'Латвия' });

    expect(add).toHaveAttribute('aria-disabled', 'true');
    await user.click(add);
    expect(screen.queryByLabelText('Страна путешествия 2')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Удалить страну/ })).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Страна путешествия'), 'Австралия');
    expect(add).toHaveAttribute('aria-disabled', 'false');
    await user.click(add);

    const second = screen.getByLabelText('Страна путешествия 2');
    await waitFor(() => expect(second).toHaveFocus());
    expect(screen.getByRole('button', { name: 'Добавить страну' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(within(second).queryByRole('option', { name: 'Австралия' })).not.toBeInTheDocument();

    await user.selectOptions(second, 'Япония');
    expect(
      within(screen.getByLabelText('Страна путешествия')).queryByRole('option', {
        name: 'Япония',
      }),
    ).not.toBeInTheDocument();
    expect(store.getState().insuranceForm.details.countryIds).toEqual([1, 238]);
  });

  it('adds no more than 5 countries', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />, {
      preloadedState: {
        insuranceForm: {
          ...filled,
          step: 'details',
          details: { ...filled.details, countryIds: [1, 2, 3, 4, 5] },
        },
      },
    });
    await screen.findAllByRole('option', { name: 'Латвия' });

    const add = screen.getByRole('button', { name: 'Добавить страну' });
    expect(add).toHaveAttribute('aria-disabled', 'true');
    await user.click(add);
    expect(store.getState().insuranceForm.details.countryIds).toHaveLength(5);
  });

  it('removes a country row and focuses a button, not a select', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />, {
      preloadedState: {
        insuranceForm: {
          ...filled,
          step: 'details',
          details: { ...filled.details, countryIds: [1, 238, 3] },
        },
      },
    });
    await screen.findAllByRole('option', { name: 'Латвия' });

    await user.click(screen.getByRole('button', { name: 'Удалить страну 2' }));
    expect(store.getState().insuranceForm.details.countryIds).toEqual([1, 3]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Удалить страну 2' })).toHaveFocus(),
    );

    await user.click(screen.getByRole('button', { name: 'Удалить страну 2' }));
    expect(store.getState().insuranceForm.details.countryIds).toEqual([1]);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Добавить страну' })).toHaveFocus(),
    );
    expect(screen.queryByRole('button', { name: /Удалить страну/ })).not.toBeInTheDocument();
  });

  it('flags an empty country row on «Далее»', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />);
    await fillDetails(user, 'Латвия');
    await user.click(screen.getByRole('button', { name: 'Добавить страну' }));

    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(await screen.findByText('Укажите страну путешествия')).toBeInTheDocument();
    const second = screen.getByLabelText('Страна путешествия 2');
    expect(second).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Страна путешествия')).not.toHaveAttribute('aria-invalid');
    await waitFor(() => expect(second).toHaveFocus());
    expect(store.getState().insuranceForm.step).toBe('details');
  });

  it('shows errors only after «Далее» and stays on the first step', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />);
    await screen.findByRole('option', { name: 'Латвия' });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(await screen.findByText('Укажите страну путешествия')).toBeInTheDocument();
    expect(screen.getByText('Укажите номер телефона')).toBeInTheDocument();
    expect(store.getState().insuranceForm.step).toBe('details');
  });

  it('rejects an incomplete phone number', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />);
    await fillDetails(user, 'Латвия');
    await user.type(screen.getByLabelText('Номер мобильного телефона'), '{backspace}');

    await user.click(screen.getByRole('button', { name: 'Далее' }));

    expect(await screen.findByText('Неверный номер телефона')).toBeInTheDocument();
    expect(store.getState().insuranceForm.step).toBe('details');
  });

  it('goes through both steps and places an order', async () => {
    const { user, store } = renderWithStore(<InsuranceFormPage />);
    await fillDetails(user, 'Австралия');
    expect(store.getState().insuranceForm.details.phone).toBe('+998901234567');

    await user.click(screen.getByRole('button', { name: 'Далее' }));

    const programs = within(await screen.findByRole('group', { name: 'Программа страхования' }));
    expect(await programs.findAllByRole('radio')).toHaveLength(2);
    expect(programs.getByRole('radio', { name: /Platinum/ })).toBeChecked();
    // 10 days × 3.5 EUR.
    expect(
      await screen.findByRole('button', { name: /Выбрать Platinum\s*EUR 35\.00/ }),
    ).toBeEnabled();

    await user.click(programs.getByRole('radio', { name: /Stopvirus I/ }));
    const order = await screen.findByRole('button', { name: /Выбрать STOPVIRUS \|\s*EUR 30\.00/ });
    await user.click(order);

    expect(await screen.findByText('Полис оформлен')).toBeInTheDocument();
    expect(store.getState().insuranceForm).toMatchObject({ step: 'done', programId: 4 });

    await user.click(screen.getByRole('button', { name: 'Оформить заново' }));
    expect(await screen.findByText('Покупка страхового полиса')).toBeInTheDocument();
    expect(store.getState().insuranceForm).toEqual({
      ...initialState,
      details: { ...initialState.details, startDate: '2024-09-05' },
    });
  });

  it('lists only the programs sold in every chosen country', async () => {
    renderWithStore(<InsuranceFormPage />, {
      preloadedState: {
        insuranceForm: { ...filled, details: { ...filled.details, countryIds: [1, 238] } },
      },
    });
    const programs = within(await screen.findByRole('group', { name: 'Программа страхования' }));
    await waitFor(() => expect(programs.getAllByRole('radio')).toHaveLength(1));
    expect(programs.getByRole('radio', { name: /Platinum/ })).toBeInTheDocument();

    const summary = within(screen.getByRole('complementary', { name: 'Ваши данные' }));
    expect(await summary.findByText('Австралия, Япония')).toBeInTheDocument();
    expect(summary.getByText('Страны путешествия')).toBeInTheDocument();
  });

  it('restores the program step with the «Ваши данные» summary', async () => {
    const { user } = renderWithStore(<InsuranceFormPage />, {
      preloadedState: { insuranceForm: filled },
    });

    expect(screen.getByRole('button', { name: 'Назад' })).toBeInTheDocument();
    const summary = within(screen.getByRole('complementary', { name: 'Ваши данные' }));
    expect(await summary.findByText('Австралия')).toBeInTheDocument();
    expect(summary.getByText('05/09/2024')).toBeInTheDocument();
    expect(await summary.findByText('Туризм')).toBeInTheDocument();

    await user.click(summary.getByRole('button', { name: 'Изменить: Цель' }));
    expect(await screen.findByText('Покупка страхового полиса')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Туризм' })).toBeChecked();
  });

  it('asks to recheck details restored after they became invalid', async () => {
    renderWithStore(<InsuranceFormPage />, {
      preloadedState: {
        insuranceForm: { ...filled, details: { ...filled.details, startDate: '2024-09-01' } },
      },
    });
    expect(screen.getByText(/Данные поездки устарели/)).toBeInTheDocument();
  });

  it('reports a failed order', async () => {
    stubApi((request) =>
      request.url.endsWith('/orders') ? new Response(null, { status: 500 }) : undefined,
    );
    const { user } = renderWithStore(<InsuranceFormPage />, {
      preloadedState: { insuranceForm: filled },
    });

    const button = await screen.findByRole('button', { name: /Выбрать Platinum/ });
    await waitFor(() => expect(button).toBeEnabled());
    await user.click(button);

    expect(await screen.findByText('Не удалось оформить полис')).toBeInTheDocument();
  });
});
