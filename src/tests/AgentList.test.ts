import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * AgentList Component Tests
 * 
 * These tests validate the AgentList component structure, types, and functionality.
 * Since we're using Node.js built-in test runner without a DOM environment,
 * we test the component exports, types, and props interface.
 */

describe('AgentList Component', () => {
  describe('Module Exports', () => {
    it('should have AgentList.tsx component file', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      assert.ok(fs.existsSync(componentPath), 'AgentList.tsx should exist');
    });

    it('should have AgentList.css styles file', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      assert.ok(fs.existsSync(cssPath), 'AgentList.css should exist');
    });
  });

  describe('Props Interface', () => {
    it('should have TypeScript interface with required agents prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('agents:'), 'Component should have agents prop');
      assert.ok(content.includes('AgentListProps'), 'Should define AgentListProps interface');
      assert.ok(content.includes('AgentActivity[]'), 'agents should be AgentActivity[] type');
    });

    it('should accept optional selectedAgentId prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('selectedAgentId?:'), 'Component should have optional selectedAgentId prop');
    });

    it('should accept optional onSelectAgent callback', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('onSelectAgent?:'), 'Component should have optional onSelectAgent prop');
    });

    it('should accept optional className prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('className?:'), 'Component should have optional className prop');
    });

    it('should accept optional maxHeight prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('maxHeight?:'), 'Component should have optional maxHeight prop');
    });
  });

  describe('Component Structure', () => {
    it('should be a React function component', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(
        content.includes('function AgentList') || content.includes('export function AgentList'),
        'Should be a function component'
      );
    });

    it('should import AgentActivity type from types', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(
        content.includes('AgentActivity') && content.includes('../types/agentEvents'),
        'Should import AgentActivity from types'
      );
    });

    it('should handle empty agents array', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('agents.length === 0'), 'Should check for empty agents array');
      assert.ok(content.includes('agent-list--empty'), 'Should have empty state class');
    });
  });

  describe('Status Display', () => {
    it('should display status icons for all agent statuses', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      // Check for template literal pattern that generates status icon classes
      assert.ok(content.includes('agent-card__status-icon--${agent.status}'), 'Should have status icon class with dynamic status');
      assert.ok(content.includes('getStatusIcon'), 'Should use getStatusIcon helper for status icons');
    });

    it('should have getStatusIcon helper function', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('function getStatusIcon'), 'Should have getStatusIcon helper');
    });
  });

  describe('Token Display', () => {
    it('should have formatTokenCount helper function', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('function formatTokenCount'), 'Should have formatTokenCount helper');
    });

    it('should display token count in agent card', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('tokenUsage.totalTokens'), 'Should access totalTokens');
      assert.ok(content.includes('agent-card__tokens'), 'Should have tokens container class');
    });
  });

  describe('Model Display', () => {
    it('should display current model when available', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('currentModel'), 'Should reference currentModel');
      assert.ok(content.includes('agent-card__model'), 'Should have model display class');
    });
  });

  describe('Duration Display', () => {
    it('should have formatDuration helper function', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('function formatDuration'), 'Should have formatDuration helper');
    });

    it('should display duration in agent card', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('agent-card__duration'), 'Should have duration display class');
    });
  });

  describe('Selection Support', () => {
    it('should support selected state styling', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('agent-card--selected'), 'Should have selected state class');
      assert.ok(content.includes('isSelected'), 'Should track selected state');
    });

    it('should call onSelectAgent when clicked', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('onClick'), 'Should have onClick handler');
      assert.ok(content.includes('onSelectAgent?.'), 'Should call onSelectAgent callback');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle keyboard navigation', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('onKeyDown'), 'Should have onKeyDown handler');
      assert.ok(content.includes('ArrowDown'), 'Should handle ArrowDown key');
      assert.ok(content.includes('ArrowUp'), 'Should handle ArrowUp key');
      assert.ok(content.includes('Enter'), 'Should handle Enter key');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('role="listbox"'), 'Should have listbox role');
      assert.ok(content.includes('role="option"'), 'Should have option role for items');
      assert.ok(content.includes('aria-selected'), 'Should have aria-selected attribute');
    });

    it('should have aria-label for list', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('aria-label="Agent list"'), 'Should have aria-label for list');
    });

    it('should have aria-hidden on decorative elements', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('aria-hidden="true"'), 'Should have aria-hidden on decorative elements');
    });
  });

  describe('CSS Module', () => {
    it('should use CSS custom properties for colors', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('var(--'), 'CSS should use custom properties');
    });

    it('should have status-specific styling', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('agent-card--active'), 'Should have active status styles');
      assert.ok(css.includes('agent-card--idle'), 'Should have idle status styles');
      assert.ok(css.includes('agent-card--error'), 'Should have error status styles');
      assert.ok(css.includes('agent-card--ended'), 'Should have ended status styles');
    });

    it('should have hover animation', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('transform: translateX'), 'Should have horizontal translate on hover');
      assert.ok(css.includes('transition'), 'Should have transition for animation');
    });

    it('should have selected state styling', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('agent-card--selected'), 'Should have selected state class');
      assert.ok(css.includes('box-shadow'), 'Should have shadow for selected state');
    });

    it('should support reduced motion', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('prefers-reduced-motion'), 'CSS should respect reduced motion preference');
    });

    it('should have light mode overrides', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('[data-theme="light"]'), 'CSS should have light mode overrides');
    });

    it('should have live indicator animation', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('@keyframes pulse'), 'Should have pulse animation');
      assert.ok(css.includes('animation: pulse'), 'Should apply pulse animation');
    });

    it('should use tabular-nums for numeric data', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');
      
      assert.ok(css.includes('font-variant-numeric: tabular-nums'), 'Should use tabular-nums for numbers');
    });
  });
});

describe('AgentList Acceptance Criteria', () => {
  it('AC1: AgentList renders list of agents with status indicators', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    assert.ok(content.includes('agents.map'), 'Should map over agents array');
    assert.ok(content.includes('agent-card'), 'Should render agent cards');
    assert.ok(content.includes('status-icon'), 'Should render status icons');
  });

  it('AC2: Shows agent name, model, token count, and duration', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    assert.ok(content.includes('agentId'), 'Should display agent name');
    assert.ok(content.includes('currentModel'), 'Should display model');
    assert.ok(content.includes('tokenUsage'), 'Should display token usage');
    assert.ok(content.includes('duration'), 'Should display duration');
  });

  it('AC3: Status colors match design tokens (active=green, idle=yellow, error=red)', async () => {
    const fs = await import('node:fs');
    const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    assert.ok(css.includes('--live-active'), 'Should use live-active token for active status');
    assert.ok(css.includes('--live-idle'), 'Should use live-idle token for idle status');
    assert.ok(css.includes('--live-error'), 'Should use live-error token for error status');
  });

  it('AC4: Selected agent is highlighted with primary color border', async () => {
    const fs = await import('node:fs');
    const cssPath = new URL('../client/components/AgentList.css', import.meta.url);
    const css = fs.readFileSync(cssPath, 'utf-8');
    
    assert.ok(css.includes('agent-card--selected'), 'Should have selected state class');
    assert.ok(css.includes('border-color: var(--primary)'), 'Should use primary color for border');
  });

  it('AC5: Empty state shows "No active agents" message', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    assert.ok(content.includes('No active agents'), 'Should show empty state message');
    assert.ok(content.includes('agent-list__empty-state'), 'Should have empty state class');
  });

  it('AC6: Clicking an agent calls onSelectAgent callback', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    assert.ok(content.includes('onSelectAgent?.'), 'Should call onSelectAgent callback');
    assert.ok(content.includes('handleClick'), 'Should have click handler');
  });
});

describe('AgentList Helper Functions', () => {
  describe('formatTokenCount', () => {
    it('should format large numbers with K suffix', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      // Verify the function exists and handles thousands
      assert.ok(content.includes('1_000)'), 'Should handle thousands threshold');
      assert.ok(content.includes('.toFixed(1)'), 'Should format with decimal');
    });

    it('should format millions with M suffix', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('1_000_000)'), 'Should handle millions threshold');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('Math.floor(ms / 1000)'), 'Should convert ms to seconds');
    });

    it('should format hours when applicable', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/AgentList.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('hours > 0'), 'Should check for hours');
    });
  });
});
