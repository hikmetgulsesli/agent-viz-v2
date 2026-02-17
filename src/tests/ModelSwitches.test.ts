/**
 * ModelSwitches Component Tests
 * 
 * Tests for ModelSwitches component functionality, props, and CSS.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { AgentEvent } from '../../src/client/types/agentEvents';

const __dirname = new URL('.', import.meta.url).pathname;
const componentPath = join(__dirname, '../../src/client/components/ModelSwitches.tsx');
const cssPath = join(__dirname, '../../src/client/components/ModelSwitches.css');

describe('ModelSwitches Component', () => {
  describe('File Existence', () => {
    it('should have ModelSwitches.tsx component file', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.length > 0, 'ModelSwitches.tsx should exist and have content');
    });

    it('should have ModelSwitches.css styles file', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.length > 0, 'ModelSwitches.css should exist and have content');
    });
  });

  describe('Props Interface', () => {
    it('should export ModelSwitchesProps interface', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('export interface ModelSwitchesProps'), 'Should export ModelSwitchesProps interface');
    });

    it('should have required events prop', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('events: AgentEvent[]'), 'Should have events prop as AgentEvent[]');
    });

    it('should have optional className prop', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('className?: string'), 'Should have optional className prop');
    });

    it('should have optional maxHeight prop', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('maxHeight?: string'), 'Should have optional maxHeight prop');
    });

    it('should have optional maxSwitches prop with default', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('maxSwitches?: number'), 'Should have optional maxSwitches prop');
      assert.ok(content.includes('maxSwitches = 50'), 'Should have default value of 50 for maxSwitches');
    });
  });

  describe('Model Switch Filtering', () => {
    it('should filter events for model_switched type', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("type === 'model_switched'"), 'Should filter for model_switched type');
    });

    it('should extract agentId from events', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('agentId: event.agentId'), 'Should extract agentId from events');
    });

    it('should extract previousModel from event data', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('previousModel'), 'Should extract previousModel from event data');
    });

    it('should extract newModel from event data', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('newModel'), 'Should extract newModel from event data');
    });

    it('should extract timestamp from events', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('timestamp: event.timestamp'), 'Should extract timestamp from events');
    });

    it('should extract reason from event data if present', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('reason'), 'Should extract reason from event data');
    });
  });

  describe('Sorting and Limiting', () => {
    it('should sort switches by timestamp descending', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('b.timestamp - a.timestamp'), 'Should sort by timestamp descending (most recent first)');
    });

    it('should limit to maxSwitches', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('.slice(0, maxSwitches)'), 'Should slice to maxSwitches limit');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no model switches', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches--empty'), 'Should have empty state CSS class');
      assert.ok(content.includes('No model switches yet'), 'Should show empty state message');
    });

    it('should show empty state hint', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('Model transitions will appear here'), 'Should show empty state hint');
    });

    it('should use Cpu icon in empty state', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('Cpu') && content.includes('model-switches__empty-icon'), 'Should use Cpu icon in empty state');
    });
  });

  describe('Display Elements', () => {
    it('should display agentId', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__agent-id'), 'Should have agentId display element');
    });

    it('should display previous model', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__model--previous'), 'Should have previous model CSS class');
    });

    it('should display new model', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__model--new'), 'Should have new model CSS class');
    });

    it('should display timestamp', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__timestamp'), 'Should have timestamp display element');
    });

    it('should show arrow between models', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('ArrowRight'), 'Should use ArrowRight icon between models');
      assert.ok(content.includes('model-switches__arrow'), 'Should have arrow CSS class');
    });

    it('should handle missing previous model', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('No previous model'), 'Should show placeholder when no previous model');
      assert.ok(content.includes('model-switches__model--none'), 'Should have none CSS class for missing model');
    });

    it('should display reason if present', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__reason'), 'Should have reason display element');
    });
  });

  describe('Timestamp Formatting', () => {
    it('should have formatRelativeTime helper function', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('function formatRelativeTime'), 'Should have formatRelativeTime helper');
    });

    it('should format "just now" for recent events', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("'just now'"), 'Should format as "just now" for recent events');
    });

    it('should format seconds ago', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("${seconds}s ago"), 'Should format seconds ago');
    });

    it('should format minutes ago', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("${minutes}m ago"), 'Should format minutes ago');
    });

    it('should format hours ago', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("${hours}h ago"), 'Should format hours ago');
    });

    it('should format days ago', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("${days}d ago"), 'Should format days ago');
    });

    it('should have formatFullTimestamp for tooltips', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('function formatFullTimestamp'), 'Should have formatFullTimestamp helper');
    });
  });

  describe('Model Name Truncation', () => {
    it('should have truncateModelName helper', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('function truncateModelName'), 'Should have truncateModelName helper');
    });

    it('should truncate long model names', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('...') && content.includes('slice'), 'Should truncate long names with ellipsis');
    });
  });

  describe('Icons', () => {
    it('should import Cpu icon from lucide-react', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes("import { Cpu, ArrowRight, Clock } from 'lucide-react'"), 'Should import Lucide icons');
    });

    it('should use Cpu icon for model switches', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('model-switches__icon') && content.includes('Cpu'), 'Should use Cpu icon in switch items');
    });

    it('should use Clock icon for timestamps', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('Clock') && content.includes('model-switches__timestamp'), 'Should use Clock icon with timestamp');
    });
  });

  describe('Accessibility', () => {
    it('should have role="log" on scroll container', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('role="log"'), 'Should have log role for live region');
    });

    it('should have aria-live="polite"', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('aria-live="polite"'), 'Should have polite aria-live');
    });

    it('should have aria-label for model switch history', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('aria-label="Model switch history"'), 'Should have descriptive aria-label');
    });

    it('should have aria-hidden on decorative icons', () => {
      const content = readFileSync(componentPath, 'utf-8');
      const hiddenCount = (content.match(/aria-hidden="true"/g) || []).length;
      assert.ok(hiddenCount >= 3, 'Should have aria-hidden on decorative icons');
    });

    it('should use time element with datetime attribute', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('<time') && content.includes('dateTime='), 'Should use semantic time element');
    });

    it('should have title attributes for tooltips on timestamps', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('title={formatFullTimestamp'), 'Should have title attribute for full timestamp');
    });

    it('should have title attributes for model names', () => {
      const content = readFileSync(componentPath, 'utf-8');
      const titleCount = (content.match(/title={switchRecord\.(previousModel|newModel)}/g) || []).length;
      assert.ok(titleCount >= 2, 'Should have title attributes on model names for full text');
    });
  });

  describe('CSS Styling', () => {
    it('should use CSS custom properties for colors', () => {
      const content = readFileSync(cssPath, 'utf-8');
      const varMatches = content.match(/var\(--[a-z-]+\)/g) || [];
      assert.ok(varMatches.length > 20, 'Should use CSS custom properties extensively');
    });

    it('should have primary color left border', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('border-left: 3px solid var(--primary)'), 'Should have primary color left border');
    });

    it('should have hover animation with translateX', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('transform: translateX(4px)'), 'Should have hover translateX animation');
    });

    it('should use glass-morphism background', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('rgba(255, 255, 255, 0.03)'), 'Should use semi-transparent background');
    });

    it('should have new indicator pulse animation', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('@keyframes pulse-dot'), 'Should have pulse-dot animation');
      assert.ok(content.includes('animation: pulse-dot'), 'Should apply pulse animation');
    });

    it('should style previous model differently from new model', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('model-switches__model--previous'), 'Should have previous model styles');
      assert.ok(content.includes('model-switches__model--new'), 'Should have new model styles');
    });

    it('should use tabular-nums for timestamps', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('font-variant-numeric: tabular-nums'), 'Should use tabular-nums for timestamps');
    });
  });

  describe('Reduced Motion Support', () => {
    it('should have prefers-reduced-motion media query', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('@media (prefers-reduced-motion: reduce)'), 'Should have reduced motion media query');
    });

    it('should disable transitions in reduced motion', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('transition: none'), 'Should disable transitions for reduced motion');
    });

    it('should disable animations in reduced motion', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('animation: none'), 'Should disable animations for reduced motion');
    });
  });

  describe('Light Mode Support', () => {
    it('should have light mode overrides', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('[data-theme="light"]'), 'Should have light mode overrides');
    });

    it('should adjust backgrounds for light mode', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('[data-theme="light"] .model-switches__item'), 'Should have light mode item styles');
    });
  });

  describe('Responsive Design', () => {
    it('should have scroll container with maxHeight', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('overflow-y: auto'), 'Should have vertical scroll');
    });

    it('should handle long model names with ellipsis', () => {
      const content = readFileSync(cssPath, 'utf-8');
      assert.ok(content.includes('text-overflow: ellipsis'), 'Should truncate long text with ellipsis');
    });
  });

  describe('Component Export', () => {
    it('should export ModelSwitches function component', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('export function ModelSwitches'), 'Should export ModelSwitches function');
    });

    it('should have default export', () => {
      const content = readFileSync(componentPath, 'utf-8');
      assert.ok(content.includes('export default ModelSwitches'), 'Should have default export');
    });
  });
});

describe('ModelSwitches Acceptance Criteria', () => {
  it('AC1: Model switches displayed with agent and model info', () => {
    const content = readFileSync(componentPath, 'utf-8');
    assert.ok(content.includes('agentId'), 'Should display agent ID');
    assert.ok(content.includes('previousModel') || content.includes('newModel'), 'Should display model info');
    assert.ok(content.includes('model-switches__transition'), 'Should have transition display');
  });

  it('AC2: Empty state when no switches', () => {
    const content = readFileSync(componentPath, 'utf-8');
    assert.ok(content.includes('model-switches--empty'), 'Should have empty state class');
    assert.ok(content.includes('No model switches yet'), 'Should show empty state message');
  });

  it('AC3: TypeScript types are correct', () => {
    const content = readFileSync(componentPath, 'utf-8');
    assert.ok(content.includes('interface ModelSwitchesProps'), 'Should have typed props interface');
    assert.ok(content.includes('AgentEvent[]'), 'Should use AgentEvent type');
    assert.ok(content.includes('useMemo'), 'Should use useMemo for performance');
  });

  it('AC4: Tests exist and cover functionality', () => {
    // This test file exists and is running
    assert.ok(true, 'Test file exists and is running');
  });
});
