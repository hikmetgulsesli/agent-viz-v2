import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

describe('Nginx Configuration', () => {
  const nginxConfigPath = join(__dirname, '..', 'nginx', 'agent-viz-v2.conf');
  const config = readFileSync(nginxConfigPath, 'utf-8');

  describe('AC1: nginx/agent-viz-v2.conf created', () => {
    it('should exist and be readable', () => {
      expect(config).toBeDefined();
      expect(config.length).toBeGreaterThan(0);
    });
  });

  describe('AC2: Listens on port 443 with SSL', () => {
    it('should listen on port 443', () => {
      expect(config).toContain('listen 443 ssl http2');
    });

    it('should have SSL enabled', () => {
      expect(config).toContain('ssl_certificate');
      expect(config).toContain('ssl_certificate_key');
    });

    it('should use self-signed origin certificate', () => {
      expect(config).toContain('/etc/nginx/ssl/origin.crt');
      expect(config).toContain('/etc/nginx/ssl/origin.key');
    });

    it('should have http2 enabled', () => {
      expect(config).toContain('http2');
    });
  });

  describe('AC3: Proxies to localhost:3503', () => {
    it('should proxy_pass to localhost:3503 for root location', () => {
      expect(config).toContain('proxy_pass http://127.0.0.1:3503');
    });

    it('should have correct server_name', () => {
      expect(config).toContain('server_name agentviz.setrox.com.tr');
    });

    it('should set proxy headers', () => {
      expect(config).toContain('proxy_set_header Host $host');
      expect(config).toContain('proxy_set_header X-Real-IP $remote_addr');
      expect(config).toContain('proxy_set_header X-Forwarded-For');
    });
  });

  describe('AC4: WebSocket Upgrade headers configured', () => {
    it('should have WebSocket location block', () => {
      expect(config).toContain('location /ws');
    });

    it('should set Upgrade header', () => {
      expect(config).toContain('proxy_set_header Upgrade $http_upgrade');
    });

    it('should set Connection header to upgrade', () => {
      expect(config).toContain('proxy_set_header Connection "upgrade"');
    });

    it('should use HTTP/1.1 for WebSocket', () => {
      expect(config).toContain('proxy_http_version 1.1');
    });

    it('should have reasonable timeout for WebSocket', () => {
      expect(config).toContain('proxy_read_timeout');
    });
  });

  describe('AC5: Static assets cached (1 hour)', () => {
    it('should have location block for static assets', () => {
      expect(config).toContain('location ~* \\.(js|css|png');
    });

    it('should set cache expiration to 1 hour', () => {
      expect(config).toContain('expires 1h');
    });

    it('should set Cache-Control header', () => {
      expect(config).toContain('Cache-Control "public, immutable"');
    });
  });

  describe('AC6: Rate limit: 10 connections per IP', () => {
    it('should define limit_conn_zone', () => {
      expect(config).toContain('limit_conn_zone $binary_remote_addr');
    });

    it('should limit WebSocket connections to 10 per IP', () => {
      expect(config).toContain('limit_conn ws_conn 10');
    });
  });

  describe('Additional Configuration Checks', () => {
    it('should have security headers', () => {
      expect(config).toContain('X-Frame-Options');
      expect(config).toContain('X-Content-Type-Options');
      expect(config).toContain('X-XSS-Protection');
      expect(config).toContain('Referrer-Policy');
    });

    it('should have health endpoint configuration', () => {
      expect(config).toContain('location /health');
      expect(config).toContain('no-cache');
    });

    it('should have HTTP to HTTPS redirect', () => {
      expect(config).toContain('listen 80');
      expect(config).toContain('return 301 https://');
    });

    it('should have appropriate timeouts', () => {
      expect(config).toContain('proxy_connect_timeout 60s');
      expect(config).toContain('proxy_send_timeout 60s');
    });

    it('should use modern SSL ciphers', () => {
      expect(config).toContain('ssl_ciphers');
      expect(config).toContain('ECDHE');
    });

    it('should have WebSocket ping/pong for keep-alive', () => {
      expect(config).toContain('proxy_ping_interval');
      expect(config).toContain('proxy_ping_timeout');
    });
  });
});
