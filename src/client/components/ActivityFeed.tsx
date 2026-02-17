import { useRef, useEffect, useState, useCallback } from 'react';
import type { AgentEvent, AgentEventType } from '../types/agentEvents';
import { Activity, Play, Square, Wrench, Cpu, RefreshCw } from 'lucide-react';
import './ActivityFeed.css';

export interface ActivityFeedProps {
  /** Array of events to display in the feed */
  events: AgentEvent[];
  /** Optional additional CSS class names */
  className?: string;
  /** Maximum height for the feed (enables scrolling) */
  maxHeight?: string;
  /** Maximum number of events to display (default: 100) */
  maxEvents?: number;
}

/** Event type metadata for display */
interface EventTypeMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
}

/** Get event type metadata for display */
function getEventTypeMeta(type: AgentEventType): EventTypeMeta {
  switch (type) {
    case 'tool_called':
      return {
        label: 'Tool',
        icon: <Wrench size={14} />,
        color: 'var(--accent)',
      };
    case 'model_switched':
      return {
        label: 'Model',
        icon: <Cpu size={14} />,
        color: 'var(--primary)',
      };
    case 'agent_started':
      return {
        label: 'Start',
        icon: <Play size={14} />,
        color: 'var(--success)',
      };
    case 'agent_ended':
      return {
        label: 'End',
        icon: <Square size={14} />,
        color: 'var(--text-muted)',
      };
    case 'token_update':
      return {
        label: 'Tokens',
        icon: <Activity size={14} />,
        color: 'var(--info)',
      };
    case 'heartbeat':
      return {
        label: 'Ping',
        icon: <RefreshCw size={14} />,
        color: 'var(--text-subtle)',
      };
    default:
      return {
        label: 'Event',
        icon: <Activity size={14} />,
        color: 'var(--text-muted)',
      };
  }
}

/** Format timestamp to relative time (e.g., '2m ago') */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(timestamp).toLocaleDateString();
}

/** Get event description based on type and data */
function getEventDescription(event: AgentEvent): string {
  switch (event.type) {
    case 'agent_started':
      return `Agent started${event.data?.model ? ` with ${event.data.model}` : ''}`;
    case 'agent_ended':
      return `Agent ended${event.data?.reason ? ` (${event.data.reason})` : ''}`;
    case 'tool_called':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return `Called ${(event.data as any)?.toolName || 'tool'}`;
    case 'model_switched':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return `Switched to ${(event.data as any)?.newModel || 'new model'}`;
    case 'token_update':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return `Token update: ${(event.data as any)?.totalTokens?.toLocaleString() || '0'} total`;
    case 'heartbeat':
      return 'Heartbeat received';
    default:
      return 'Unknown event';
  }
}

/**
 * ActivityFeed - A scrolling activity feed showing real-time events with timestamps
 * 
 * Features:
 * - Auto-scrolls to bottom on new events (unless user scrolled up)
 * - Shows scroll indicator when user has scrolled up
 * - Event type coloring for different event types
 * - Relative timestamps (e.g., '2m ago')
 * - Maximum event limit with automatic trimming
 * - Empty state when no events
 * 
 * @example
 * ```tsx
 * <ActivityFeed
 *   events={events}
 *   maxHeight="400px"
 *   maxEvents={100}
 * />
 * ```
 */
export function ActivityFeed({
  events,
  className = '',
  maxHeight = '400px',
  maxEvents = 100,
}: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolledUp, setHasScrolledUp] = useState(false);

  // Limit events to maxEvents (keep most recent)
  const displayEvents = events.slice(-maxEvents);

  // Check if scroll is at bottom
  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isBottom = scrollHeight - scrollTop - clientHeight < 10;
    setIsAtBottom(isBottom);
    setHasScrolledUp(!isBottom && scrollTop > 0);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
      setIsAtBottom(true);
      setHasScrolledUp(false);
    }
  }, []);

  // Auto-scroll to bottom when new events arrive (if already at bottom)
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayEvents, isAtBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollRef.current && displayEvents.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  if (displayEvents.length === 0) {
    return (
      <div className={`activity-feed activity-feed--empty ${className}`.trim()}>
        <div className="activity-feed__empty-state">
          <Activity size={32} className="activity-feed__empty-icon" aria-hidden="true" />
          <p className="activity-feed__empty-text">No activity yet</p>
          <p className="activity-feed__empty-hint">Events will appear here when agents start working</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-feed ${className}`.trim()}>
      <div
        ref={scrollRef}
        className="activity-feed__scroll-container"
        style={{ maxHeight }}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Activity feed"
      >
        <ul className="activity-feed__list">
          {displayEvents.map((event, index) => {
            const meta = getEventTypeMeta(event.type);
            const isLast = index === displayEvents.length - 1;

            return (
              <li
                key={`${event.agentId}-${event.timestamp}-${index}`}
                className={`activity-feed__item activity-feed__item--${event.type}`}
                data-event-type={event.type}
              >
                <div
                  className="activity-feed__icon"
                  style={{ color: meta.color }}
                  aria-hidden="true"
                >
                  {meta.icon}
                </div>
                <div className="activity-feed__content">
                  <div className="activity-feed__header">
                    <span
                      className="activity-feed__type-badge"
                      style={{ 
                        color: meta.color,
                        backgroundColor: `${meta.color}15`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span className="activity-feed__agent-id">{event.agentId}</span>
                  </div>
                  <p className="activity-feed__description">
                    {getEventDescription(event)}
                  </p>
                  <time
                    className="activity-feed__timestamp"
                    dateTime={new Date(event.timestamp).toISOString()}
                  >
                    {formatRelativeTime(event.timestamp)}
                  </time>
                </div>
                {isLast && (
                  <span className="activity-feed__new-indicator" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Scroll indicator */}
      {hasScrolledUp && (
        <button
          type="button"
          className="activity-feed__scroll-indicator"
          onClick={scrollToBottom}
          aria-label="Scroll to latest events"
        >
          <span className="activity-feed__scroll-indicator-text">New events</span>
          <span className="activity-feed__scroll-indicator-arrow" aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}

export default ActivityFeed;
