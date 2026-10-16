import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithStore } from '@/shared/test-utils';
import { InsuranceForm } from './InsuranceForm';

describe('InsuranceForm', () => {
  it('navigates between steps', async () => {
    const { user } = renderWithStore(<InsuranceForm />);

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('renders from preloaded state', () => {
    renderWithStore(<InsuranceForm />, { preloadedState: { insuranceForm: { currentStep: 2 } } });

    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
