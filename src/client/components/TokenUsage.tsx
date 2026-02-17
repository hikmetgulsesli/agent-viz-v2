import { Coins, TrendingUp, ArrowDown, ArrowUp } from 'lucide-react';
import type { AgentActivity } from '../types/agentEvents';
import './TokenUsage.css';

export interface TokenUsageProps {
  /** Array of agent activities to calculate token usage from */
  agents: AgentActivity[];
  /** Optional additional CSS class names */
  className?: string;
}

/** Token usage data for a single agent */
interface AgentTokenData {
  agentId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Token usage data for a model */
interface ModelTokenData {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Format large numbers with K/M suffixes (e.g., 1.23M, 45.6K)
 */
function formatTokenCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

/**
 * Format number with full precision for display
 */
function formatFullNumber(count: number): string {
  return count.toLocaleString();
}

/**
 * Calculate token usage data from agent activities
 */
function calculateTokenData(agents: AgentActivity[]): {
  agentData: AgentTokenData[];
  modelData: ModelTokenData[];
  totalPrompt: number;
  totalCompletion: number;
  totalTokens: number;
} {
  const agentData: AgentTokenData[] = agents.map((agent) => ({
    agentId: agent.agentId,
    promptTokens: agent.tokenUsage.promptTokens,
    completionTokens: agent.tokenUsage.completionTokens,
    totalTokens: agent.tokenUsage.totalTokens,
  }));

  // Aggregate by model
  const modelMap = new Map<string, ModelTokenData>();

  for (const agent of agents) {
    const model = agent.currentModel || 'Unknown';
    const existing = modelMap.get(model);

    if (existing) {
      existing.promptTokens += agent.tokenUsage.promptTokens;
      existing.completionTokens += agent.tokenUsage.completionTokens;
      existing.totalTokens += agent.tokenUsage.totalTokens;
    } else {
      modelMap.set(model, {
        model,
        promptTokens: agent.tokenUsage.promptTokens,
        completionTokens: agent.tokenUsage.completionTokens,
        totalTokens: agent.tokenUsage.totalTokens,
      });
    }
  }

  const modelData = Array.from(modelMap.values()).sort((a, b) => b.totalTokens - a.totalTokens);

  const totalPrompt = agentData.reduce((sum, a) => sum + a.promptTokens, 0);
  const totalCompletion = agentData.reduce((sum, a) => sum + a.completionTokens, 0);
  const totalTokens = agentData.reduce((sum, a) => sum + a.totalTokens, 0);

  return {
    agentData: agentData.sort((a, b) => b.totalTokens - a.totalTokens),
    modelData,
    totalPrompt,
    totalCompletion,
    totalTokens,
  };
}

/**
 * Get color for model bar segment (cycling through palette)
 */
function getModelColor(index: number): string {
  const colors = [
    'var(--primary)',
    'var(--accent)',
    'var(--success)',
    'var(--info)',
    'var(--warning)',
  ];
  return colors[index % colors.length];
}

/**
 * TokenUsage - Token usage visualization component with per-agent and per-model breakdown
 *
 * Features:
 * - Total tokens displayed prominently at the top
 * - Horizontal bar chart for per-agent usage
 * - Input vs output breakdown within bars (stacked segments)
 * - Per-model stacked bar with legend
 * - Number formatting with K/M suffixes for large numbers
 * - Empty state when no token data
 *
 * @example
 * ```tsx
 * <TokenUsage agents={activities} />
 * ```
 */
export function TokenUsage({ agents, className = '' }: TokenUsageProps) {
  const { agentData, modelData, totalPrompt, totalCompletion, totalTokens } =
    calculateTokenData(agents);

  // Find max for bar scaling
  const maxAgentTokens =
    agentData.length > 0 ? Math.max(...agentData.map((a) => a.totalTokens)) : 0;

  const hasData = totalTokens > 0;

  return (
    <div className={`token-usage ${className}`.trim()}>
      {/* Total Tokens Header */}
      <div className="token-usage__header">
        <div className="token-usage__total">
          <Coins size={24} className="token-usage__total-icon" aria-hidden="true" />
          <div className="token-usage__total-content">
            <span className="token-usage__total-value numeric">
              {formatTokenCount(totalTokens)}
            </span>
            <span className="token-usage__total-label">Total Tokens</span>
          </div>
        </div>

        {hasData && (
          <div className="token-usage__breakdown">
            <div className="token-usage__breakdown-item">
              <ArrowDown size={14} className="token-usage__breakdown-icon token-usage__breakdown-icon--input" aria-hidden="true" />
              <span className="token-usage__breakdown-value numeric">
                {formatTokenCount(totalPrompt)}
              </span>
              <span className="token-usage__breakdown-label">Input</span>
            </div>
            <div className="token-usage__breakdown-item">
              <ArrowUp size={14} className="token-usage__breakdown-icon token-usage__breakdown-icon--output" aria-hidden="true" />
              <span className="token-usage__breakdown-value numeric">
                {formatTokenCount(totalCompletion)}
              </span>
              <span className="token-usage__breakdown-label">Output</span>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasData && (
        <div className="token-usage__empty">
          <TrendingUp size={32} className="token-usage__empty-icon" aria-hidden="true" />
          <p className="token-usage__empty-text">No token usage yet</p>
          <p className="token-usage__empty-hint">Token data will appear here when agents start processing</p>
        </div>
      )}

      {/* Per-Agent Bar Chart */}
      {hasData && agentData.length > 0 && (
        <div className="token-usage__section">
          <h4 className="token-usage__section-title">Per-Agent Usage</h4>
          <div className="token-usage__chart" role="list" aria-label="Token usage by agent">
            {agentData.map((agent) => {
              const barWidth = maxAgentTokens > 0 ? (agent.totalTokens / maxAgentTokens) * 100 : 0;
              const promptWidth =
                agent.totalTokens > 0 ? (agent.promptTokens / agent.totalTokens) * 100 : 0;
              const completionWidth =
                agent.totalTokens > 0 ? (agent.completionTokens / agent.totalTokens) * 100 : 0;

              return (
                <div
                  key={agent.agentId}
                  className="token-usage__bar-row"
                  role="listitem"
                >
                  <span className="token-usage__bar-label" title={agent.agentId}>
                    {agent.agentId}
                  </span>
                  <div className="token-usage__bar-container">
                    <div
                      className="token-usage__bar"
                      style={{ width: `${barWidth}%` }}
                      aria-label={`${agent.agentId}: ${formatFullNumber(agent.totalTokens)} tokens`}
                    >
                      {/* Input segment */}
                      <div
                        className="token-usage__bar-segment token-usage__bar-segment--input"
                        style={{ width: `${promptWidth}%` }}
                        title={`Input: ${formatFullNumber(agent.promptTokens)} tokens`}
                      />
                      {/* Output segment */}
                      <div
                        className="token-usage__bar-segment token-usage__bar-segment--output"
                        style={{ width: `${completionWidth}%` }}
                        title={`Output: ${formatFullNumber(agent.completionTokens)} tokens`}
                      />
                    </div>
                  </div>
                  <span className="token-usage__bar-value numeric">
                    {formatTokenCount(agent.totalTokens)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="token-usage__legend">
            <div className="token-usage__legend-item">
              <span className="token-usage__legend-color token-usage__legend-color--input" />
              <span className="token-usage__legend-label">Input</span>
            </div>
            <div className="token-usage__legend-item">
              <span className="token-usage__legend-color token-usage__legend-color--output" />
              <span className="token-usage__legend-label">Output</span>
            </div>
          </div>
        </div>
      )}

      {/* Per-Model Stacked Bar */}
      {hasData && modelData.length > 0 && (
        <div className="token-usage__section">
          <h4 className="token-usage__section-title">Per-Model Usage</h4>
          <div className="token-usage__model-bar-container">
            <div
              className="token-usage__model-bar"
              role="img"
              aria-label={`Token usage by model: ${modelData
                .map((m) => `${m.model}: ${formatTokenCount(m.totalTokens)}`)
                .join(', ')}`}
            >
              {modelData.map((model, index) => {
                const segmentWidth =
                  totalTokens > 0 ? (model.totalTokens / totalTokens) * 100 : 0;
                const color = getModelColor(index);

                return (
                  <div
                    key={model.model}
                    className="token-usage__model-segment"
                    style={{
                      width: `${segmentWidth}%`,
                      backgroundColor: color,
                    }}
                    title={`${model.model}: ${formatFullNumber(model.totalTokens)} tokens (${formatTokenCount(model.promptTokens)} in / ${formatTokenCount(model.completionTokens)} out)`}
                  />
                );
              })}
            </div>
            <span className="token-usage__model-total numeric">
              {formatTokenCount(totalTokens)}
            </span>
          </div>

          {/* Model Legend */}
          <div className="token-usage__model-legend">
            {modelData.map((model, index) => {
              const color = getModelColor(index);
              const percentage = totalTokens > 0 ? ((model.totalTokens / totalTokens) * 100).toFixed(1) : '0';

              return (
                <div key={model.model} className="token-usage__model-legend-item">
                  <span
                    className="token-usage__model-legend-color"
                    style={{ backgroundColor: color }}
                  />
                  <span className="token-usage__model-legend-name" title={model.model}>
                    {model.model}
                  </span>
                  <span className="token-usage__model-legend-value numeric">
                    {formatTokenCount(model.totalTokens)}
                  </span>
                  <span className="token-usage__model-legend-percent numeric">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenUsage;
