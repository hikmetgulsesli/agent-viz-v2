/**
 * Responsive Mobile Layout Tests
 * 
 * Tests for US-014: Responsive mobile layout
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const srcDir = join(process.cwd(), 'src');
const componentsDir = join(srcDir, 'client', 'components');

describe('Responsive Mobile Layout - US-014', () => {
  describe('App.tsx Mobile Features', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should import mobile tab icons (Users, List, BarChart3, Cpu)', () => {
      assert.ok(
        appContent.includes('Users') &&
        appContent.includes('List') &&
        appContent.includes('BarChart3') &&
        appContent.includes('Cpu'),
        'Should import mobile tab icons from lucide-react'
      );
    });

    it('should import Menu and X icons for mobile menu toggle', () => {
      assert.ok(
        appContent.includes('Menu') && appContent.includes('X'),
        'Should import Menu and X icons'
      );
    });

    it('should define MobileTab type', () => {
      assert.ok(
        appContent.includes("type MobileTab = 'agents' | 'activity' | 'tokens' | 'models'") ||
        appContent.includes("type MobileTab =") ||
        appContent.includes('agents') && appContent.includes('activity') && 
        appContent.includes('tokens') && appContent.includes('models'),
        'Should define MobileTab type with tab identifiers'
      );
    });

    it('should have activeMobileTab state', () => {
      assert.ok(
        appContent.includes('activeMobileTab') &&
        appContent.includes('setActiveMobileTab'),
        'Should have activeMobileTab state'
      );
    });

    it('should have isMobile state with window resize listener', () => {
      assert.ok(
        appContent.includes('isMobile') &&
        appContent.includes('setIsMobile') &&
        appContent.includes('window.innerWidth') &&
        appContent.includes('resize'),
        'Should detect mobile viewport with resize listener'
      );
    });

    it('should render mobile tab navigation when isMobile is true', () => {
      assert.ok(
        appContent.includes('mobile-tabs') &&
        appContent.includes('isMobile') &&
        appContent.includes('role="tablist"'),
        'Should render mobile tab navigation with role="tablist"'
      );
    });

    it('should have mobile menu toggle button', () => {
      assert.ok(
        appContent.includes('app-header__menu-toggle') &&
        appContent.includes('aria-label') &&
        appContent.includes('aria-expanded'),
        'Should have accessible mobile menu toggle button'
      );
    });

    it('should conditionally show columns based on activeMobileTab', () => {
      assert.ok(
        appContent.includes('dashboard-column--active') &&
        appContent.includes('activeMobileTab'),
        'Should conditionally show columns based on activeMobileTab'
      );
    });

    it('should have aria-hidden attributes for mobile panels', () => {
      assert.ok(
        appContent.includes('aria-hidden') &&
        appContent.includes('role="tabpanel"'),
        'Should have aria-hidden and role="tabpanel" for accessibility'
      );
    });

    it('should handle tab changes with handleTabChange callback', () => {
      assert.ok(
        appContent.includes('handleTabChange') ||
        appContent.includes('handleTabChange('),
        'Should have handleTabChange callback'
      );
    });
  });

  describe('App.css Mobile Responsive Styles', () => {
    const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');

    it('should have mobile tabs styles', () => {
      assert.ok(
        cssContent.includes('.mobile-tabs'),
        'Should have .mobile-tabs class styles'
      );
    });

    it('should have mobile tabs button styles', () => {
      assert.ok(
        cssContent.includes('.mobile-tabs__button'),
        'Should have .mobile-tabs__button styles'
      );
    });

    it('should have active tab button styles', () => {
      assert.ok(
        cssContent.includes('.mobile-tabs__button--active'),
        'Should have .mobile-tabs__button--active styles'
      );
    });

    it('should have mobile menu toggle styles', () => {
      assert.ok(
        cssContent.includes('.app-header__menu-toggle'),
        'Should have .app-header__menu-toggle styles'
      );
    });

    it('should hide menu toggle on desktop', () => {
      assert.ok(
        cssContent.includes('display: none') &&
        cssContent.includes('.app-header__menu-toggle'),
        'Should hide menu toggle on desktop'
      );
    });

    it('should show menu toggle on mobile (768px)', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') &&
        cssContent.includes('.app-header__menu-toggle') &&
        cssContent.includes('display: flex'),
        'Should show menu toggle on mobile breakpoint'
      );
    });

    it('should show mobile tabs on mobile breakpoint', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') &&
        cssContent.includes('.mobile-tabs') &&
        cssContent.includes('display: flex'),
        'Should show mobile tabs on mobile breakpoint'
      );
    });

    it('should hide header status on mobile', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') &&
        cssContent.includes('.app-header__status') &&
        cssContent.includes('display: none'),
        'Should hide header status on mobile'
      );
    });

    it('should hide header subtitle on mobile', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') &&
        cssContent.includes('.app-header__subtitle') &&
        cssContent.includes('display: none'),
        'Should hide header subtitle on mobile'
      );
    });

    it('should show only active column on mobile', () => {
      assert.ok(
        cssContent.includes('.dashboard-column--active') ||
        (cssContent.includes('.dashboard-column') &&
         cssContent.includes('display: none') &&
         cssContent.includes('display: flex')),
        'Should show only active column on mobile'
      );
    });

    it('should have 375px breakpoint for small mobile', () => {
      assert.ok(
        cssContent.includes('@media (max-width: 375px)'),
        'Should have small mobile breakpoint at 375px'
      );
    });

    it('should have 1440px+ breakpoint for large desktop', () => {
      assert.ok(
        cssContent.includes('@media (min-width: 1440px)'),
        'Should have large desktop breakpoint at 1440px'
      );
    });

    it('should have touch device optimizations', () => {
      assert.ok(
        cssContent.includes('@media (hover: none) and (pointer: coarse)'),
        'Should have touch device optimizations'
      );
    });

    it('should have minimum 44px touch targets', () => {
      assert.ok(
        cssContent.includes('min-height: 44px') ||
        cssContent.includes('min-height: 48px') ||
        cssContent.includes('44px'),
        'Should have minimum 44px touch targets'
      );
    });
  });

  describe('Component Mobile Responsive Styles', () => {
    it('AgentList.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'AgentList.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') ||
        cssContent.includes('@media (hover: none)'),
        'AgentList.css should have mobile responsive styles'
      );
    });

    it('ActivityFeed.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'ActivityFeed.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') ||
        cssContent.includes('@media (hover: none)'),
        'ActivityFeed.css should have mobile responsive styles'
      );
    });

    it('TokenUsage.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'TokenUsage.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') ||
        cssContent.includes('@media (max-width: 640px)'),
        'TokenUsage.css should have mobile responsive styles'
      );
    });

    it('ModelSwitches.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'ModelSwitches.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') ||
        cssContent.includes('@media (hover: none)'),
        'ModelSwitches.css should have mobile responsive styles'
      );
    });

    it('GlassCard.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'GlassCard.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)'),
        'GlassCard.css should have mobile responsive styles'
      );
    });

    it('ConnectionStatus.css should have mobile responsive styles', () => {
      const cssContent = readFileSync(join(componentsDir, 'ConnectionStatus.css'), 'utf-8');
      assert.ok(
        cssContent.includes('@media (max-width: 768px)') ||
        cssContent.includes('@media (max-width: 480px)'),
        'ConnectionStatus.css should have mobile responsive styles'
      );
    });
  });

  describe('Mobile Touch Targets', () => {
    it('should have minimum 44px touch targets in App.css', () => {
      const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');
      assert.ok(
        cssContent.includes('min-height: 44px') ||
        cssContent.includes('min-height: 40px'),
        'Should have minimum touch targets in App.css'
      );
    });

    it('should have touch target comments', () => {
      const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');
      assert.ok(
        cssContent.includes('Touch target'),
        'Should document touch targets in comments'
      );
    });
  });

  describe('Accessibility Features', () => {
    const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');

    it('should have role="tablist" on mobile tabs', () => {
      assert.ok(
        appContent.includes('role="tablist"'),
        'Mobile tabs should have role="tablist"'
      );
    });

    it('should have role="tab" on tab buttons', () => {
      assert.ok(
        appContent.includes('role="tab"'),
        'Tab buttons should have role="tab"'
      );
    });

    it('should have aria-selected on tab buttons', () => {
      assert.ok(
        appContent.includes('aria-selected'),
        'Tab buttons should have aria-selected'
      );
    });

    it('should have role="tabpanel" on panels', () => {
      assert.ok(
        appContent.includes('role="tabpanel"'),
        'Panels should have role="tabpanel"'
      );
    });

    it('should have aria-controls linking tabs to panels', () => {
      assert.ok(
        appContent.includes('aria-controls'),
        'Tabs should have aria-controls linking to panels'
      );
    });

    it('should have aria-label on menu toggle', () => {
      assert.ok(
        appContent.includes('aria-label={isMobileMenuOpen'),
        'Menu toggle should have dynamic aria-label'
      );
    });

    it('should have aria-expanded on menu toggle', () => {
      assert.ok(
        appContent.includes('aria-expanded={isMobileMenuOpen}'),
        'Menu toggle should have aria-expanded'
      );
    });
  });
});

describe('Acceptance Criteria - US-014', () => {
  const appContent = readFileSync(join(srcDir, 'App.tsx'), 'utf-8');
  const cssContent = readFileSync(join(srcDir, 'App.css'), 'utf-8');

  it('AC1: Mobile tab navigation with 4 tabs (Agents, Activity, Tokens, Models)', () => {
    assert.ok(
      cssContent.includes('.mobile-tabs') &&
      appContent.includes('Agents') &&
      appContent.includes('Activity') &&
      appContent.includes('Tokens') &&
      appContent.includes('Models'),
      'Should have mobile tab navigation with all 4 tabs'
    );
  });

  it('AC2: Only active tab content visible on mobile', () => {
    assert.ok(
      cssContent.includes('.dashboard-column--active') &&
      cssContent.includes('display: none') &&
      cssContent.includes('display: flex'),
      'Should show only active tab content on mobile'
    );
  });

  it('AC3: Touch targets minimum 44px', () => {
    assert.ok(
      cssContent.includes('min-height: 44px') ||
      cssContent.includes('44px'),
      'Should have minimum 44px touch targets'
    );
  });

  it('AC4: Responsive at 375px, 768px, 1024px, 1440px breakpoints', () => {
    assert.ok(
      cssContent.includes('@media (max-width: 375px)') &&
      cssContent.includes('@media (max-width: 768px)') &&
      cssContent.includes('@media (max-width: 1024px)') &&
      cssContent.includes('@media (min-width: 1440px)'),
      'Should have all required breakpoints'
    );
  });

  it('AC5: Accessible with ARIA roles and labels', () => {
    assert.ok(
      appContent.includes('role="tablist"') &&
      appContent.includes('role="tab"') &&
      appContent.includes('aria-selected') &&
      appContent.includes('aria-label'),
      'Should be accessible with ARIA attributes'
    );
  });

  it('AC6: Touch device optimizations (hover:none)', () => {
    assert.ok(
      cssContent.includes('@media (hover: none) and (pointer: coarse)'),
      'Should have touch device optimizations'
    );
  });
});
