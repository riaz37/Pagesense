import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';

describe('Select', () => {
  it('renders trigger with aria-label and default value', () => {
    render(
      <Select defaultValue="invoice">
        <SelectTrigger aria-label="Doc type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="invoice">Invoice</SelectItem>
          <SelectItem value="contract">Contract</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Doc type' });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent(/invoice/i);
  });

  it('disabled trigger surfaces aria-disabled', () => {
    render(
      <Select disabled>
        <SelectTrigger aria-label="x">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole('combobox', { name: 'x' })).toBeDisabled();
  });
});
