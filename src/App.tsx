import { useState, useEffect, useMemo } from 'react';
import { Activity, Cpu, Users } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { AgentList } from './components/AgentList';
import { ActivityFeed } from './components/ActivityFeed';
import { TokenUsage } from './components/TokenUsage';
import { ModelSwitches } from './components/ModelSwitches';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlassCard } from './components/GlassCard';
import type { Agent, AgentEvent } from './types/agent';
import './App.css';

// WebSocket URL from environment or default
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:18789';

/**
 * Convert WebSocket events to Agent activities map
 */
function processEventsToActivities(events: AgentEvent[]): Map<string, Agent> {
  const activities = new Map<string, Agent>();

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  for (const event of sortedEvents) {
    const { agentId, eventType, payload, timestamp } = event;

    switch (eventType) {
      case 'agent_started': {
        const { name, model } = payload as { name: string; model: string };
        activities.set(agentId, {
          id: agentId,
          name,
          status: 'running',
          currentModel: model,
          tools: [],
          tokensUsed: { input: 0, output: 0, total: 0 },
          startedAt: timestamp,
        });
        break;
      }

      case 'agent_ended': {
        const agent = activities.get(agentId);
        if (agent) {
          agent.status = 'idle';
          agent.endedAt = timestamp;
          activities.set(agentId, agent);
        }
        break;
      }

      case 'tool_called': {
        const agent = activities.get(agentId);
        if (agent) {
          const { toolName, args } = payload as { toolName: string; args: Record<string, unknown> };
          agent.tools.push({
            name: toolName,
            args,
            startedAt: timestamp,
          });
          activities.set(agentId, agent);
        }
        break;
      }

      case 'model_switched': {
        const agent = activities.get(agentId);
        if (agent) {
          const { newModel } = payload as { previousModel: string; newModel: string };
          agent.currentModel = newModel;
          activities.set(agentId, agent);
        }
        break;
      }

      case 'token_update': {
        const agent = activities.get(agentId);
        if (agent) {
          const { input, output } = payload as { input: number; output: number };
          agent.tokensUsed.input += input;
          agent.tokensUsed.output += output;
          agent.tokensUsed.total += input + output;
          activities.set(agentId, agent);
        }
        break;
      }

      case 'heartbeat': {
        const agent = activities.get(agentId);
        if (agent) {
          const { status } = payload as { agentId: string; status: Agent['status'] };
          agent.status = status;
          activities.set(agentId, agent);
        }
        break;
      }
    }
  }

  return activities;
}

/**
 * Main App component - Dashboard layout with all sub-components
 */
function App() {
  const { status, events, reconnect } = useWebSocket({
    url: WS_URL,
    maxEvents: 1000,
  });

  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Process events to activities
  const activities = useMemo(() => {
    return processEventsToActivities(events);
  }, [events]);

  // Update last update time when events change
  useEffect(() => {
    if (events.length > 0) {
      setLastUpdateTime(Date.now());
    }
  }, [events]);

  // Format last update time
  const formatLastUpdate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__header-content">
          <div className="app__title-section">
            <h1 className="app__title">
              <Activity className="app__title-icon" aria-hidden="true" />
              AgentViz
            </h1>
            <p className="app__subtitle">OpenClaw Agent Activity Dashboard</p>
          </div>
          <div className="app__status-section">
            <ConnectionStatus
              status={status}
              onReconnect={reconnect}
            />
            <span className="app__last-update" data-testid="last-update">
              Updated: {formatLastUpdate(lastUpdateTime)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content with ErrorBoundary */}
      <ErrorBoundary>
        <main className="app__main" data-testid="app-main">
          <div className="app__dashboard">
            {/* Left Column - Agent List */}
            <section className="app__column app__column--left" data-testid="column-left">
              <GlassCard title="Agents">
                <div className="app__card-header">
                  <Users className="app__card-icon" aria-hidden="true" />
                  <span className="app__card-count" data-testid="agent-count">
                    {activities.size} active
                  </span>
                </div>
                <AgentList activities={activities} />
              </GlassCard>
            </section>

            {/* Center Column - Activity Feed */}
            <section className="app__column app__column--center" data-testid="column-center">
              <GlassCard title="Activity Feed">
                <ActivityFeed events={events} maxEvents={100} />
              </GlassCard>
            </section>

            {/* Right Column - Token Usage & Model Switches */}
            <section className="app__column app__column--right" data-testid="column-right">
              <GlassCard title="Token Usage">
                <TokenUsage activities={activities} />
              </GlassCard>
              <GlassCard title="Model Info" className="app__card--mt">
                <div className="app__card-header">
                  <Cpu className="app__card-icon" aria-hidden="true" />
                </div>
                <ModelSwitches events={events} />
              </GlassCard>
            </section>
          </div>
        </main>
      </ErrorBoundary>

      {/* Footer */}
      <footer className="app__footer">
        <p className="app__footer-text">
          Connected to {WS_URL} • {events.length} events received
        </p>
      </footer>
    </div>
  );
}

export default App;
