import { useState, useEffect, useCallback } from 'react';
import { Activity, Users, List, BarChart3, Cpu, Menu, X } from 'lucide-react';
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
 * Mobile tab types for navigation
 */
type MobileTab = 'agents' | 'activity' | 'tokens' | 'models';

/**
 * App - Main dashboard layout for AgentViz
 * 
 * Features:
 * - Header with title, subtitle, and connection status
 * - Three-column layout: AgentList (25%), ActivityFeed (50%), TokenUsage+ModelSwitches (25%)
 * - Responsive: mobile tab navigation on small screens
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

  // Mobile state
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('agents');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if mobile view (for conditional rendering)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Handle mobile tab change
  const handleTabChange = useCallback((tab: MobileTab) => {
    setActiveMobileTab(tab);
    setIsMobileMenuOpen(false);
  }, []);

  // Mobile tab configuration
  const mobileTabs = [
    { id: 'agents' as MobileTab, label: 'Agents', icon: Users },
    { id: 'activity' as MobileTab, label: 'Activity', icon: List },
    { id: 'tokens' as MobileTab, label: 'Tokens', icon: BarChart3 },
    { id: 'models' as MobileTab, label: 'Models', icon: Cpu },
  ];

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
        <button
          className="app-header__menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Tab Navigation */}
      {isMobile && (
        <nav className="mobile-tabs" role="tablist" aria-label="Dashboard sections">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`mobile-tabs__button ${activeMobileTab === tab.id ? 'mobile-tabs__button--active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                role="tab"
                aria-selected={activeMobileTab === tab.id}
                aria-controls={`panel-${tab.id}`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Dashboard */}
      <main className="app-main">
        <div className="dashboard-grid">
          {/* Left Column - Agent List (25%) */}
          <section 
            className={`dashboard-column dashboard-column--left ${isMobile && activeMobileTab === 'agents' ? 'dashboard-column--active' : ''}`}
            aria-label="Agent List"
            role="tabpanel"
            id="panel-agents"
            aria-hidden={isMobile ? activeMobileTab !== 'agents' : false}
          >
            <GlassCard title="Agents" className="dashboard-card">
              <AgentList
                agents={activitiesList}
                selectedAgentId={selectedAgentId}
                onSelectAgent={handleSelectAgent}
                maxHeight={isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 280px)'}
              />
            </GlassCard>
          </section>

          {/* Center Column - Activity Feed (50%) */}
          <section 
            className={`dashboard-column dashboard-column--center ${isMobile && activeMobileTab === 'activity' ? 'dashboard-column--active' : ''}`}
            aria-label="Activity Feed"
            role="tabpanel"
            id="panel-activity"
            aria-hidden={isMobile ? activeMobileTab !== 'activity' : false}
          >
            <GlassCard title="Activity Feed" className="dashboard-card">
              <ActivityFeed
                events={events}
                maxHeight={isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 280px)'}
                maxEvents={100}
              />
            </GlassCard>
          </section>

          {/* Right Column - Token Usage & Model Switches (25%) */}
          <section 
            className={`dashboard-column dashboard-column--right ${isMobile && (activeMobileTab === 'tokens' || activeMobileTab === 'models') ? 'dashboard-column--active' : ''}`}
            aria-label="Token Usage and Model Switches"
            role="tabpanel"
            id="panel-tokens"
            aria-hidden={isMobile ? activeMobileTab !== 'tokens' && activeMobileTab !== 'models' : false}
          >
            {(!isMobile || activeMobileTab === 'tokens') && (
              <GlassCard title="Token Usage" className="dashboard-card dashboard-card--half">
                <TokenUsage agents={activitiesList} />
              </GlassCard>
            )}
            {(!isMobile || activeMobileTab === 'models') && (
              <GlassCard title="Model Switches" className="dashboard-card dashboard-card--half">
                <ModelSwitches
                  events={events}
                  maxHeight={isMobile ? 'calc(100vh - 280px)' : 'calc(50vh - 180px)'}
                  maxSwitches={50}
                />
              </GlassCard>
            )}
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
