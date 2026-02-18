import { Activity, User, AlertCircle } from 'lucide-react';
import type { Agent, AgentStatus } from '../types/agent';
import './AgentCard.css';

export interface AgentCardProps {
  agent: Agent;
}

const statusConfig: Record<AgentStatus, { label: string; color: string; icon: typeof Activity }> = {
  running: { label: 'Running', color: '#4ade80', icon: Activity },
  idle: { label: 'Idle', color: '#a1a1aa', icon: User },
  error: { label: 'Error', color: '#f87171', icon: AlertCircle },
};

/**
 * AgentCard component - displays individual agent status with live indicators
 */
export function AgentCard({ agent }: AgentCardProps) {
  const status = statusConfig[agent.status];
  const StatusIcon = status.icon;

  return (
    <div className="agent-card" data-testid="agent-card">
      <div className="agent-card__header">
        <div className="agent-card__icon-wrapper">
          <User className="agent-card__icon" aria-label="Agent" />
        </div>
        <div className="agent-card__info">
          <h3 className="agent-card__name" data-testid="agent-name">
            {agent.name}
          </h3>
          <span className="agent-card__model" data-testid="agent-model">
            {agent.currentModel}
          </span>
        </div>
      </div>

      <div className="agent-card__status">
        <div
          className={`agent-card__status-badge agent-card__status-badge--${agent.status}`}
          data-testid="agent-status-badge"
        >
          <span
            className={`agent-card__status-indicator agent-card__status-indicator--${agent.status}`}
            data-testid="status-indicator"
            style={{ backgroundColor: status.color }}
          />
          <StatusIcon
            className="agent-card__status-icon"
            aria-label={status.label}
            style={{ color: status.color }}
          />
          <span className="agent-card__status-label" data-testid="status-label">
            {status.label}
          </span>
        </div>
      </div>

      <div className="agent-card__footer">
        <div className="agent-card__stats">
          <span className="agent-card__stat" data-testid="token-count">
            {agent.tokensUsed.total.toLocaleString()} tokens
          </span>
          <span className="agent-card__stat-separator">•</span>
          <span className="agent-card__stat" data-testid="tool-count">
            {agent.tools.length} tools
          </span>
        </div>
      </div>
    </div>
  );
}
