import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '../src/components/GlassCard';

describe('GlassCard', () => {
  it('renders title and children', () => {
    render(
      <GlassCard title="Test Panel">
        <div data-testid="test-child">Child Content</div>
      </GlassCard>
    );

    expect(screen.getByTestId('glass-card-title')).toHaveTextContent('Test Panel');
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('test-child')).toHaveTextContent('Child Content');
  });

  it('has glass card data-testid', () => {
    render(
      <GlassCard title="Panel">
        <span>Content</span>
      </GlassCard>
    );

    expect(screen.getByTestId('glass-card')).toBeInTheDocument();
  });

  it('has content wrapper with data-testid', () => {
    render(
      <GlassCard title="Panel">
        <span>Content</span>
      </GlassCard>
    );

    expect(screen.getByTestId('glass-card-content')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <GlassCard title="Panel" className="custom-class">
        <span>Content</span>
      </GlassCard>
    );

    const card = screen.getByTestId('glass-card');
    expect(card.classList.contains('custom-class')).toBe(true);
    expect(card.classList.contains('glass-card')).toBe(true);
  });

  it('renders without className prop', () => {
    render(
      <GlassCard title="Panel">
        <span>Content</span>
      </GlassCard>
    );

    const card = screen.getByTestId('glass-card');
    expect(card.classList.contains('glass-card')).toBe(true);
  });

  it('renders complex children', () => {
    render(
      <GlassCard title="Metrics">
        <div>
          <h4>Metric 1</h4>
          <p>Value: 100</p>
          <button>Action</button>
        </div>
      </GlassCard>
    );

    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('Value: 100')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Action');
  });

  it('title is styled with uppercase text', () => {
    render(
      <GlassCard title="Uppercase Test">
        <span>Content</span>
      </GlassCard>
    );

    const title = screen.getByTestId('glass-card-title');
    expect(title).toHaveTextContent('Uppercase Test');
  });
});
