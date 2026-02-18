import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionStatus } from '../src/components/ConnectionStatus';
import type { ConnectionStatus as ConnectionStatusType } from '../src/types/agent';

describe('ConnectionStatus', () => {
  const mockReconnect = vi.fn();

  beforeEach(() => {
    mockReconnect.mockClear();
  });

  describe('Status indicator colors', () => {
    it('shows green indicator when connected', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#4ade80' });
    });

    it('shows yellow indicator when connecting', () => {
      render(
        <ConnectionStatus
          status="connecting"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#fbbf24' });
    });

    it('shows red indicator when disconnected', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#f87171' });
    });

    it('shows red indicator when error', () => {
      render(
        <ConnectionStatus
          status="error"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveStyle({ backgroundColor: '#f87171' });
    });
  });

  describe('Status text', () => {
    it('displays "Connected" text when connected', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('status-label')).toHaveTextContent('Connected');
    });

    it('displays "Connecting..." text when connecting', () => {
      render(
        <ConnectionStatus
          status="connecting"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('status-label')).toHaveTextContent('Connecting...');
    });

    it('displays "Disconnected" text when disconnected', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('status-label')).toHaveTextContent('Disconnected');
    });

    it('displays "Connection Error" text when error', () => {
      render(
        <ConnectionStatus
          status="error"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('status-label')).toHaveTextContent('Connection Error');
    });
  });

  describe('Icons', () => {
    it('shows Wifi icon when connected', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('wifi-off-icon')).not.toBeInTheDocument();
    });

    it('shows WifiOff icon when disconnected', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('wifi-icon')).not.toBeInTheDocument();
    });

    it('shows WifiOff icon when connecting', () => {
      render(
        <ConnectionStatus
          status="connecting"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });

    it('shows WifiOff icon when error', () => {
      render(
        <ConnectionStatus
          status="error"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('wifi-off-icon')).toBeInTheDocument();
    });
  });

  describe('Reconnect button', () => {
    it('shows reconnect button when disconnected', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('reconnect-button')).toBeInTheDocument();
    });

    it('shows reconnect button when error', () => {
      render(
        <ConnectionStatus
          status="error"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('reconnect-button')).toBeInTheDocument();
    });

    it('does not show reconnect button when connected', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.queryByTestId('reconnect-button')).not.toBeInTheDocument();
    });

    it('does not show reconnect button when connecting', () => {
      render(
        <ConnectionStatus
          status="connecting"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.queryByTestId('reconnect-button')).not.toBeInTheDocument();
    });

    it('calls onReconnect callback when clicked', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      const button = screen.getByTestId('reconnect-button');
      fireEvent.click(button);

      expect(mockReconnect).toHaveBeenCalledTimes(1);
    });

    it('has accessible label on reconnect button', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      const button = screen.getByTestId('reconnect-button');
      expect(button).toHaveAttribute('aria-label', 'Reconnect to WebSocket');
    });
  });

  describe('Last connected timestamp', () => {
    it('shows last connected timestamp when provided and not connected', () => {
      const timestamp = Date.now() - 60000; // 1 minute ago
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
          lastConnectedAt={timestamp}
        />
      );

      expect(screen.getByTestId('last-connected')).toBeInTheDocument();
      expect(screen.getByTestId('last-connected')).toHaveTextContent('Last:');
    });

    it('does not show timestamp when connected', () => {
      const timestamp = Date.now() - 60000;
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
          lastConnectedAt={timestamp}
        />
      );

      expect(screen.queryByTestId('last-connected')).not.toBeInTheDocument();
    });

    it('does not show timestamp when not provided', () => {
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.queryByTestId('last-connected')).not.toBeInTheDocument();
    });

    it('formats timestamp correctly', () => {
      // Create a fixed timestamp: Feb 18, 2026 14:30:45
      const timestamp = new Date('2026-02-18T14:30:45').getTime();
      render(
        <ConnectionStatus
          status="disconnected"
          onReconnect={mockReconnect}
          lastConnectedAt={timestamp}
        />
      );

      const timeElement = screen.getByTestId('last-connected');
      expect(timeElement).toHaveTextContent('14:30:45');
    });
  });

  describe('Component structure', () => {
    it('renders with data-testid', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      expect(screen.getByTestId('connection-status')).toBeInTheDocument();
    });

    it('has pulse animation class when connecting', () => {
      render(
        <ConnectionStatus
          status="connecting"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('connection-status__indicator--pulse');
    });

    it('does not have pulse animation class when connected', () => {
      render(
        <ConnectionStatus
          status="connected"
          onReconnect={mockReconnect}
        />
      );

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).not.toHaveClass('connection-status__indicator--pulse');
    });
  });

  describe('All status variants', () => {
    const statuses: ConnectionStatusType[] = ['connected', 'connecting', 'disconnected', 'error'];

    it.each(statuses)('renders without crashing for status: %s', (status) => {
      const { container } = render(
        <ConnectionStatus
          status={status}
          onReconnect={mockReconnect}
        />
      );

      expect(container).toBeTruthy();
    });
  });
});
