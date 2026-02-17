import { Activity, Cpu, Zap } from 'lucide-react'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Activity className="logo-icon" aria-hidden="true" />
          <h1>AgentViz</h1>
        </div>
        <p className="subtitle">Real-time Agent Activity Dashboard</p>
      </header>
      
      <main className="main">
        <div className="feature-grid">
          <div className="feature-card">
            <Cpu className="feature-icon" aria-hidden="true" />
            <h2>Agent Monitoring</h2>
            <p>Track active and idle agents in real-time</p>
          </div>
          
          <div className="feature-card">
            <Zap className="feature-icon" aria-hidden="true" />
            <h2>Live Activity Feed</h2>
            <p>Stream of tool calls and completions</p>
          </div>
          
          <div className="feature-card">
            <Activity className="feature-icon" aria-hidden="true" />
            <h2>Token Analytics</h2>
            <p>Usage visualization per agent and total</p>
          </div>
        </div>
        
        <div className="status-panel">
          <p className="status-text">
            <span className="status-dot" aria-hidden="true" />
            WebSocket: Connecting to {import.meta.env.VITE_OPENCLAW_WS_URL || 'ws://127.0.0.1:18789'}
          </p>
        </div>
      </main>
      
      <footer className="footer">
        <p>AgentViz v2 — Built with React + Vite</p>
      </footer>
    </div>
  )
}

export default App
