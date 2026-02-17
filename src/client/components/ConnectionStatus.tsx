import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '../hooks/useWebSocket';
import './ConnectionStatus.css';

export interface ConnectionStatusProps {
  /** Current WebSocket connection status */
  status: ConnectionStatus;
  /** Timestamp of last status change or message */
  lastUpdate?: number;
  /** Optional additional CSS class names */
  className?: string;
  /** Optional label override (defaults to status-based label) */
  label?: string;
}

/**
 * Format timestamp to relative time string
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 5) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

/**
 * Get status configuration based on connection state
 */
function getStatusConfig(status: ConnectionStatus) {
  switch (status) {
    case 'connected':
      return {
        dotColor: 'var(--success)',
        icon: Wifi,
        defaultLabel: 'Connected',
      };
    case 'connecting':
      return {
        dotColor: 'var(--warning)',
        icon: Loader2,
        defaultLabel: 'Connecting...',
      };
    case 'disconnected':
      return {
        dotColor: 'var(--error)',
        icon: WifiOff,
        defaultLabel: 'Disconnected',
      };
    default:
      return {
        dotColor: 'var(--text-muted)',
        icon: WifiOff,
        defaultLabel: 'Unknown',
      };
  }
}

/**
 * ConnectionStatus - Header component showing WebSocket connection health
 * 
 * Features:
 * - Colored status dot (green/connected, yellow/connecting, red/disconnected)
 * - Status text label
 * - Last update timestamp
 * - Animated icon for connecting state
 * 
 * @example
 * ```tsx
 * <ConnectionStatus 
 *   status={status} 
 *   lastUpdate={lastMessageTimestamp}
 * />
 * ```
 */
export function ConnectionStatus({
  status,
  lastUpdate,
  className = '',
  label,
}: ConnectionStatusProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayLabel = label ?? config.defaultLabel;
  const showTimestamp = lastUpdate && status !== 'connecting';

  return (
    <div
      className={`connection-status connection-status--${status} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${displayLabel}`}
    >
      {/* Status Dot */}
      <span
        className="connection-status__dot"
        style={{ backgroundColor: config.dotColor }}
        aria-hidden="true"
      />

      {/* Icon */}
      <span className="connection-status__icon" aria-hidden="true">
        <Icon
          size={16}
          className={status === 'connecting' ? 'connection-status__spinner' : ''}
        />
      </span>

      {/* Status Text */}
      <span className="connection-status__label">{displayLabel}</span>

      {/* Last Update Timestamp */}
      {showTimestamp && (
        <span className="connection-status__timestamp" title={new Date(lastUpdate).toLocaleString()}>
          <span className="connection-status__timestamp-label">Updated</span>
          <time dateTime={new Date(lastUpdate).toISOString()}>
            {formatRelativeTime(lastUpdate)}
          </time>
        </span>
      )}
    </div>
  );
}

export default ConnectionStatus;
