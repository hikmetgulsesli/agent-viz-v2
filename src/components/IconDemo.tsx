import { Activity, Wifi, WifiOff, Users, Cpu } from 'lucide-react';
import './IconDemo.css';

/**
 * IconDemo component - demonstrates Lucide React icons are working
 * This component serves as a test that icons are properly installed
 */
export function IconDemo() {
  return (
    <div className="icon-demo" data-testid="icon-demo">
      <h2 className="icon-demo__title">AgentViz Dashboard</h2>
      <div className="icon-demo__grid">
        <div className="icon-demo__item" data-testid="icon-activity">
          <Activity className="icon-demo__icon icon-demo__icon--primary" aria-label="Activity" />
          <span className="icon-demo__label">Activity</span>
        </div>
        <div className="icon-demo__item" data-testid="icon-wifi">
          <Wifi className="icon-demo__icon icon-demo__icon--success" aria-label="Connected" />
          <span className="icon-demo__label">Connected</span>
        </div>
        <div className="icon-demo__item" data-testid="icon-wifi-off">
          <WifiOff className="icon-demo__icon icon-demo__icon--error" aria-label="Disconnected" />
          <span className="icon-demo__label">Disconnected</span>
        </div>
        <div className="icon-demo__item" data-testid="icon-users">
          <Users className="icon-demo__icon icon-demo__icon--accent" aria-label="Agents" />
          <span className="icon-demo__label">Agents</span>
        </div>
        <div className="icon-demo__item" data-testid="icon-cpu">
          <Cpu className="icon-demo__icon icon-demo__icon--info" aria-label="Models" />
          <span className="icon-demo__label">Models</span>
        </div>
      </div>
    </div>
  );
}
