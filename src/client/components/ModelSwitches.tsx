import { useMemo } from 'react';
import type { AgentEvent } from '../types/agentEvents';
import { Cpu, ArrowRight, Clock } from 'lucide-react';
import './ModelSwitches.css';

export interface ModelSwitchesProps {
  /** Array of events to filter for model switches */
  events: AgentEvent[];
  /** Optional additional CSS class names */
  className?: string;
  /** Maximum height for the panel (enables scrolling) */
  maxHeight?: string;
  /** Maximum number of switches to display (default: 50) */
  maxSwitches?: number;
}

/** Model switch record for display */
interface ModelSwitchRecord {
  agentId: string;
  previousModel?: string;
  newModel: string;
  timestamp: number;
  reason?: string;
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

/** Format full timestamp for tooltip */
function formatFullTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/** Truncate model name if too long */
function truncateModelName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}

/**
 * ModelSwitches - Display model transition events showing which LLM model is active per agent
 * 
 * Features:
 * - Filters events for model_switched type
 * - Shows agentId, old model, new model, timestamp
 * - Chronological list with most recent first
 * - Empty state when no switches
 * - Hover animation on items
 * 
 * @example
 * ```tsx
 * <ModelSwitches
 *   events={events}
 *   maxHeight="400px"
 *   maxSwitches={50}
 * />
 * ```
 */
export function ModelSwitches({
  events,
  className = '',
  maxHeight = '400px',
  maxSwitches = 50,
}: ModelSwitchesProps) {
  // Filter and sort model switch events
  const modelSwitches = useMemo<ModelSwitchRecord[]>(() => {
    const switches: ModelSwitchRecord[] = events
      .filter((event): event is AgentEvent & { type: 'model_switched'; data: { previousModel?: string; newModel: string; reason?: string } } => {
        if (event.type !== 'model_switched') return false;
        if (!event.data) return false;
        return typeof (event.data as { newModel?: string }).newModel === 'string';
      })
      .map(event => ({
        agentId: event.agentId,
        previousModel: (event.data as { previousModel?: string }).previousModel,
        newModel: (event.data as { newModel: string }).newModel,
        timestamp: event.timestamp,
        reason: (event.data as { reason?: string }).reason,
      }));

    // Sort by timestamp descending (most recent first)
    switches.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to maxSwitches
    return switches.slice(0, maxSwitches);
  }, [events, maxSwitches]);

  if (modelSwitches.length === 0) {
    return (
      <div className={`model-switches model-switches--empty ${className}`.trim()}>
        <div className="model-switches__empty-state">
          <Cpu size={32} className="model-switches__empty-icon" aria-hidden="true" />
          <p className="model-switches__empty-text">No model switches yet</p>
          <p className="model-switches__empty-hint">Model transitions will appear here when agents switch LLMs</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`model-switches ${className}`.trim()}>
      <div
        className="model-switches__scroll-container"
        style={{ maxHeight }}
        role="log"
        aria-live="polite"
        aria-label="Model switch history"
      >
        <ul className="model-switches__list">
          {modelSwitches.map((switchRecord, index) => {
            const isFirst = index === 0;

            return (
              <li
                key={`${switchRecord.agentId}-${switchRecord.timestamp}-${index}`}
                className="model-switches__item"
                data-agent-id={switchRecord.agentId}
              >
                <div className="model-switches__icon" aria-hidden="true">
                  <Cpu size={16} />
                </div>
                <div className="model-switches__content">
                  <div className="model-switches__header">
                    <span className="model-switches__agent-id">{switchRecord.agentId}</span>
                    <time
                      className="model-switches__timestamp"
                      dateTime={new Date(switchRecord.timestamp).toISOString()}
                      title={formatFullTimestamp(switchRecord.timestamp)}
                    >
                      <Clock size={12} aria-hidden="true" />
                      {formatRelativeTime(switchRecord.timestamp)}
                    </time>
                  </div>
                  <div className="model-switches__transition">
                    {switchRecord.previousModel ? (
                      <>
                        <span 
                          className="model-switches__model model-switches__model--previous"
                          title={switchRecord.previousModel}
                        >
                          {truncateModelName(switchRecord.previousModel)}
                        </span>
                        <span className="model-switches__arrow" aria-hidden="true">
                          <ArrowRight size={14} />
                        </span>
                      </>
                    ) : (
                      <span className="model-switches__model model-switches__model--none">
                        No previous model
                      </span>
                    )}
                    <span 
                      className="model-switches__model model-switches__model--new"
                      title={switchRecord.newModel}
                    >
                      {truncateModelName(switchRecord.newModel)}
                    </span>
                  </div>
                  {switchRecord.reason && (
                    <p className="model-switches__reason">
                      Reason: {switchRecord.reason}
                    </p>
                  )}
                </div>
                {isFirst && (
                  <span className="model-switches__new-indicator" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default ModelSwitches;
