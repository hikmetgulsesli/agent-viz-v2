import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentCard } from '../src/components/AgentCard';
import type { Agent } from '../src/types/agent';

const mockRunningAgent: Agent = {
  id: 'agent-1',
  name: 'Code Review Agent',
  status: 'running',
  currentModel: 'gpt-4o',
  tools: [
    { name: 'read_file', args: { path: 'src/index.ts' }, startedAt: Date.now() },
    { name: 'edit_file', args: { path: 'src/index.ts' }, startedAt: Date.now() },
  ],
  tokensUsed: { input: 1500, output: 800, total: 2300 },
  startedAt: Date.now(),
};

const mockIdleAgent: Agent = {
  id: 'agent-2',
  name: 'Test Runner',
  status: 'idle',
  currentModel: 'gpt-4o-mini',
  tools: [],
  tokensUsed: { input: 500, output: 200, total: 700 },
  startedAt: Date.now() - 3600000,
};

const mockErrorAgent: Agent = {
  id: 'agent-3',
  name: 'Deploy Agent',
  status: 'error',
  currentModel: 'claude-3-5-sonnet',
  tools: [{ name: 'exec', args: { command: 'npm run deploy' }, startedAt: Date.now() }],
  tokensUsed: { input: 100, output: 50, total: 150 },
  startedAt: Date.now() - 60000,
};

describe('AgentCard', () => {
  it('renders the component', () => {
    render(<AgentCard agent={mockRunningAgent} />);
    expect(screen.getByTestId('agent-card')).toBeInTheDocument();
  });

  it('displays agent name', () => {
    render(<AgentCard agent={mockRunningAgent} />);
    expect(screen.getByTestId('agent-name')).toHaveTextContent('Code Review Agent');
  });

  it('displays current model', () => {
    render(<AgentCard agent={mockRunningAgent} />);
    expect(screen.getByTestId('agent-model')).toHaveTextContent('gpt-4o');
  });

  it('displays status badge', () => {
    render(<AgentCard agent={mockRunningAgent} />);
    expect(screen.getByTestId('agent-status-badge')).toBeInTheDocument();
  });

  describe('Status indicators', () => {
    it('shows "Running" label for running agents', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      expect(screen.getByTestId('status-label')).toHaveTextContent('Running');
    });

    it('shows "Idle" label for idle agents', () => {
      render(<AgentCard agent={mockIdleAgent} />);
      expect(screen.getByTestId('status-label')).toHaveTextContent('Idle');
    });

    it('shows "Error" label for error agents', () => {
      render(<AgentCard agent={mockErrorAgent} />);
      expect(screen.getByTestId('status-label')).toHaveTextContent('Error');
    });

    it('has running status class for running agents', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator.className).toContain('agent-card__status-indicator--running');
    });

    it('has idle status class for idle agents', () => {
      render(<AgentCard agent={mockIdleAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator.className).toContain('agent-card__status-indicator--idle');
    });

    it('has error status class for error agents', () => {
      render(<AgentCard agent={mockErrorAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator.className).toContain('agent-card__status-indicator--error');
    });
  });

  describe('Status colors', () => {
    it('uses green color (#4ade80) for running status', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#4ade80' });
    });

    it('uses gray color (#a1a1aa) for idle status', () => {
      render(<AgentCard agent={mockIdleAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#a1a1aa' });
    });

    it('uses red color (#f87171) for error status', () => {
      render(<AgentCard agent={mockErrorAgent} />);
      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#f87171' });
    });
  });

  describe('Statistics display', () => {
    it('displays token count with proper formatting', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      expect(screen.getByTestId('token-count')).toHaveTextContent('2,300 tokens');
    });

    it('displays tool count', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      expect(screen.getByTestId('tool-count')).toHaveTextContent('2 tools');
    });

    it('displays zero tools correctly', () => {
      render(<AgentCard agent={mockIdleAgent} />);
      expect(screen.getByTestId('tool-count')).toHaveTextContent('0 tools');
    });
  });

  describe('Lucide icons', () => {
    it('renders User icon for agent avatar', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const userIcon = document.querySelector('[aria-label="Agent"]');
      expect(userIcon).toBeInTheDocument();
    });

    it('renders Activity icon for running status', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const activityIcon = document.querySelector('[aria-label="Running"]');
      expect(activityIcon).toBeInTheDocument();
    });

    it('renders User icon for idle status', () => {
      render(<AgentCard agent={mockIdleAgent} />);
      const userIcon = document.querySelector('[aria-label="Idle"]');
      expect(userIcon).toBeInTheDocument();
    });

    it('renders AlertCircle icon for error status', () => {
      render(<AgentCard agent={mockErrorAgent} />);
      const alertIcon = document.querySelector('[aria-label="Error"]');
      expect(alertIcon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on status icons', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const statusIcon = document.querySelector('[aria-label="Running"]');
      expect(statusIcon).toBeInTheDocument();
    });

    it('has aria-label on agent avatar icon', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const avatarIcon = document.querySelector('[aria-label="Agent"]');
      expect(avatarIcon).toBeInTheDocument();
    });
  });

  describe('Touch targets', () => {
    it('status badge element exists for touch target verification', () => {
      render(<AgentCard agent={mockRunningAgent} />);
      const badge = screen.getByTestId('agent-status-badge');
      expect(badge).toBeInTheDocument();
      // CSS enforces min-height: 44px via agent-card__status-badge class
      expect(badge.className).toContain('agent-card__status-badge');
    });
  });
});
