import { ArrowRightLeft, Cpu } from 'lucide-react';
import type { AgentEvent, ModelSwitchedPayload, AgentStartedPayload } from '../types/agent';
import './ModelSwitches.css';

export interface ModelSwitchesProps {
  events: AgentEvent[];
}

/**
 * Model switch entry with old and new model info
 */
interface ModelSwitchEntry {
  agentId: string;
  previousModel: string;
  newModel: string;
  timestamp: number;
}

/**
 * Current model info for an agent
 */
interface CurrentModelInfo {
  agentId: string;
  model: string;
  lastUpdated: number;
}

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
 * Extract current model for each agent from events
 */
function extractCurrentModels(events: AgentEvent[]): CurrentModelInfo[] {
  const modelMap = new Map<string, CurrentModelInfo>();

  // Process events in chronological order
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of sortedEvents) {
    if (event.eventType === 'agent_started') {
      const payload = event.payload as AgentStartedPayload;
      modelMap.set(event.agentId, {
        agentId: event.agentId,
        model: payload.model,
        lastUpdated: event.timestamp,
      });
    } else if (event.eventType === 'model_switched') {
      const payload = event.payload as ModelSwitchedPayload;
      modelMap.set(event.agentId, {
        agentId: event.agentId,
        model: payload.newModel,
        lastUpdated: event.timestamp,
      });
    }
  }

  return Array.from(modelMap.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);
}

/**
 * Extract recent model switches from events
 */
function extractModelSwitches(events: AgentEvent[]): ModelSwitchEntry[] {
  const switches: ModelSwitchEntry[] = [];

  for (const event of events) {
    if (event.eventType === 'model_switched') {
      const payload = event.payload as ModelSwitchedPayload;
      switches.push({
        agentId: event.agentId,
        previousModel: payload.previousModel,
        newModel: payload.newModel,
        timestamp: event.timestamp,
      });
    }
  }

  // Sort by timestamp descending (newest first), limit to 10
  return switches
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);
}

/**
 * ModelSwitches component - displays current model per agent and recent model transitions
 */
export function ModelSwitches({ events }: ModelSwitchesProps) {
  const currentModels = extractCurrentModels(events);
  const recentSwitches = extractModelSwitches(events);

  const hasData = currentModels.length > 0 || recentSwitches.length > 0;

  return (
    <div className="model-switches" data-testid="model-switches">
      <div className="model-switches__header">
        <h3 className="model-switches__title">Model Info</h3>
        <ArrowRightLeft className="model-switches__header-icon" aria-label="Model switches" />
      </div>

      {!hasData ? (
        <div className="model-switches__empty" data-testid="model-switches-empty">
          <Cpu className="model-switches__empty-icon" aria-label="No model data" />
          <p className="model-switches__empty-text">No model data available</p>
        </div>
      ) : (
        <div className="model-switches__content">
          {/* Current Models Section */}
          {currentModels.length > 0 && (
            <div className="model-switches__section" data-testid="current-models-section">
              <h4 className="model-switches__section-title">Current Models</h4>
              <div className="model-switches__current-list">
                {currentModels.map((info) => (
                  <div
                    key={info.agentId}
                    className="model-switches__current-item"
                    data-testid="current-model-item"
                  >
                    <div className="model-switches__current-agent">
                      <Cpu className="model-switches__current-icon" aria-label="Model" />
                      <span className="model-switches__agent-name" data-testid="current-agent-name">
                        {info.agentId}
                      </span>
                    </div>
                    <span className="model-switches__model-name" data-testid="current-model-name">
                      {info.model}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transitions Section */}
          {recentSwitches.length > 0 && (
            <div className="model-switches__section" data-testid="transitions-section">
              <h4 className="model-switches__section-title">
                Recent Transitions
                <span className="model-switches__count" data-testid="transitions-count">
                  {recentSwitches.length}
                </span>
              </h4>
              <div className="model-switches__transitions-list">
                {recentSwitches.map((entry, index) => (
                  <div
                    key={`${entry.agentId}-${entry.timestamp}-${index}`}
                    className="model-switches__transition-item"
                    data-testid="model-transition-item"
                  >
                    <div className="model-switches__transition-header">
                      <span className="model-switches__transition-agent" data-testid="transition-agent">
                        {entry.agentId}
                      </span>
                      <span className="model-switches__transition-time" data-testid="transition-timestamp">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <div className="model-switches__transition-models">
                      <span className="model-switches__old-model" data-testid="old-model">
                        {entry.previousModel}
                      </span>
                      <ArrowRightLeft
                        className="model-switches__arrow"
                        aria-label="switched to"
                      />
                      <span className="model-switches__new-model" data-testid="new-model">
                        {entry.newModel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
