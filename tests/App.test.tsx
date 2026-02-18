import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

// Mock the useWebSocket hook
vi.mock('../src/hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}));

import { useWebSocket } from '../src/hooks/useWebSocket';

const mockedUseWebSocket = vi.mocked(useWebSocket);

describe('App Dashboard Layout', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const mockConnectedState = {
    status: 'connected' as const,
    events: [],
    lastError: null,
    reconnect: vi.fn(),
    send: vi.fn(),
    clearEvents: vi.fn(),
  };

  const mockDisconnectedState = {
    status: 'disconnected' as const,
    events: [],
    lastError: null,
    reconnect: vi.fn(),
    send: vi.fn(),
    clearEvents: vi.fn(),
  };

  describe('Layout Structure', () => {
    it('renders the main app container', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(document.querySelector('.app')).toBeInTheDocument();
    });

    it('renders header with title and subtitle', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByText('AgentViz')).toBeInTheDocument();
      expect(screen.getByText('OpenClaw Agent Activity Dashboard')).toBeInTheDocument();
    });

    it('renders main content area', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('app-main')).toBeInTheDocument();
    });

    it('renders dashboard grid container', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(document.querySelector('.app__dashboard')).toBeInTheDocument();
    });

    it('renders footer with connection info', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByText(/Connected to/i)).toBeInTheDocument();
    });
  });

  describe('Three Column Layout', () => {
    it('renders left column with AgentList', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('column-left')).toBeInTheDocument();
    });

    it('renders center column with ActivityFeed', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('column-center')).toBeInTheDocument();
    });

    it('renders right column with TokenUsage and ModelSwitches', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('column-right')).toBeInTheDocument();
    });

    it('renders all three columns', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('column-left')).toBeInTheDocument();
      expect(screen.getByTestId('column-center')).toBeInTheDocument();
      expect(screen.getByTestId('column-right')).toBeInTheDocument();
    });
  });

  describe('Header Components', () => {
    it('displays connection status indicator', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    });

    it('displays last update time', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('last-update')).toBeInTheDocument();
      expect(screen.getByText(/Updated:/i)).toBeInTheDocument();
    });

    it('shows connected status when WebSocket is connected', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('status-label')).toHaveTextContent('Connected');
    });

    it('shows disconnected status when WebSocket is disconnected', () => {
      mockedUseWebSocket.mockReturnValue(mockDisconnectedState);
      render(<App />);
      expect(screen.getByTestId('status-label')).toHaveTextContent('Disconnected');
    });
  });

  describe('ErrorBoundary Integration', () => {
    it('wraps main content in ErrorBoundary', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      // ErrorBoundary doesn't add visible markup when no error
      // but we can verify the main content renders
      expect(screen.getByTestId('app-main')).toBeInTheDocument();
    });
  });

  describe('GlassCard Containers', () => {
    it('renders GlassCard in left column with Agents title', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      const leftColumn = screen.getByTestId('column-left');
      expect(leftColumn.querySelector('.glass-card')).toBeInTheDocument();
      expect(screen.getByText('Agents')).toBeInTheDocument();
    });

    it('renders GlassCard in center column with Activity Feed title', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      const centerColumn = screen.getByTestId('column-center');
      expect(centerColumn.querySelector('.glass-card')).toBeInTheDocument();
      // Check for GlassCard title specifically
      const glassCardTitles = centerColumn.querySelectorAll('.glass-card__title');
      expect(glassCardTitles[0]).toHaveTextContent('Activity Feed');
    });

    it('renders GlassCards in right column with Token Usage and Model Info titles', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      const rightColumn = screen.getByTestId('column-right');
      const glassCards = rightColumn.querySelectorAll('.glass-card');
      expect(glassCards.length).toBeGreaterThanOrEqual(1);
      // Check for GlassCard titles specifically
      const glassCardTitles = rightColumn.querySelectorAll('.glass-card__title');
      const titles = Array.from(glassCardTitles).map(el => el.textContent);
      expect(titles).toContain('Token Usage');
      expect(titles).toContain('Model Info');
    });
  });

  describe('Agent Data Display', () => {
    it('displays agent count in left column', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByTestId('agent-count')).toHaveTextContent('0 active');
    });

    it('updates agent count when agents are present', () => {
      const mockEvents = [
        {
          timestamp: Date.now(),
          agentId: 'agent-1',
          eventType: 'agent_started' as const,
          payload: { name: 'Test Agent', model: 'gpt-4' },
        },
      ];
      mockedUseWebSocket.mockReturnValue({
        ...mockConnectedState,
        events: mockEvents,
      });
      render(<App />);
      expect(screen.getByTestId('agent-count')).toHaveTextContent('1 active');
    });
  });

  describe('Event Processing', () => {
    it('processes agent_started events correctly', () => {
      const mockEvents = [
        {
          timestamp: Date.now(),
          agentId: 'agent-1',
          eventType: 'agent_started' as const,
          payload: { name: 'Test Agent', model: 'gpt-4' },
        },
      ];
      mockedUseWebSocket.mockReturnValue({
        ...mockConnectedState,
        events: mockEvents,
      });
      render(<App />);
      expect(screen.getByTestId('agent-count')).toHaveTextContent('1 active');
    });

    it('processes multiple agent events', () => {
      const mockEvents = [
        {
          timestamp: Date.now(),
          agentId: 'agent-1',
          eventType: 'agent_started' as const,
          payload: { name: 'Agent One', model: 'gpt-4' },
        },
        {
          timestamp: Date.now() + 100,
          agentId: 'agent-2',
          eventType: 'agent_started' as const,
          payload: { name: 'Agent Two', model: 'gpt-3.5' },
        },
      ];
      mockedUseWebSocket.mockReturnValue({
        ...mockConnectedState,
        events: mockEvents,
      });
      render(<App />);
      expect(screen.getByTestId('agent-count')).toHaveTextContent('2 active');
    });
  });

  describe('Reconnect Functionality', () => {
    it('calls reconnect when reconnect button is clicked', async () => {
      const reconnectMock = vi.fn();
      mockedUseWebSocket.mockReturnValue({
        ...mockDisconnectedState,
        reconnect: reconnectMock,
      });
      render(<App />);
      
      const reconnectButton = screen.getByTestId('reconnect-button');
      await userEvent.click(reconnectButton);
      
      expect(reconnectMock).toHaveBeenCalled();
    });
  });

  describe('Last Update Time', () => {
    it('displays last update time', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      const lastUpdate = screen.getByTestId('last-update');
      expect(lastUpdate).toBeInTheDocument();
      expect(lastUpdate.textContent).toMatch(/Updated: \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Responsive CSS Classes', () => {
    it('applies correct column classes', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      
      const leftColumn = screen.getByTestId('column-left');
      const centerColumn = screen.getByTestId('column-center');
      const rightColumn = screen.getByTestId('column-right');
      
      expect(leftColumn).toHaveClass('app__column', 'app__column--left');
      expect(centerColumn).toHaveClass('app__column', 'app__column--center');
      expect(rightColumn).toHaveClass('app__column', 'app__column--right');
    });

    it('applies dashboard grid class', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(document.querySelector('.app__dashboard')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('displays event count in footer', () => {
      mockedUseWebSocket.mockReturnValue({
        ...mockConnectedState,
        events: [{ eventType: 'agent_started', agentId: 'test-agent', payload: { name: 'Test', model: 'gpt-4' }, timestamp: Date.now() }],
      });
      render(<App />);
      expect(screen.getByText(/1 events received/i)).toBeInTheDocument();
    });

    it('displays WebSocket URL in footer', () => {
      mockedUseWebSocket.mockReturnValue(mockConnectedState);
      render(<App />);
      expect(screen.getByText(/ws:/i)).toBeInTheDocument();
    });
  });
});
