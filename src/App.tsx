import { useState, useEffect, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { useWebSocket } from './client/hooks/useWebSocket';
import { useAgentActivities } from './client/hooks/useAgentActivities';
import type { AgentEvent } from './client/types/agentEvents';
import { GlassCard } from './client/components/GlassCard';
import { AgentList } from './client/components/AgentList';
import { ActivityFeed } from './client/components/ActivityFeed';
import { TokenUsage } from './client/components/TokenUsage';
import { ModelSwitches } from './client/components/ModelSwitches';
import { ConnectionStatus } from './client/components/ConnectionStatus';
import './App.css';

/**
 * App - Main dashboard layout for AgentViz
 * 
 * Features:
 * - Header with title, subtitle, and connection status
 * - Three-column layout: AgentList (25%), ActivityFeed (50%), TokenUsage+ModelSwitches (25%)
 * - Responsive: stacks columns on mobile
 * - Integrates useWebSocket and useAgentActivities for real-time data
 */
function App() {
  // WebSocket connection
  const { status, lastMessage } = useWebSocket();
  
  // Agent activities state management
  const { 
    activitiesList, 
    processEvent, 
    totalTokenUsage 
  } = useAgentActivities();
  
  // Selected agent for detail view
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  
  // Event history for activity feed and model switches
  const [events, setEvents] = useState<AgentEvent[]>([]);
  
  // Track last update timestamp for connection status
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Process incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    const timestamp = Date.now();
    setLastUpdate(timestamp);

    // Handle agent_event type messages
    if (lastMessage.type === 'agent_event' && lastMessage.payload) {
      const payload = lastMessage.payload as AgentEvent;
      
      // Process event in agent activities
      processEvent(payload);
      
      // Add to event history
      setEvents((prev) => [...prev, payload].slice(-100)); // Keep last 100 events
    }
  }, [lastMessage, processEvent]);

  // Handle agent selection
  const handleSelectAgent = useCallback((agentId: string) => {
    setSelectedAgentId((prev) => (prev === agentId ? undefined : agentId));
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__logo">
            <Activity size={28} aria-hidden="true" />
          </div>
          <div className="app-header__text">
            <h1 className="app-header__title">AgentViz</h1>
            <p className="app-header__subtitle">Real-time Agent Activity Dashboard</p>
          </div>
        </div>
        <div className="app-header__status">
          <ConnectionStatus 
            status={status} 
            lastUpdate={lastUpdate}
          />
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="app-main">
        <div className="dashboard-grid">
          {/* Left Column - Agent List (25%) */}
          <section className="dashboard-column dashboard-column--left" aria-label="Agent List">
            <GlassCard title="Agents" className="dashboard-card">
              <AgentList
                agents={activitiesList}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
                maxHeight="calc(100vh - 280px)"
              />
            </GlassCard>
          </section>

          {/* Center Column - Activity Feed (50%) */}
          <section className="dashboard-column dashboard-column--center" aria-label="Activity Feed">
            <GlassCard title="Activity Feed" className="dashboard-card">
              <ActivityFeed
                events={events}
                maxHeight="calc(100vh - 280px)"
                maxEvents={100}
              />
            </GlassCard>
          </section>

          {/* Right Column - Token Usage & Model Switches (25%) */}
          <section className="dashboard-column dashboard-column--right" aria-label="Token Usage and Model Switches">
            <div className="dashboard-stacked">
              <GlassCard title="Token Usage" className="dashboard-card dashboard-card--half">
                <TokenUsage agents={activitiesList} />
              </GlassCard>
              <GlassCard title="Model Switches" className="dashboard-card dashboard-card--half">
                <ModelSwitches
                  events={events}
                  maxHeight="calc(50vh - 180px)"
                  maxSwitches={50}
                />
              </GlassCard>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="app-footer__text">
          AgentViz v2 — Real-time Agent Activity Visualization
        </p>
        <div className="app-footer__stats">
          <span className="app-footer__stat">
            <span className="app-footer__stat-value numeric">{activitiesList.length}</span>
            <span className="app-footer__stat-label">Agents</span>
          </span>
          <span className="app-footer__stat">
            <span className="app-footer__stat-value numeric">
              {totalTokenUsage.totalTokens.toLocaleString()}
            </span>
            <span className="app-footer__stat-label">Tokens</span>
          </span>
          <span className="app-footer__stat">
            <span className="app-footer__stat-value numeric">{events.length}</span>
            <span className="app-footer__stat-label">Events</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
