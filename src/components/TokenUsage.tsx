import type { Agent } from '../types/agent';
import './TokenUsage.css';

export interface TokenUsageProps {
  activities: Map<string, Agent>;
}

/**
 * TokenUsage component - displays horizontal bar chart of token usage per agent
 */
export function TokenUsage({ activities }: TokenUsageProps) {
  const agents = Array.from(activities.values());

  // Calculate max tokens for scaling bars
  const maxTokens = agents.length > 0
    ? Math.max(...agents.map(a => a.tokensUsed.total))
    : 0;

  // Calculate total tokens across all agents
  const totalTokens = agents.reduce((sum, agent) => sum + agent.tokensUsed.total, 0);

  // Empty state
  if (agents.length === 0 || totalTokens === 0) {
    return (
      <div className="token-usage token-usage--empty" data-testid="token-usage">
        <div className="token-usage__header">
          <h3 className="token-usage__title">Token Usage</h3>
        </div>
        <div className="token-usage__empty" data-testid="token-usage-empty">
          <p className="token-usage__empty-text">No token usage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="token-usage" data-testid="token-usage">
      <div className="token-usage__header">
        <h3 className="token-usage__title">Token Usage</h3>
      </div>

      <div className="token-usage__chart" data-testid="token-usage-chart">
        {agents.map((agent) => {
          const percentage = maxTokens > 0
            ? (agent.tokensUsed.total / maxTokens) * 100
            : 0;

          return (
            <div key={agent.id} className="token-usage__bar-row" data-testid="token-usage-bar-row">
              <div className="token-usage__agent-info">
                <span className="token-usage__agent-name" data-testid="agent-name">
                  {agent.name}
                </span>
              </div>
              <div className="token-usage__bar-container">
                <div
                  className="token-usage__bar"
                  data-testid="token-usage-bar"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="token-usage__value">
                <span className="token-usage__count" data-testid="token-count">
                  {agent.tokensUsed.total.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="token-usage__footer" data-testid="token-usage-footer">
        <div className="token-usage__total">
          <span className="token-usage__total-label">Total Tokens</span>
          <span className="token-usage__total-value" data-testid="total-tokens">
            {totalTokens.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
