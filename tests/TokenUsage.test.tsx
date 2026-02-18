import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TokenUsage } from '../src/components/TokenUsage';
import type { Agent } from '../src/types/agent';

function createMockAgent(
  id: string,
  name: string,
  totalTokens: number
): Agent {
  return {
    id,
    name,
    status: 'running',
    currentModel: 'gpt-4',
    tools: [],
    tokensUsed: {
      input: Math.floor(totalTokens * 0.7),
      output: Math.floor(totalTokens * 0.3),
      total: totalTokens,
    },
    startedAt: Date.now(),
  };
}

describe('TokenUsage', () => {
  it('shows empty state when no agents', () => {
    const activities = new Map<string, Agent>();
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByTestId('token-usage')).toBeInTheDocument();
    expect(screen.getByTestId('token-usage-empty')).toBeInTheDocument();
    expect(screen.getByText('No token usage data available')).toBeInTheDocument();
  });

  it('shows empty state when agents have zero tokens', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Test Agent', 0)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByTestId('token-usage-empty')).toBeInTheDocument();
  });

  it('shows horizontal bar for each agent', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Agent One', 1000)],
      ['agent-2', createMockAgent('agent-2', 'Agent Two', 500)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    const barRows = screen.getAllByTestId('token-usage-bar-row');
    expect(barRows).toHaveLength(2);
  });

  it('displays agent names', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Alpha Agent', 1000)],
      ['agent-2', createMockAgent('agent-2', 'Beta Agent', 500)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByText('Alpha Agent')).toBeInTheDocument();
    expect(screen.getByText('Beta Agent')).toBeInTheDocument();
  });

  it('displays numeric token count next to each bar', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Agent One', 1234)],
      ['agent-2', createMockAgent('agent-2', 'Agent Two', 5678)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    const tokenCounts = screen.getAllByTestId('token-count');
    expect(tokenCounts).toHaveLength(2);
    expect(tokenCounts[0]).toHaveTextContent('1,234');
    expect(tokenCounts[1]).toHaveTextContent('5,678');
  });

  it('shows total token count at bottom', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Agent One', 1000)],
      ['agent-2', createMockAgent('agent-2', 'Agent Two', 500)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByTestId('total-tokens')).toHaveTextContent('1,500');
  });

  it('renders bars with correct width proportional to max token count', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Agent One', 1000)],
      ['agent-2', createMockAgent('agent-2', 'Agent Two', 500)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    const bars = screen.getAllByTestId('token-usage-bar');
    expect(bars).toHaveLength(2);
    
    // First agent has max tokens (1000), so bar should be 100% width
    expect(bars[0]).toHaveStyle('width: 100%');
    
    // Second agent has 500 tokens (50% of max), so bar should be 50% width
    expect(bars[1]).toHaveStyle('width: 50%');
  });

  it('handles single agent correctly', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Solo Agent', 5000)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByText('Solo Agent')).toBeInTheDocument();
    expect(screen.getByTestId('token-count')).toHaveTextContent('5,000');
    expect(screen.getByTestId('total-tokens')).toHaveTextContent('5,000');
    
    const bars = screen.getAllByTestId('token-usage-bar');
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveStyle('width: 100%');
  });

  it('handles large token numbers with proper formatting', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Big Agent', 1234567)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByTestId('token-count')).toHaveTextContent('1,234,567');
    expect(screen.getByTestId('total-tokens')).toHaveTextContent('1,234,567');
  });

  it('renders chart when agents exist', () => {
    const activities = new Map<string, Agent>([
      ['agent-1', createMockAgent('agent-1', 'Agent One', 100)],
    ]);
    
    render(<TokenUsage activities={activities} />);
    
    expect(screen.getByTestId('token-usage-chart')).toBeInTheDocument();
    expect(screen.getByTestId('token-usage-footer')).toBeInTheDocument();
  });
});
