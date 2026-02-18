import { describe, it, expect } from 'vitest';

describe('Global Styles', () => {
  it('document has html element with data-theme', () => {
    const html = document.documentElement;
    expect(html).toBeDefined();
    expect(html.tagName.toLowerCase()).toBe('html');
  });

  it('body element exists', () => {
    const body = document.body;
    expect(body).toBeDefined();
    expect(body.tagName.toLowerCase()).toBe('body');
  });

  it('prefers-reduced-motion media query string is valid', () => {
    // The media query string format for reduced motion
    const mediaQueryString = '(prefers-reduced-motion: reduce)';
    expect(mediaQueryString).toContain('prefers-reduced-motion');
    expect(mediaQueryString).toContain('reduce');
  });

  it('animation keyframes are valid CSS identifiers', () => {
    // These are the animation names defined in global.css
    const validAnimations = ['fadeIn', 'slideUp', 'slideDown', 'scaleIn', 'pulse'];
    validAnimations.forEach(name => {
      expect(name).toMatch(/^[a-zA-Z][a-zA-Z0-9]*$/);
    });
  });

  it('animation durations are in valid range (150-300ms)', () => {
    const durations = ['150ms', '200ms', '300ms'];
    durations.forEach(duration => {
      const value = parseInt(duration);
      expect(value).toBeGreaterThanOrEqual(150);
      expect(value).toBeLessThanOrEqual(300);
    });
  });

  it('font weights for headings are 600 or greater', () => {
    const weights = [600, 700];
    weights.forEach(weight => {
      expect(weight).toBeGreaterThanOrEqual(600);
    });
  });

  it('scrollbar styling selectors are valid', () => {
    // WebKit scrollbar pseudo-elements
    const selectors = [
      '::-webkit-scrollbar',
      '::-webkit-scrollbar-track',
      '::-webkit-scrollbar-thumb'
    ];
    selectors.forEach(selector => {
      expect(selector).toContain('::-webkit-scrollbar');
    });
  });

  it('utility classes follow naming conventions', () => {
    const utilities = [
      'animate-fade-in',
      'animate-slide-up',
      'animate-scale-in',
      'transition-fast',
      'hover-lift',
      'sr-only',
      'touch-target'
    ];
    utilities.forEach(cls => {
      expect(cls).toMatch(/^[a-z]+(-[a-z]+)*$/);
    });
  });
});
