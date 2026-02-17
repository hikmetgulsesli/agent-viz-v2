/**
 * Nginx Configuration Tests
 * 
 * Tests for nginx/agent-viz-v2.conf
 * Validates WebSocket support, SSL configuration, rate limiting, and security headers
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';

const NGINX_CONF_PATH = '/home/setrox/.openclaw/agent-viz-v2/nginx/agent-viz-v2.conf';

describe('Nginx Configuration', () => {
  let config: string;

  it('should have nginx config file', () => {
    assert.strictEqual(existsSync(NGINX_CONF_PATH), true, 'nginx/agent-viz-v2.conf should exist');
  });

  it('should load config content', () => {
    config = readFileSync(NGINX_CONF_PATH, 'utf-8');
    assert.ok(config.length > 0, 'Config should not be empty');
  });

  describe('Upstream Configuration', () => {
    it('should define upstream block for agentviz_backend', () => {
      assert.ok(config.includes('upstream agentviz_backend'), 'Should define upstream block');
    });

    it('should point upstream to 127.0.0.1:3503', () => {
      assert.ok(config.includes('server 127.0.0.1:3503'), 'Should point to port 3503');
    });

    it('should enable keepalive for upstream', () => {
      assert.ok(config.includes('keepalive 32'), 'Should have keepalive connections');
    });
  });

  describe('HTTP to HTTPS Redirect', () => {
    it('should listen on port 80', () => {
      assert.ok(config.includes('listen 80'), 'Should listen on HTTP port');
    });

    it('should have server_name agentviz.setrox.com.tr', () => {
      assert.ok(config.includes('server_name agentviz.setrox.com.tr'), 'Should have correct server_name');
    });

    it('should redirect HTTP to HTTPS', () => {
      assert.ok(config.includes('return 301 https://'), 'Should redirect to HTTPS');
    });

    it('should handle ACME challenges for certbot', () => {
      assert.ok(config.includes('/.well-known/acme-challenge/'), 'Should handle ACME challenges');
    });
  });

  describe('HTTPS Server Configuration', () => {
    it('should listen on port 443 with SSL', () => {
      assert.ok(config.includes('listen 443 ssl'), 'Should listen on HTTPS port with SSL');
    });

    it('should enable HTTP/2', () => {
      assert.ok(config.includes('http2'), 'Should enable HTTP/2');
    });

    it('should have SSL certificate paths', () => {
      assert.ok(config.includes('ssl_certificate'), 'Should have SSL certificate directive');
      assert.ok(config.includes('/etc/letsencrypt/live/agentviz.setrox.com.tr/'), 'Should use Let\'s Encrypt paths');
    });

    it('should have SSL certificate key path', () => {
      assert.ok(config.includes('ssl_certificate_key'), 'Should have SSL certificate key directive');
    });

    it('should use modern TLS versions', () => {
      assert.ok(config.includes('ssl_protocols TLSv1.2 TLSv1.3'), 'Should use TLS 1.2 and 1.3');
    });

    it('should have OCSP stapling enabled', () => {
      assert.ok(config.includes('ssl_stapling on'), 'Should enable OCSP stapling');
      assert.ok(config.includes('ssl_stapling_verify on'), 'Should verify OCSP stapling');
    });
  });

  describe('WebSocket Configuration', () => {
    it('should have WebSocket location block', () => {
      assert.ok(config.includes("location /ws"), 'Should have /ws location block');
    });

    it('should have Upgrade header for WebSocket', () => {
      assert.ok(config.includes('proxy_set_header Upgrade $http_upgrade'), 'Should set Upgrade header');
    });

    it('should have Connection upgrade header', () => {
      assert.ok(config.includes('proxy_set_header Connection "upgrade"'), 'Should set Connection upgrade header');
    });

    it('should have WebSocket-specific timeouts', () => {
      assert.ok(config.includes('proxy_read_timeout 86400s'), 'Should have long read timeout for WebSocket');
      assert.ok(config.includes('proxy_send_timeout 86400s'), 'Should have long send timeout for WebSocket');
    });

    it('should disable buffering for WebSocket', () => {
      assert.ok(config.includes('proxy_buffering off'), 'Should disable buffering for WebSocket');
      assert.ok(config.includes('proxy_cache off'), 'Should disable cache for WebSocket');
    });
  });

  describe('Rate Limiting', () => {
    it('should define rate limit zone for WebSocket', () => {
      assert.ok(config.includes('limit_req_zone $binary_remote_addr zone=agentviz_ws:10m'), 'Should define WebSocket rate limit zone');
    });

    it('should define connection limit zone', () => {
      assert.ok(config.includes('limit_conn_zone $binary_remote_addr zone=agentviz_conn:10m'), 'Should define connection limit zone');
    });

    it('should apply rate limiting to WebSocket endpoint', () => {
      assert.ok(config.includes('limit_req zone=agentviz_ws'), 'Should apply rate limiting to /ws');
    });

    it('should apply connection limiting to WebSocket', () => {
      assert.ok(config.includes('limit_conn agentviz_conn'), 'Should apply connection limiting to /ws');
    });
  });

  describe('Security Headers', () => {
    it('should have X-Frame-Options header', () => {
      assert.ok(config.includes('X-Frame-Options'), 'Should have X-Frame-Options header');
    });

    it('should have X-Content-Type-Options header', () => {
      assert.ok(config.includes('X-Content-Type-Options'), 'Should have X-Content-Type-Options header');
    });

    it('should have X-XSS-Protection header', () => {
      assert.ok(config.includes('X-XSS-Protection'), 'Should have X-XSS-Protection header');
    });

    it('should have Referrer-Policy header', () => {
      assert.ok(config.includes('Referrer-Policy'), 'Should have Referrer-Policy header');
    });

    it('should have Content-Security-Policy header', () => {
      assert.ok(config.includes('Content-Security-Policy'), 'Should have CSP header');
    });

    it('should have Strict-Transport-Security header (HSTS)', () => {
      assert.ok(config.includes('Strict-Transport-Security'), 'Should have HSTS header');
    });
  });

  describe('Proxy Headers', () => {
    it('should set X-Real-IP header', () => {
      assert.ok(config.includes('proxy_set_header X-Real-IP'), 'Should set X-Real-IP');
    });

    it('should set X-Forwarded-For header', () => {
      assert.ok(config.includes('proxy_set_header X-Forwarded-For'), 'Should set X-Forwarded-For');
    });

    it('should set X-Forwarded-Proto header', () => {
      assert.ok(config.includes('proxy_set_header X-Forwarded-Proto'), 'Should set X-Forwarded-Proto');
    });

    it('should use HTTP/1.1 for proxy', () => {
      assert.ok(config.includes('proxy_http_version 1.1'), 'Should use HTTP/1.1 for proxy');
    });
  });

  describe('Health Check Endpoint', () => {
    it('should have health check location', () => {
      assert.ok(config.includes('location /health'), 'Should have /health location');
    });

    it('should bypass rate limiting for health checks', () => {
      // Health endpoint is defined before rate limited locations
      const healthMatch = config.match(/location \/health[\s\S]*?\}/);
      assert.ok(healthMatch, 'Should have health location block');
    });
  });

  describe('Gzip Compression', () => {
    it('should enable gzip', () => {
      assert.ok(config.includes('gzip on'), 'Should enable gzip');
    });

    it('should have gzip types configured', () => {
      assert.ok(config.includes('gzip_types'), 'Should have gzip_types directive');
    });
  });

  describe('Hidden Files Protection', () => {
    it('should deny access to hidden files', () => {
      assert.ok(config.includes('location ~ /\\.'), 'Should have location block for hidden files');
      assert.ok(config.includes('deny all'), 'Should deny access to hidden files');
    });
  });
});
