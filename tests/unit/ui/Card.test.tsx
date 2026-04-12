import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

describe('Card', () => {
  it('renders header + body with whisper border', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <h2>Title</h2>
        </CardHeader>
        <CardBody>Body copy</CardBody>
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.className).toMatch(/border-black\/10/);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Body copy')).toBeInTheDocument();
  });

  it('forwards className', () => {
    render(<Card className="extra-cls" data-testid="c" />);
    expect(screen.getByTestId('c').className).toMatch(/extra-cls/);
  });
});
