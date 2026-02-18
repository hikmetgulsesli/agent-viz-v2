import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActivityFeed } from '../src/components/ActivityFeed';
import type { AgentEvent } from '../src/types/agent';

const mockEvents: AgentEvent[] = [
  {
    timestamp: 1708224000000,
    agentId: 'agent-1',
    eventType: 'agent_started',
    payload: { name: 'Test Agent', model: 'gpt-4o' },
  },
  {
    timestamp: 1708224005000,
    agentId: 'agent-1',
    eventType: 'tool_called',
    payload: { toolName: 'read_file', args: { path: 'src/index.ts' } },
  },
  {
    timestamp: 1708224010000,
    agentId: 'agent-1',
    eventType: 'model_switched',
    payload: { previousModel: 'gpt-4o', newModel: 'gpt-4o-mini' },
  },
  {
    timestamp: 1708224015000,
    agentId: 'agent-1',
    eventType: 'token_update',
    payload: { input: 100, output: 50 },
  },
  {
    timestamp: 1708224020000,
    agentId: 'agent-1',
    eventType: 'agent_ended',
    payload: { reason: 'completed' },
  },
];

const mockHeartbeatEvent: AgentEvent = {
  timestamp: 1708224025000,
  agentId: 'agent-2',
  eventType: 'heartbeat',
  payload: { agentId: 'agent-2', status: 'running' },
};

describe('ActivityFeed', () => {
  it('renders the component', () => {
    render(<ActivityFeed events={mockEvents} />);
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
  });

  it('displays the title', () => {
    render(<ActivityFeed events={mockEvents} />);
    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
  });

  it('displays event count', () => {
    render(<ActivityFeed events={mockEvents} />);
    expect(screen.getByTestId('event-count')).toHaveTextContent('5 / 100');
  });

  it('renders all events as feed items', () => {
    render(<ActivityFeed events={mockEvents} />);
    const items = screen.getAllByTestId('activity-feed-item');
    expect(items).toHaveLength(5);
  });

  it('displays events in reverse chronological order (newest first)', () => {
    render(<ActivityFeed events={mockEvents} />);
    const timestamps = screen.getAllByTestId('event-timestamp');
    // First item should be the newest (agent_ended at 1708224020000)
    // Last item should be the oldest (agent_started at 1708224000000)
    // Verify order by checking timestamps are in descending order
    const timeValues = timestamps.map(t => t.textContent);
    expect(timeValues[0]! > timeValues[4]!).toBe(true);
  });

  describe('Event type icons and colors', () => {
    it('renders agent_started with Play icon and green color', () => {
      render(<ActivityFeed events={[mockEvents[0]]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'agent_started');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#4ade80' });
      expect(eventType).toHaveTextContent('Started');
    });

    it('renders agent_ended with Square icon and red color', () => {
      render(<ActivityFeed events={[mockEvents[4]]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'agent_ended');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#f87171' });
      expect(eventType).toHaveTextContent('Ended');
    });

    it('renders tool_called with Wrench icon and blue color', () => {
      render(<ActivityFeed events={[mockEvents[1]]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'tool_called');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#60a5fa' });
      expect(eventType).toHaveTextContent('Tool');
    });

    it('renders model_switched with ArrowRightLeft icon and lime color', () => {
      render(<ActivityFeed events={[mockEvents[2]]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'model_switched');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#a3e635' });
      expect(eventType).toHaveTextContent('Model');
    });

    it('renders token_update with Coins icon and amber color', () => {
      render(<ActivityFeed events={[mockEvents[3]]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'token_update');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#fbbf24' });
      expect(eventType).toHaveTextContent('Tokens');
    });

    it('renders heartbeat with Activity icon and gray color', () => {
      render(<ActivityFeed events={[mockHeartbeatEvent]} />);
      const item = screen.getByTestId('activity-feed-item');
      expect(item).toHaveAttribute('data-event-type', 'heartbeat');
      const eventType = screen.getByTestId('event-type');
      expect(eventType).toHaveStyle({ color: '#a1a1aa' });
      expect(eventType).toHaveTextContent('Heartbeat');
    });
  });

  describe('Timestamp formatting', () => {
    it('formats timestamp as HH:MM:SS', () => {
      render(<ActivityFeed events={[mockEvents[0]]} />);
      const timestamp = screen.getByTestId('event-timestamp');
      // Verify format is HH:MM:SS (two digits:two digits:two digits)
      expect(timestamp.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('handles different times correctly', () => {
      const event: AgentEvent = {
        timestamp: new Date('2024-02-18T09:30:45').getTime(),
        agentId: 'agent-1',
        eventType: 'agent_started',
        payload: { name: 'Test', model: 'gpt-4' },
      };
      render(<ActivityFeed events={[event]} />);
      const timestamp = screen.getByTestId('event-timestamp');
      expect(timestamp.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('Payload previews', () => {
    it('shows model name for agent_started', () => {
      render(<ActivityFeed events={[mockEvents[0]]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('Started with gpt-4o');
    });

    it('shows reason for agent_ended', () => {
      render(<ActivityFeed events={[mockEvents[4]]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('Ended: completed');
    });

    it('shows tool name for tool_called', () => {
      render(<ActivityFeed events={[mockEvents[1]]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('Called read_file');
    });

    it('shows new model for model_switched', () => {
      render(<ActivityFeed events={[mockEvents[2]]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('Switched to gpt-4o-mini');
    });

    it('shows token count for token_update', () => {
      render(<ActivityFeed events={[mockEvents[3]]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('+150 tokens');
    });

    it('shows status check for heartbeat', () => {
      render(<ActivityFeed events={[mockHeartbeatEvent]} />);
      expect(screen.getByTestId('event-preview')).toHaveTextContent('Status check');
    });
  });

  describe('Agent name display', () => {
    it('displays agent ID', () => {
      render(<ActivityFeed events={[mockEvents[0]]} />);
      expect(screen.getByTestId('event-agent')).toHaveTextContent('agent-1');
    });
  });

  describe('Max events limit', () => {
    it('limits events to maxEvents', () => {
      const manyEvents: AgentEvent[] = Array.from({ length: 150 }, (_, i) => ({
        timestamp: 1708224000000 + i * 1000,
        agentId: `agent-${i}`,
        eventType: 'heartbeat',
        payload: { agentId: `agent-${i}`, status: 'running' },
      }));
      render(<ActivityFeed events={manyEvents} maxEvents={100} />);
      const items = screen.getAllByTestId('activity-feed-item');
      expect(items).toHaveLength(100);
      expect(screen.getByTestId('event-count')).toHaveTextContent('100 / 100');
    });

    it('uses default maxEvents of 100', () => {
      const manyEvents: AgentEvent[] = Array.from({ length: 150 }, (_, i) => ({
        timestamp: 1708224000000 + i * 1000,
        agentId: `agent-${i}`,
        eventType: 'heartbeat',
        payload: { agentId: `agent-${i}`, status: 'running' },
      }));
      render(<ActivityFeed events={manyEvents} />);
      const items = screen.getAllByTestId('activity-feed-item');
      expect(items).toHaveLength(100);
    });

    it('keeps newest events when limiting', () => {
      const manyEvents: AgentEvent[] = Array.from({ length: 150 }, (_, i) => ({
        timestamp: 1708224000000 + i * 1000,
        agentId: `agent-${i}`,
        eventType: 'heartbeat',
        payload: { agentId: `agent-${i}`, status: 'running' },
      }));
      render(<ActivityFeed events={manyEvents} maxEvents={100} />);
      const timestamps = screen.getAllByTestId('event-timestamp');
      // First (newest) should be later than last (oldest kept)
      expect(timestamps[0].textContent! > timestamps[99].textContent!).toBe(true);
      // Verify we have exactly 100 events
      expect(timestamps).toHaveLength(100);
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no events', () => {
      render(<ActivityFeed events={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No events yet')).toBeInTheDocument();
    });

    it('does not show empty state when events exist', () => {
      render(<ActivityFeed events={mockEvents} />);
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('Auto-scroll toggle', () => {
    it('renders auto-scroll toggle button', () => {
      render(<ActivityFeed events={mockEvents} />);
      expect(screen.getByTestId('auto-scroll-toggle')).toBeInTheDocument();
    });

    it('toggle button has correct aria-label when enabled', () => {
      render(<ActivityFeed events={mockEvents} autoScroll={true} />);
      const toggle = screen.getByTestId('auto-scroll-toggle');
      expect(toggle).toHaveAttribute('aria-label', 'Disable auto-scroll');
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggle button has correct aria-label when disabled', () => {
      render(<ActivityFeed events={mockEvents} autoScroll={false} />);
      const toggle = screen.getByTestId('auto-scroll-toggle');
      expect(toggle).toHaveAttribute('aria-label', 'Enable auto-scroll');
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('toggles auto-scroll when clicked', () => {
      render(<ActivityFeed events={mockEvents} autoScroll={true} />);
      const toggle = screen.getByTestId('auto-scroll-toggle');
      expect(toggle).toHaveTextContent('Auto');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      expect(toggle).toHaveAttribute('aria-label', 'Enable auto-scroll');
    });
  });

  describe('Newest item animation', () => {
    it('adds animation class to newest item', () => {
      render(<ActivityFeed events={mockEvents} />);
      const items = screen.getAllByTestId('activity-feed-item');
      // Newest item (first in reversed list) should have animation class
      expect(items[0].className).toContain('activity-feed__item--new');
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on icon elements', () => {
      render(<ActivityFeed events={[mockEvents[0]]} />);
      const icon = document.querySelector('[aria-label="Started"]');
      expect(icon).toBeInTheDocument();
    });

    it('toggle button is focusable', () => {
      render(<ActivityFeed events={mockEvents} />);
      const toggle = screen.getByTestId('auto-scroll-toggle');
      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });
  });
});
