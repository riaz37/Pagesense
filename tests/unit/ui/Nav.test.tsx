import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Nav } from '@/components/ui/Nav';
import { Sidebar } from '@/components/ui/Sidebar';
import { TopBar } from '@/components/ui/TopBar';

describe('Nav', () => {
  it('marks active item with aria-current=page', () => {
    render(
      <Nav
        items={[
          { label: 'Chat', href: '/chat', active: true },
          { label: 'Docs', href: '/documents' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Chat' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('aria-current');
  });
});

describe('Sidebar', () => {
  it('renders landmark and items with aria-current on active', () => {
    render(
      <Sidebar
        items={[
          { label: 'A', href: '/a', active: true },
          { label: 'B', href: '/b' },
        ]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders brand + footer slots', () => {
    render(
      <Sidebar
        brand={<span data-testid="brand">ESAP</span>}
        items={[{ label: 'X', href: '/x' }]}
        footer={<span data-testid="footer">f</span>}
      />,
    );
    expect(screen.getByTestId('brand')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});

describe('TopBar', () => {
  it('renders breadcrumb and actions', () => {
    render(
      <TopBar
        breadcrumb={<span>Workspace / Chat</span>}
        actions={<button type="button">action</button>}
      />,
    );
    expect(screen.getByText('Workspace / Chat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'action' })).toBeInTheDocument();
  });
});
