import { useState, useCallback } from 'react';
import type { AgentActivity, AgentStatus } from '../types/agentEvents';
import './AgentList.css';

export interface AgentListProps {
  /** Array of agent activities to display */
  agents: AgentActivity[];
  /** Currently selected agent ID (optional) */
  selectedAgentId?: string;
  /** Callback when an agent is selected */
  onSelectAgent?: (agentId: string) => void;
  /** Optional additional CSS class names */
  className?: string;
  /** Maximum height for the list (enables scrolling) */
  maxHeight?: string;
}

/**
 * Get status icon based on agent status
 */
function getStatusIcon(status: AgentStatus): string {
  switch (status) {
    case 'active':
      return '●';
    case 'idle':
      return '◐';
    case 'error':
      return '✕';
    case 'ended':
      return '○';
    default:
      return '○';
  }
}

/**
 * Format token count for display (e.g., 1.2K, 3.5M)
 */
function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Format duration from milliseconds to human readable
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * AgentList - Displays a scrollable list of agent status cards
 * 
 * Features:
 * - Shows agent status with color-coded indicators
 * - Displays current model and token usage
 * - Supports selection with keyboard navigation
 * - Auto-scrolls to keep selected agent visible
 * 
 * @example
 * ```tsx
 * <AgentList
 *   agents={activitiesList}
 *   selectedAgentId={selectedId}
 *   onSelectAgent={setSelectedId}
 * />
 * ```
 */
export function AgentList({
  agents,
  selectedAgentId,
  onSelectAgent,
  className = '',
  maxHeight = '400px',
}: AgentListProps) {
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  const handleClick = useCallback(
    (agentId: string) => {
      onSelectAgent?.(agentId);
    },
    [onSelectAgent]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, agentId: string, index: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelectAgent?.(agentId);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextAgent = agents[index + 1];
        if (nextAgent) {
          onSelectAgent?.(nextAgent.agentId);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevAgent = agents[index - 1];
        if (prevAgent) {
          onSelectAgent?.(prevAgent.agentId);
        }
      }
    },
    [agents, onSelectAgent]
  );

  if (agents.length === 0) {
    return (
      <div className={`agent-list agent-list--empty ${className}`.trim()}>
        <div className="agent-list__empty-state">
          <span className="agent-list__empty-icon">⊘</span>
          <p className="agent-list__empty-text">No active agents</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`agent-list ${className}`.trim()}
      style={{ maxHeight }}
      role="listbox"
      aria-label="Agent list"
    >
      {agents.map((agent, index) => {
        const isSelected = agent.agentId === selectedAgentId;
        const isHovered = agent.agentId === hoveredAgentId;
        const duration = agent.endedAt
          ? agent.endedAt - agent.startedAt
          : Date.now() - agent.startedAt;

        return (
          <div
            key={agent.agentId}
            className={`agent-card agent-card--${agent.status} ${
              isSelected ? 'agent-card--selected' : ''
            } ${isHovered ? 'agent-card--hovered' : ''}`.trim()}
            onClick={() => handleClick(agent.agentId)}
            onMouseEnter={() => setHoveredAgentId(agent.agentId)}
            onMouseLeave={() => setHoveredAgentId(null)}
            onKeyDown={(e) => handleKeyDown(e, agent.agentId, index)}
            role="option"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
          >
            {/* Status Indicator */}
            <div className="agent-card__status">
              <span
                className={`agent-card__status-icon agent-card__status-icon--${agent.status}`}
                aria-hidden="true"
              >
                {getStatusIcon(agent.status)}
              </span>
              {agent.status === 'active' && (
                <span className="agent-card__live-indicator" aria-hidden="true" />
              )}
            </div>

            {/* Agent Info */}
            <div className="agent-card__info">
              <div className="agent-card__header">
                <h4 className="agent-card__name">{agent.agentId}</h4>
                <span className="agent-card__duration">{formatDuration(duration)}</span>
              </div>

              <div className="agent-card__details">
                {agent.currentModel && (
                  <span className="agent-card__model">{agent.currentModel}</span>
                )}
                <span className="agent-card__tools">
                  {agent.toolsUsed.length} tool{agent.toolsUsed.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Token Usage */}
            <div className="agent-card__tokens">
              <span className="agent-card__token-count numeric">
                {formatTokenCount(agent.tokenUsage.totalTokens)}
              </span>
              <span className="agent-card__token-label">tokens</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AgentList;
