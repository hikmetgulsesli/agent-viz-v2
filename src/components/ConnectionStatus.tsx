import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import type { ConnectionStatus } from '../types/agent';
import './ConnectionStatus.css';

export interface ConnectionStatusProps {
  status: ConnectionStatus;
  onReconnect: () => void;
  lastConnectedAt?: number;
}

const statusConfig: Record<ConnectionStatus, { label: string; color: string; pulse: boolean }> = {
  connected: { label: 'Connected', color: '#4ade80', pulse: false },
  connecting: { label: 'Connecting...', color: '#fbbf24', pulse: true },
  disconnected: { label: 'Disconnected', color: '#f87171', pulse: false },
  error: { label: 'Connection Error', color: '#f87171', pulse: false },
};

/**
 * ConnectionStatus component - shows WebSocket health and allows manual reconnect
 */
export function ConnectionStatus({ status, onReconnect, lastConnectedAt }: ConnectionStatusProps) {
  const config = statusConfig[status];
  const showReconnect = status === 'disconnected' || status === 'error';

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="connection-status" data-testid="connection-status">
      <div className="connection-status__indicator-wrapper">
        <span
          className={`connection-status__indicator ${config.pulse ? 'connection-status__indicator--pulse' : ''}`}
          data-testid="status-indicator"
          style={{ backgroundColor: config.color }}
          aria-hidden="true"
        />
        {status === 'connected' ? (
          <Wifi
            className="connection-status__icon"
            style={{ color: config.color }}
            aria-label="Connected"
            data-testid="wifi-icon"
          />
        ) : (
          <WifiOff
            className="connection-status__icon"
            style={{ color: config.color }}
            aria-label="Disconnected"
            data-testid="wifi-off-icon"
          />
        )}
        <span
          className="connection-status__label"
          data-testid="status-label"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {lastConnectedAt && status !== 'connected' && (
        <span className="connection-status__timestamp" data-testid="last-connected">
          Last: {formatTimestamp(lastConnectedAt)}
        </span>
      )}

      {showReconnect && (
        <button
          type="button"
          className="connection-status__reconnect-btn"
          onClick={onReconnect}
          data-testid="reconnect-button"
          aria-label="Reconnect to WebSocket"
        >
          <RefreshCw className="connection-status__reconnect-icon" aria-hidden="true" />
          <span>Reconnect</span>
        </button>
      )}
    </div>
  );
}

export default ConnectionStatus;
