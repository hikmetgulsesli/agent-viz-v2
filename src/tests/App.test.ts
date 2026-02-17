/**
 * App component tests
 * 
 * Tests for the main dashboard layout component
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const testsDir = join(process.cwd(), 'src', 'tests');

describe('App Component', () => {
  describe('File Structure', () => {
    it('should have App.tsx in src directory', () => {
      const appPath = join(srcDir, 'App.tsx');
      assert.strictEqual(existsSync(appPath), true, 'App.tsx should exist');
    });

    it('should have App.css in src directory', () => {
      const cssPath = join(srcDir, 'App.css');
      assert.strictEqual(existsSync(cssPath), true, 'App.css should exist');
    });
  });

  describe('App.tsx Content', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should import useWebSocket hook', () => {
      assert.ok(
        appContent.includes("import { useWebSocket }") ||
        appContent.includes('from \'./client/hooks/useWebSocket\''),
        'Should import useWebSocket hook'
      );
    });

    it('should import useAgentActivities hook', () => {
      assert.ok(
        appContent.includes("import { useAgentActivities }") ||
        appContent.includes('from \'./client/hooks/useAgentActivities\''),
        'Should import useAgentActivities hook'
      );
    });

    it('should import all dashboard components', () => {
      const requiredImports = [
        'GlassCard',
        'AgentList',
        'ActivityFeed',
        'TokenUsage',
        'ModelSwitches',
        'ConnectionStatus'
      ];

      for (const importName of requiredImports) {
        assert.ok(
          appContent.includes(importName),
          `Should import ${importName} component`
        );
      }
    });

    it('should import AgentEvent type', () => {
      assert.ok(
        appContent.includes('AgentEvent'),
        'Should import AgentEvent type'
      );
    });

    it('should import Lucide Activity icon', () => {
      assert.ok(
        appContent.includes("import { Activity }") ||
        appContent.includes("from 'lucide-react'"),
        'Should import Activity icon from lucide-react'
      );
    });

    it('should import App.css', () => {
      assert.ok(
        appContent.includes("import './App.css'"),
        'Should import App.css'
      );
    });
  });

  describe('Header Structure', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should have header element', () => {
      assert.ok(
        appContent.includes('<header'),
        'Should have header element'
      );
    });

    it('should have app-header class on header', () => {
      assert.ok(
        appContent.includes('className="app-header"'),
        'Header should have app-header class'
      );
    });

    it('should display AgentViz title', () => {
      assert.ok(
        appContent.includes('AgentViz'),
        'Should display AgentViz title'
      );
    });

    it('should have subtitle', () => {
      assert.ok(
        appContent.includes('Real-time Agent Activity Dashboard') ||
        appContent.includes('subtitle'),
        'Should have subtitle text or class'
      );
    });

    it('should include ConnectionStatus component', () => {
      assert.ok(
        appContent.includes('<ConnectionStatus'),
        'Should include ConnectionStatus component'
      );
    });
  });

  describe('Three-Column Layout', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should have main element', () => {
      assert.ok(
        appContent.includes('<main'),
        'Should have main element'
      );
    });

    it('should have dashboard-grid class', () => {
      assert.ok(
        appContent.includes('className="dashboard-grid"'),
        'Should have dashboard-grid class'
      );
    });

    it('should have three section elements for columns', () => {
      const sectionMatches = appContent.match(/<section/g);
      assert.ok(
        sectionMatches && sectionMatches.length >= 3,
        'Should have at least three section elements for columns'
      );
    });

    it('should have left column with AgentList', () => {
      assert.ok(
        appContent.includes('dashboard-column--left') ||
        (appContent.includes('AgentList') && appContent.includes('dashboard-column')),
        'Should have left column with AgentList'
      );
    });

    it('should have center column with ActivityFeed', () => {
      assert.ok(
        appContent.includes('dashboard-column--center') ||
        (appContent.includes('ActivityFeed') && appContent.includes('dashboard-column')),
        'Should have center column with ActivityFeed'
      );
    });

    it('should have right column with TokenUsage and ModelSwitches', () => {
      assert.ok(
        appContent.includes('dashboard-column--right') ||
        (appContent.includes('TokenUsage') && appContent.includes('ModelSwitches')),
        'Should have right column with TokenUsage and ModelSwitches'
      );
    });

    it('should use GlassCard for each panel', () => {
      const glassCardMatches = appContent.match(/<GlassCard/g);
      assert.ok(
        glassCardMatches && glassCardMatches.length >= 3,
        'Should use GlassCard for at least 3 panels'
      );
    });
  });

  describe('Component Integration', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should pass activitiesList to AgentList', () => {
      assert.ok(
        appContent.includes('agents={activitiesList}'),
        'Should pass activitiesList to AgentList agents prop'
      );
    });

    it('should pass events to ActivityFeed', () => {
      assert.ok(
        appContent.includes('events={events}'),
        'Should pass events to ActivityFeed'
      );
    });

    it('should pass activitiesList to TokenUsage', () => {
      assert.ok(
        appContent.includes('agents={activitiesList}'),
        'Should pass activitiesList to TokenUsage agents prop'
      );
    });

    it('should pass events to ModelSwitches', () => {
      assert.ok(
        appContent.includes('events={events}'),
        'Should pass events to ModelSwitches'
      );
    });

    it('should handle agent selection', () => {
      assert.ok(
        appContent.includes('selectedAgentId') &&
        appContent.includes('onSelectAgent'),
        'Should handle agent selection with selectedAgentId and onSelectAgent'
      );
    });

    it('should track lastUpdate for connection status', () => {
      assert.ok(
        appContent.includes('lastUpdate') &&
        appContent.includes('setLastUpdate'),
        'Should track lastUpdate timestamp'
      );
    });
  });

  describe('Footer', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should have footer element', () => {
      assert.ok(
        appContent.includes('<footer'),
        'Should have footer element'
      );
    });

    it('should display stats in footer', () => {
      assert.ok(
        appContent.includes('activitiesList.length') ||
        appContent.includes('totalTokenUsage') ||
        appContent.includes('events.length'),
        'Should display stats in footer'
      );
    });
  });

  describe('WebSocket Integration', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should use useWebSocket hook', () => {
      assert.ok(
        appContent.includes('useWebSocket()'),
        'Should call useWebSocket hook'
      );
    });

    it('should use useAgentActivities hook', () => {
      assert.ok(
        appContent.includes('useAgentActivities()'),
        'Should call useAgentActivities hook'
      );
    });

    it('should process events from WebSocket', () => {
      assert.ok(
        appContent.includes('processEvent') ||
        appContent.includes('lastMessage'),
        'Should process events from WebSocket'
      );
    });

    it('should use useEffect for message handling', () => {
      assert.ok(
        appContent.includes('useEffect'),
        'Should use useEffect for side effects'
      );
    });
  });
});

describe('App CSS', () => {
  const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');

  describe('Layout Structure', () => {
    it('should have app container styles', () => {
      assert.ok(
        cssContent.includes('.app'),
        'Should have .app class'
      );
    });

    it('should have app-header styles', () => {
      assert.ok(
        cssContent.includes('.app-header'),
        'Should have .app-header class'
      );
    });

    it('should have dashboard-grid styles', () => {
      assert.ok(
        cssContent.includes('.dashboard-grid'),
        'Should have .dashboard-grid class'
      );
    });

    it('should have three-column grid layout', () => {
      assert.ok(
        cssContent.includes('grid-template-columns') &&
        (cssContent.includes('1fr 2fr 1fr') || cssContent.includes('25% 50% 25%')),
        'Should have three-column grid layout (25% - 50% - 25%)'
      );
    });

    it('should have dashboard-column styles', () => {
      assert.ok(
        cssContent.includes('.dashboard-column'),
        'Should have .dashboard-column class'
      );
    });

    it('should have left, center, and right column modifiers', () => {
      assert.ok(
        cssContent.includes('.dashboard-column--left'),
        'Should have .dashboard-column--left modifier'
      );
      assert.ok(
        cssContent.includes('.dashboard-column--center'),
        'Should have .dashboard-column--center modifier'
      );
      assert.ok(
        cssContent.includes('.dashboard-column--right'),
        'Should have .dashboard-column--right modifier'
      );
    });

    it('should have dashboard-stacked for right column', () => {
      assert.ok(
        cssContent.includes('.dashboard-stacked'),
        'Should have .dashboard-stacked class for right column'
      );
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile breakpoint at 768px', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 768px)'),
        'Should have mobile breakpoint at 768px'
      );
    });

    it('should have tablet breakpoint at 1024px', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 1024px)'),
        'Should have tablet breakpoint at 1024px'
      );
    });

    it('should stack columns on mobile', () => {
      assert.ok(
        cssContent.includes('flex-direction: column') ||
        cssContent.includes('grid-template-columns: 1fr'),
        'Should stack columns on mobile'
      );
    });

    it('should have small mobile breakpoint at 375px', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 375px)'),
        'Should have small mobile breakpoint at 375px'
      );
    });
  });

  describe('Design Tokens Usage', () => {
    it('should use CSS custom properties for colors', () => {
      assert.ok(
        cssContent.includes('var(--surface)') ||
        cssContent.includes('var(--text)') ||
        cssContent.includes('var(--primary)'),
        'Should use CSS custom properties for colors'
      );
    });

    it('should use CSS custom properties for spacing', () => {
      assert.ok(
        cssContent.includes('var(--space-'),
        'Should use CSS custom properties for spacing'
      );
    });

    it('should use CSS custom properties for typography', () => {
      assert.ok(
        cssContent.includes('var(--font-') ||
        cssContent.includes('var(--text-'),
        'Should use CSS custom properties for typography'
      );
    });

    it('should use CSS custom properties for z-index', () => {
      assert.ok(
        cssContent.includes('var(--z-'),
        'Should use CSS custom properties for z-index'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have reduced motion support', () => {
      assert.ok(
        cssContent.includes('prefers-reduced-motion'),
        'Should support prefers-reduced-motion'
      );
    });

    it('should have light mode support', () => {
      assert.ok(
        cssContent.includes('[data-theme="light"]'),
        'Should support light mode'
      );
    });
  });

  describe('Header Styling', () => {
    it('should have sticky header', () => {
      assert.ok(
        cssContent.includes('position: sticky') ||
        cssContent.includes('sticky;'),
        'Header should be sticky'
      );
    });

    it('should have logo styling with gradient', () => {
      assert.ok(
        cssContent.includes('app-header__logo') &&
        cssContent.includes('linear-gradient'),
        'Should have logo with gradient styling'
      );
    });
  });

  describe('Footer Styling', () => {
    it('should have app-footer styles', () => {
      assert.ok(
        cssContent.includes('.app-footer'),
        'Should have .app-footer class'
      );
    });

    it('should have stats styling in footer', () => {
      assert.ok(
        cssContent.includes('app-footer__stats') ||
        cssContent.includes('app-footer__stat'),
        'Should have footer stats styling'
      );
    });
  });
});

describe('Acceptance Criteria', () => {
  const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');
  const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');

  it('AC1: Header displays title and connection status', () => {
    assert.ok(
      appContent.includes('AgentViz') &&
      appContent.includes('<ConnectionStatus'),
      'Header should display title and connection status'
    );
  });

  it('AC2: Three-column layout on desktop', () => {
    assert.ok(
      cssContent.includes('grid-template-columns') &&
      (cssContent.includes('1fr 2fr 1fr') || cssContent.includes('25% 50% 25%')),
      'Should have three-column layout on desktop (25% - 50% - 25%)'
    );
  });

  it('AC3: Responsive stacked layout on mobile', () => {
    assert.ok(
      cssContent.includes('@media (max-width: 768px)') &&
      (cssContent.includes('flex-direction: column') ||
       cssContent.includes('grid-template-columns: 1fr')),
      'Should have responsive stacked layout on mobile'
    );
  });

  it('AC4: All components render with data from useWebSocket', () => {
    assert.ok(
      appContent.includes('useWebSocket') &&
      appContent.includes('AgentList') &&
      appContent.includes('ActivityFeed') &&
      appContent.includes('TokenUsage') &&
      appContent.includes('ModelSwitches') &&
      appContent.includes('ConnectionStatus'),
      'All components should render with data from useWebSocket'
    );
  });
});
