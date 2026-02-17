/**
 * Systemd service file tests
 * 
 * Tests for agent-viz-v2.service configuration
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

describe('Systemd Service File', () => {
  const servicePath = join(rootDir, 'agent-viz-v2.service');

  it('should exist', () => {
    assert.ok(existsSync(servicePath), 'Service file should exist');
  });

  it('should have valid [Unit] section', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('[Unit]'), 'Should have [Unit] section');
    assert.ok(content.includes('Description='), 'Should have Description');
    assert.ok(content.includes('After=network.target'), 'Should depend on network.target');
  });

  it('should have Type=simple', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('Type=simple'), 'Should have Type=simple');
  });

  it('should have User=setrox', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('User=setrox'), 'Should have User=setrox');
  });

  it('should have correct WorkingDirectory', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('WorkingDirectory=/home/setrox/.openclaw/agent-viz-v2'), 
      'Should have correct WorkingDirectory');
  });

  it('should have NODE_ENV=production', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('Environment=NODE_ENV=production'), 
      'Should have NODE_ENV=production');
  });

  it('should have Restart=always', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('Restart=always'), 'Should have Restart=always');
  });

  it('should have security hardening directives', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('NoNewPrivileges=true'), 'Should have NoNewPrivileges');
    assert.ok(content.includes('PrivateTmp=true'), 'Should have PrivateTmp');
    assert.ok(content.includes('ProtectSystem=strict'), 'Should have ProtectSystem');
  });

  it('should have [Install] section with WantedBy', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('[Install]'), 'Should have [Install] section');
    assert.ok(content.includes('WantedBy='), 'Should have WantedBy');
  });

  it('should use npm run server as ExecStart', () => {
    const content = readFileSync(servicePath, 'utf-8');
    
    assert.ok(content.includes('ExecStart='), 'Should have ExecStart');
    assert.ok(content.includes('npm run server') || content.includes('npm') && content.includes('server'), 
      'Should run npm server command');
  });
});
