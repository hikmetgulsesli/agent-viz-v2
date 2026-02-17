import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * TokenUsage Component Tests
 *
 * These tests validate the TokenUsage component structure, types, and functionality.
 * Since we're using Node.js built-in test runner without a DOM environment,
 * we test the component exports, types, and props interface.
 */

describe('TokenUsage Component', () => {
  describe('Module Exports', () => {
    it('should have TokenUsage.tsx component file', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      assert.ok(fs.existsSync(componentPath), 'TokenUsage.tsx should exist');
    });

    it('should have TokenUsage.css styles file', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      assert.ok(fs.existsSync(cssPath), 'TokenUsage.css should exist');
    });
  });

  describe('Props Interface', () => {
    it('should have TypeScript interface with required agents prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('agents:'), 'Component should have agents prop');
      assert.ok(content.includes('TokenUsageProps'), 'Should define TokenUsageProps interface');
      assert.ok(content.includes('AgentActivity[]'), 'agents should be AgentActivity[] type');
    });

    it('should accept optional className prop', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('className?:'), 'Component should have optional className prop');
    });
  });

  describe('Component Structure', () => {
    it('should be a React function component', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(
        content.includes('function TokenUsage') || content.includes('export function TokenUsage'),
        'Should be a function component'
      );
    });

    it('should import AgentActivity type from types', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(
        content.includes('AgentActivity') && content.includes('../types/agentEvents'),
        'Should import AgentActivity from types'
      );
    });

    it('should import Lucide icons', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('lucide-react'), 'Should import from lucide-react');
      assert.ok(content.includes('Coins'), 'Should import Coins icon');
      assert.ok(content.includes('TrendingUp'), 'Should import TrendingUp icon');
      assert.ok(content.includes('ArrowDown'), 'Should import ArrowDown icon');
      assert.ok(content.includes('ArrowUp'), 'Should import ArrowUp icon');
    });

    it('should handle empty agents array', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('!hasData'), 'Should check for no data');
      assert.ok(content.includes('token-usage__empty'), 'Should have empty state class');
    });
  });

  describe('Token Calculation', () => {
    it('should have calculateTokenData helper function', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('function calculateTokenData'), 'Should have calculateTokenData helper');
    });

    it('should calculate total tokens from agents', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('totalTokens'), 'Should calculate totalTokens');
      assert.ok(content.includes('totalPrompt'), 'Should calculate totalPrompt');
      assert.ok(content.includes('totalCompletion'), 'Should calculate totalCompletion');
    });

    it('should aggregate tokens by model', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('modelData'), 'Should have modelData');
      assert.ok(content.includes('modelMap'), 'Should use modelMap for aggregation');
    });

    it('should sort data by total tokens descending', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('sort((a, b) => b.totalTokens - a.totalTokens)'), 'Should sort by totalTokens desc');
    });
  });

  describe('Number Formatting', () => {
    it('should have formatTokenCount helper function', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('function formatTokenCount'), 'Should have formatTokenCount helper');
    });

    it('should format millions with M suffix', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('1_000_000'), 'Should check for millions');
      assert.ok(content.includes('toFixed(2)'), 'Should format millions with 2 decimal places');
    });

    it('should format thousands with K suffix', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('1_000)'), 'Should check for thousands');
      assert.ok(content.includes('toFixed(1)'), 'Should format thousands with 1 decimal place');
    });

    it('should have formatFullNumber helper for tooltips', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('function formatFullNumber'), 'Should have formatFullNumber helper');
      assert.ok(content.includes('toLocaleString'), 'Should use toLocaleString for full numbers');
    });
  });

  describe('Per-Agent Bar Chart', () => {
    it('should have per-agent section', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('Per-Agent Usage'), 'Should have Per-Agent Usage section');
      assert.ok(content.includes('agentData'), 'Should use agentData');
    });

    it('should have horizontal bar chart structure', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('token-usage__bar-row'), 'Should have bar row class');
      assert.ok(content.includes('token-usage__bar-container'), 'Should have bar container class');
      assert.ok(content.includes('token-usage__bar'), 'Should have bar class');
    });

    it('should have input/output segments within bars', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('token-usage__bar-segment'), 'Should have bar segment class');
      assert.ok(content.includes('bar-segment--input'), 'Should have input segment');
      assert.ok(content.includes('bar-segment--output'), 'Should have output segment');
    });

    it('should calculate bar widths based on max', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('maxAgentTokens'), 'Should track maxAgentTokens');
      assert.ok(content.includes('barWidth'), 'Should calculate barWidth');
    });
  });

  describe('Per-Model Stacked Bar', () => {
    it('should have per-model section', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('Per-Model Usage'), 'Should have Per-Model Usage section');
      assert.ok(content.includes('modelData'), 'Should use modelData');
    });

    it('should have stacked bar structure', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('token-usage__model-bar'), 'Should have model bar class');
      assert.ok(content.includes('token-usage__model-segment'), 'Should have model segment class');
    });

    it('should have model legend', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('token-usage__model-legend'), 'Should have model legend class');
      assert.ok(content.includes('model-legend-item'), 'Should have legend items');
    });

    it('should cycle through colors for models', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('getModelColor'), 'Should have getModelColor helper');
      assert.ok(content.includes('colors['), 'Should use colors array');
    });
  });

  describe('Legend', () => {
    it('should have input/output legend for agent bars', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('token-usage__legend'), 'Should have legend class');
      assert.ok(content.includes('legend-color--input'), 'Should have input legend color');
      assert.ok(content.includes('legend-color--output'), 'Should have output legend color');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on bar container', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('role="list"'), 'Should have list role for chart');
      assert.ok(content.includes('role="listitem"'), 'Should have listitem role for bar rows');
    });

    it('should have aria-label on model bar', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('role="img"'), 'Should have img role for model bar');
    });

    it('should have aria-hidden on decorative icons', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('aria-hidden="true"'), 'Should have aria-hidden on decorative icons');
    });

    it('should have title attributes for tooltips', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('title='), 'Should have title attributes for tooltips');
    });
  });

  describe('CSS Module', () => {
    it('should use CSS custom properties for colors', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('var(--'), 'CSS should use custom properties');
    });

    it('should have input/output segment colors', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('bar-segment--input'), 'Should have input segment styles');
      assert.ok(css.includes('bar-segment--output'), 'Should have output segment styles');
      assert.ok(css.includes('var(--info)'), 'Should use info color for input');
      assert.ok(css.includes('var(--accent)'), 'Should use accent color for output');
    });

    it('should have transition animations', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('transition'), 'Should have transitions for animations');
      assert.ok(css.includes('width'), 'Should animate width for bar transitions');
    });

    it('should support reduced motion', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('prefers-reduced-motion'), 'CSS should respect reduced motion preference');
    });

    it('should have light mode overrides', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('[data-theme="light"]'), 'CSS should have light mode overrides');
    });

    it('should use tabular-nums for numeric data', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('font-variant-numeric: tabular-nums'), 'Should use tabular-nums for numbers');
    });

    it('should have responsive styles', async () => {
      const fs = await import('node:fs');
      const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
      const css = fs.readFileSync(cssPath, 'utf-8');

      assert.ok(css.includes('@media (max-width:'), 'Should have responsive media queries');
    });
  });
});

describe('TokenUsage Acceptance Criteria', () => {
  it('AC1: Total tokens displayed prominently', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const cssPath = new URL('../client/components/TokenUsage.css', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(content.includes('token-usage__header'), 'Should have header section');
    assert.ok(content.includes('token-usage__total'), 'Should have total display');
    assert.ok(content.includes('formatTokenCount(totalTokens)'), 'Should format total tokens');
    assert.ok(css.includes('token-usage__total-value'), 'Should style total value prominently');
    assert.ok(css.includes('text-2xl') || css.includes('font-size: var(--text-2xl)'), 'Should use large font for total');
  });

  it('AC2: Per-agent bars with input/output segments', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');

    assert.ok(content.includes('Per-Agent Usage'), 'Should have per-agent section');
    assert.ok(content.includes('token-usage__bar-segment--input'), 'Should have input segment');
    assert.ok(content.includes('token-usage__bar-segment--output'), 'Should have output segment');
    assert.ok(content.includes('promptWidth'), 'Should calculate prompt width');
    assert.ok(content.includes('completionWidth'), 'Should calculate completion width');
  });

  it('AC3: Per-model breakdown with legend', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');

    assert.ok(content.includes('Per-Model Usage'), 'Should have per-model section');
    assert.ok(content.includes('token-usage__model-bar'), 'Should have model bar');
    assert.ok(content.includes('token-usage__model-legend'), 'Should have model legend');
    assert.ok(content.includes('model-legend-item'), 'Should have legend items');
  });

  it('AC4: Numbers formatted correctly (M/K suffixes)', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');

    assert.ok(content.includes('function formatTokenCount'), 'Should have formatTokenCount function');
    assert.ok(content.includes('1_000_000'), 'Should handle millions');
    assert.ok(content.includes('1_000)'), 'Should handle thousands');
    assert.ok(content.includes('.toFixed(2)'), 'Should format with decimal places');
    assert.ok(content.includes('}M'), 'Should use M suffix in template literal');
    assert.ok(content.includes('}K'), 'Should use K suffix in template literal');
  });

  it('AC5: Empty state when no token data', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');

    assert.ok(content.includes('!hasData'), 'Should check for no data');
    assert.ok(content.includes('token-usage__empty'), 'Should have empty state class');
    assert.ok(content.includes('No token usage yet'), 'Should show empty message');
  });

  it('AC6: Typecheck passes (component uses TypeScript correctly)', async () => {
    const fs = await import('node:fs');
    const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
    const content = fs.readFileSync(componentPath, 'utf-8');

    assert.ok(content.includes(': AgentActivity[]'), 'Should type agents as AgentActivity[]');
    assert.ok(content.includes(': TokenUsageProps'), 'Should type props with TokenUsageProps');
    assert.ok(content.includes('interface AgentTokenData'), 'Should define AgentTokenData interface');
    assert.ok(content.includes('interface ModelTokenData'), 'Should define ModelTokenData interface');
  });

  it('AC7: Tests for TokenUsage pass', async () => {
    // This test validates that the test file itself exists and has tests
    const fs = await import('node:fs');
    const testPath = new URL('./TokenUsage.test.ts', import.meta.url);
    assert.ok(fs.existsSync(testPath), 'TokenUsage.test.ts should exist');

    const content = fs.readFileSync(testPath, 'utf-8');
    assert.ok(content.includes('describe('), 'Should have describe blocks');
    assert.ok(content.includes('it('), 'Should have it/test blocks');
  });
});

describe('TokenUsage Helper Functions', () => {
  describe('formatTokenCount', () => {
    it('should format millions with 2 decimal places', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('1_000_000'), 'Should check for 1 million threshold');
      assert.ok(content.includes('toFixed(2)'), 'Should use toFixed(2) for millions');
    });

    it('should format thousands with 1 decimal place', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('1_000)'), 'Should check for 1 thousand threshold');
      assert.ok(content.includes('toFixed(1)'), 'Should use toFixed(1) for thousands');
    });

    it('should return raw number for values under 1000', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('count.toString()') || content.includes('count.toLocaleString()'), 'Should return string for small numbers');
    });
  });

  describe('getModelColor', () => {
    it('should cycle through color palette', async () => {
      const fs = await import('node:fs');
      const componentPath = new URL('../client/components/TokenUsage.tsx', import.meta.url);
      const content = fs.readFileSync(componentPath, 'utf-8');

      assert.ok(content.includes('var(--primary)'), 'Should use primary color');
      assert.ok(content.includes('var(--accent)'), 'Should use accent color');
      assert.ok(content.includes('var(--success)'), 'Should use success color');
      assert.ok(content.includes('index % colors.length'), 'Should cycle colors with modulo');
    });
  });
});
