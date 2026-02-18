import { useRef, useEffect, useState } from 'react';
import {
  Play,
  Square,
  Wrench,
  ArrowRightLeft,
  Coins,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import type { AgentEvent, AgentEventType } from '../types/agent';
import './ActivityFeed.css';

export interface ActivityFeedProps {
  events: AgentEvent[];
  maxEvents?: number;
  autoScroll?: boolean;
}

interface EventTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;
}

const eventTypeConfig: Record<AgentEventType, EventTypeConfig> = {
  agent_started: { icon: Play, label: 'Started', color: '#4ade80' },
  agent_ended: { icon: Square, label: 'Ended', color: '#f87171' },
  tool_called: { icon: Wrench, label: 'Tool', color: '#60a5fa' },
  model_switched: { icon: ArrowRightLeft, label: 'Model', color: '#a3e635' },
  token_update: { icon: Coins, label: 'Tokens', color: '#fbbf24' },
  heartbeat: { icon: Activity, label: 'Heartbeat', color: '#a1a1aa' },
};

/**
 * Format timestamp as HH:MM:SS
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get preview text for event payload
 */
function getPayloadPreview(event: AgentEvent): string {
  const { eventType, payload } = event;

  switch (eventType) {
    case 'agent_started':
      return `Started with ${(payload as { model: string }).model}`;
    case 'agent_ended':
      return `Ended${(payload as { reason?: string }).reason ? `: ${(payload as { reason?: string }).reason}` : ''}`;
    case 'tool_called':
      return `Called ${(payload as { toolName: string }).toolName}`;
    case 'model_switched':
      return `Switched to ${(payload as { newModel: string }).newModel}`;
    case 'token_update': {
      const p = payload as { input: number; output: number };
      return `+${p.input + p.output} tokens`;
    }
    case 'heartbeat':
      return 'Status check';
    default:
      return '';
  }
}

/**
 * ActivityFeed component - displays scrolling timeline of agent events
 */
export function ActivityFeed({
  events,
  maxEvents = 100,
  autoScroll = true,
}: ActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(autoScroll);

  // Limit to maxEvents, newest first
  const displayEvents = events.slice(-maxEvents).reverse();

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (autoScrollEnabled && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [events, autoScrollEnabled]);

  return (
    <div className="activity-feed" data-testid="activity-feed">
      <div className="activity-feed__header">
        <h2 className="activity-feed__title">Activity Feed</h2>
        <div className="activity-feed__controls">
          <span className="activity-feed__count" data-testid="event-count">
            {displayEvents.length} / {maxEvents}
          </span>
          <button
            type="button"
            className={`activity-feed__toggle ${autoScrollEnabled ? 'activity-feed__toggle--active' : ''}`}
            onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
            aria-label={autoScrollEnabled ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            aria-pressed={autoScrollEnabled}
            data-testid="auto-scroll-toggle"
          >
            Auto
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="activity-feed__list"
        data-testid="activity-feed-list"
      >
        {displayEvents.length === 0 ? (
          <div className="activity-feed__empty" data-testid="empty-state">
            <Activity className="activity-feed__empty-icon" aria-label="No activity" />
            <p className="activity-feed__empty-text">No events yet</p>
          </div>
        ) : (
          displayEvents.map((event, index) => {
            const config = eventTypeConfig[event.eventType];
            const Icon = config.icon;
            const isNewest = index === 0;

            return (
              <div
                key={`${event.timestamp}-${event.agentId}-${index}`}
                className={`activity-feed__item ${isNewest ? 'activity-feed__item--new' : ''}`}
                data-testid="activity-feed-item"
                data-event-type={event.eventType}
              >
                <div
                  className="activity-feed__icon-wrapper"
                  style={{ backgroundColor: `${config.color}20` }}
                >
                  <Icon
                    className="activity-feed__icon"
                    style={{ color: config.color }}
                    aria-label={config.label}
                  />
                </div>

                <div className="activity-feed__content">
                  <div className="activity-feed__meta">
                    <span
                      className="activity-feed__timestamp"
                      data-testid="event-timestamp"
                    >
                      {formatTimestamp(event.timestamp)}
                    </span>
                    <span className="activity-feed__agent-name" data-testid="event-agent">
                      {event.agentId}
                    </span>
                  </div>

                  <div className="activity-feed__details">
                    <span
                      className="activity-feed__type"
                      style={{ color: config.color }}
                      data-testid="event-type"
                    >
                      {config.label}
                    </span>
                    <span className="activity-feed__preview" data-testid="event-preview">
                      {getPayloadPreview(event)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
