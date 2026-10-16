import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders as a non-submitting button by default', () => {
    render(<Button>Next</Button>);
    expect(screen.getByRole('button', { name: 'Next' })).toHaveAttribute('type', 'button');
  });
});
