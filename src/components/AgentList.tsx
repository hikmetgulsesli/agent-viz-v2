import { Users } from 'lucide-react';
import type { Agent } from '../types/agent';
import { AgentCard } from './AgentCard';
import './AgentList.css';

export interface AgentListProps {
  activities: Map<string, Agent>;
}

/**
 * Status priority for sorting (lower = higher priority)
 */
const statusPriority: Record<Agent['status'], number> = {
  running: 0,
  idle: 1,
  error: 2,
};

/**
 * Sort agents by status (running first), then by name
 */
function sortAgents(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * AgentList component - renders all active agents as cards in a responsive grid
 */
export function AgentList({ activities }: AgentListProps) {
  const agents = Array.from(activities.values());
  const sortedAgents = sortAgents(agents);
  const hasAgents = sortedAgents.length > 0;

  return (
    <div className="agent-list" data-testid="agent-list">
      {hasAgents ? (
        <div className="agent-list__grid" data-testid="agent-list-grid">
          {sortedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="agent-list__empty" data-testid="agent-list-empty">
          <div className="agent-list__empty-icon-wrapper">
            <Users className="agent-list__empty-icon" aria-hidden="true" />
          </div>
          <p className="agent-list__empty-text">No active agents</p>
        </div>
      )}
    </div>
  );
}
