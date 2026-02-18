import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconDemo } from '../src/components/IconDemo';

describe('IconDemo', () => {
  it('renders the component', () => {
    render(<IconDemo />);
    expect(screen.getByTestId('icon-demo')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<IconDemo />);
    expect(screen.getByText('AgentViz Dashboard')).toBeInTheDocument();
  });

  it('renders all icons', () => {
    render(<IconDemo />);
    expect(screen.getByTestId('icon-activity')).toBeInTheDocument();
    expect(screen.getByTestId('icon-wifi')).toBeInTheDocument();
    expect(screen.getByTestId('icon-wifi-off')).toBeInTheDocument();
    expect(screen.getByTestId('icon-users')).toBeInTheDocument();
    expect(screen.getByTestId('icon-cpu')).toBeInTheDocument();
  });

  it('renders all icon labels', () => {
    render(<IconDemo />);
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Models')).toBeInTheDocument();
  });
});
