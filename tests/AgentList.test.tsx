import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AgentList } from '../src/components/AgentList';
import type { Agent } from '../src/types/agent';

describe('AgentList', () => {
  const createAgent = (
    id: string,
    name: string,
    status: Agent['status'],
    overrides?: Partial<Agent>
  ): Agent => ({
    id,
    name,
    status,
    currentModel: 'gpt-4',
    tools: [],
    tokensUsed: { input: 100, output: 50, total: 150 },
    startedAt: Date.now(),
    ...overrides,
  });

  it('renders AgentCard for each agent in activities map', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createAgent('agent-1', 'Agent One', 'running')],
      ['agent-2', createAgent('agent-2', 'Agent Two', 'idle')],
      ['agent-3', createAgent('agent-3', 'Agent Three', 'error')],
    ]);

    render(<AgentList activities={activities} />);

    const agentCards = screen.getAllByTestId('agent-card');
    expect(agentCards).toHaveLength(3);

    expect(screen.getByText('Agent One')).toBeInTheDocument();
    expect(screen.getByText('Agent Two')).toBeInTheDocument();
    expect(screen.getByText('Agent Three')).toBeInTheDocument();
  });

  it('shows empty state when no agents', () => {
    const activities = new Map<string, Agent>();

    render(<AgentList activities={activities} />);

    expect(screen.getByTestId('agent-list-empty')).toBeInTheDocument();
    expect(screen.getByText('No active agents')).toBeInTheDocument();
    expect(screen.queryByTestId('agent-list-grid')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('agent-card')).toHaveLength(0);
  });

  it('sorts agents by status (running first, then idle, then error)', () => {
    const activities = new Map<string, Agent>([
      ['agent-error', createAgent('agent-error', 'Z Error Agent', 'error')],
      ['agent-idle', createAgent('agent-idle', 'A Idle Agent', 'idle')],
      ['agent-running', createAgent('agent-running', 'M Running Agent', 'running')],
    ]);

    render(<AgentList activities={activities} />);

    const agentNames = screen.getAllByTestId('agent-name');
    const names = agentNames.map((el) => el.textContent);

    // Should be sorted: running first, then idle, then error
    expect(names).toEqual(['M Running Agent', 'A Idle Agent', 'Z Error Agent']);
  });

  it('sorts agents by name when status is the same', () => {
    const activities = new Map<string, Agent>([
      ['agent-c', createAgent('agent-c', 'Charlie', 'running')],
      ['agent-a', createAgent('agent-a', 'Alpha', 'running')],
      ['agent-b', createAgent('agent-b', 'Bravo', 'running')],
    ]);

    render(<AgentList activities={activities} />);

    const agentNames = screen.getAllByTestId('agent-name');
    const names = agentNames.map((el) => el.textContent);

    // Should be sorted alphabetically within same status
    expect(names).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('applies responsive grid class', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createAgent('agent-1', 'Agent One', 'running')],
    ]);

    render(<AgentList activities={activities} />);

    expect(screen.getByTestId('agent-list-grid')).toBeInTheDocument();
  });

  it('handles mixed status sorting correctly', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createAgent('agent-1', 'Zulu', 'error')],
      ['agent-2', createAgent('agent-2', 'Alpha', 'error')],
      ['agent-3', createAgent('agent-3', 'Yankee', 'idle')],
      ['agent-4', createAgent('agent-4', 'Bravo', 'idle')],
      ['agent-5', createAgent('agent-5', 'X-ray', 'running')],
      ['agent-6', createAgent('agent-6', 'Charlie', 'running')],
    ]);

    render(<AgentList activities={activities} />);

    const agentNames = screen.getAllByTestId('agent-name');
    const names = agentNames.map((el) => el.textContent);

    // Running first (alphabetically), then idle (alphabetically), then error (alphabetically)
    expect(names).toEqual(['Charlie', 'X-ray', 'Bravo', 'Yankee', 'Alpha', 'Zulu']);
  });
});
