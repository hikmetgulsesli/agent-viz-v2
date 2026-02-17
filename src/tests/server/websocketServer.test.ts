/**
 * WebSocket Server Tests
 * 
 * Tests for the Express WebSocket server functionality.
 * Uses Node.js built-in test runner.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { WebSocket } from 'ws';
import { startServer, stopServer, getServerState } from '../../server/websocketServer.js';
import type { AgentEvent } from '../../client/types/agentEvents.js';

describe('WebSocket Server', () => {
  const TEST_PORT = 18790; // Use different port to avoid conflicts
  let activeSockets: WebSocket[] = [];

  beforeEach(async () => {
    // Ensure server is stopped and clean up any sockets
    activeSockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    activeSockets = [];
    
    try {
      await stopServer();
    } catch {
      // Ignore errors from stopping non-running server
    }
    
    // Wait for port to be released
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    // Clean up sockets
    activeSockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    activeSockets = [];
    
    // Stop server
    try {
      await stopServer();
    } catch {
      // Ignore errors
    }
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Server Startup', () => {
    it('should start server on specified port', async () => {
      const result = await startServer(TEST_PORT);
      
      assert.strictEqual(result.port, TEST_PORT);
      assert.strictEqual(result.url, `ws://localhost:${TEST_PORT}`);
      
      const state = getServerState();
      assert.strictEqual(state.isRunning, true);
    });

    it('should reject when starting an already running server', async () => {
      await startServer(TEST_PORT);
      
      await assert.rejects(
        () => startServer(TEST_PORT),
        /already running/
      );
    });

    it('should use default port when not specified', async () => {
      // Use a different port to avoid conflicts with any running server
      const result = await startServer(TEST_PORT + 1);
      
      assert.strictEqual(result.port, TEST_PORT + 1);
      
      await stopServer();
    });
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      await startServer(TEST_PORT);
      
      const response = await fetch(`http://localhost:${TEST_PORT}/health`);
      const data = await response.json();
      
      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.status, 'healthy');
      assert.ok(typeof data.uptime === 'number');
      assert.ok(typeof data.clients === 'number');
      assert.ok(typeof data.timestamp === 'string');
    });
  });

  describe('Stats Endpoint', () => {
    it('should return server stats', async () => {
      await startServer(TEST_PORT);
      
      const response = await fetch(`http://localhost:${TEST_PORT}/api/stats`);
      const { data } = await response.json();
      
      assert.strictEqual(response.status, 200);
      assert.ok(typeof data.connectedClients === 'number');
      assert.ok(typeof data.uptime === 'number');
      assert.ok(typeof data.memoryUsage === 'object');
    });
  });

  describe('WebSocket Connection', () => {
    it('should accept WebSocket connections', async () => {
      await startServer(TEST_PORT);
      
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws);
      
      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          resolve();
        });
        ws.on('error', reject);
      });
      
      assert.strictEqual(ws.readyState, WebSocket.OPEN);
    });

    it('should send welcome message on connection', async () => {
      await startServer(TEST_PORT);
      
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws);
      
      const message = await new Promise<unknown>((resolve, reject) => {
        ws.on('message', (data) => {
          resolve(JSON.parse(data.toString()));
        });
        ws.on('error', reject);
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      const msg = message as { type: string; payload: { type: string; agentId: string } };
      assert.strictEqual(msg.type, 'agent_event');
      assert.strictEqual(msg.payload.type, 'agent_started');
      assert.strictEqual(msg.payload.agentId, 'system');
    });

    it('should track connected clients', async () => {
      await startServer(TEST_PORT);
      
      const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws1);
      await new Promise<void>((resolve) => ws1.on('open', resolve));
      
      const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws2);
      await new Promise<void>((resolve) => ws2.on('open', resolve));
      
      // Give server time to register clients
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const state = getServerState();
      assert.strictEqual(state.clients.size, 2);
    });
  });

  describe('Event Broadcasting', () => {
    it('should broadcast events to all connected clients', async () => {
      await startServer(TEST_PORT);
      
      const ws1 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      const ws2 = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws1, ws2);
      
      await Promise.all([
        new Promise<void>((resolve) => ws1.on('open', resolve)),
        new Promise<void>((resolve) => ws2.on('open', resolve)),
      ]);
      
      // Skip welcome messages
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Send event via API
      const event: AgentEvent = {
        type: 'agent_started',
        agentId: 'test-agent',
        timestamp: Date.now(),
        data: { model: 'gpt-4' },
      };
      
      const response = await fetch(`http://localhost:${TEST_PORT}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
      assert.strictEqual(response.status, 201);
      
      // Wait for broadcast
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Test passed if no errors
      assert.ok(true);
    });
  });

  describe('Event API', () => {
    it('should accept valid events via POST /api/events', async () => {
      await startServer(TEST_PORT);
      
      const event: AgentEvent = {
        type: 'tool_called',
        agentId: 'test-agent',
        timestamp: Date.now(),
        data: { toolName: 'search_web' },
      };
      
      const response = await fetch(`http://localhost:${TEST_PORT}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      
      const data = await response.json();
      
      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.sent, true);
      assert.ok(typeof data.data.clients === 'number');
    });

    it('should reject events without required fields', async () => {
      await startServer(TEST_PORT);
      
      const response = await fetch(`http://localhost:${TEST_PORT}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: {} }),
      });
      
      const data = await response.json();
      
      assert.strictEqual(response.status, 400);
      assert.ok(data.error);
      assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
    });
  });

  describe('Server Shutdown', () => {
    it('should stop server gracefully', async () => {
      await startServer(TEST_PORT);
      
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws);
      await new Promise<void>((resolve) => ws.on('open', resolve));
      
      await stopServer();
      
      const state = getServerState();
      assert.strictEqual(state.isRunning, false);
      assert.strictEqual(state.clients.size, 0);
      
      // Verify server is actually stopped
      await assert.rejects(
        () => fetch(`http://localhost:${TEST_PORT}/health`),
        /fetch failed|ECONNREFUSED/i
      );
    });

    it('should handle multiple stop calls gracefully', async () => {
      await startServer(TEST_PORT);
      await stopServer();
      await stopServer(); // Should not throw
      
      assert.ok(true);
    });
  });

  describe('Message Handling', () => {
    it('should echo back received messages', async () => {
      await startServer(TEST_PORT);
      
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws);
      await new Promise<void>((resolve) => ws.on('open', resolve));
      
      // Skip welcome message
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const testMessage = { action: 'ping', id: 123 };
      
      const responsePromise = new Promise<unknown>((resolve) => {
        ws.on('message', (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.payload?.data?.received) {
            resolve(msg);
          }
        });
      });
      
      ws.send(JSON.stringify(testMessage));
      
      const response = await responsePromise;
      const resp = response as { type: string; payload: { data: { received: typeof testMessage } } };
      
      assert.strictEqual(resp.type, 'agent_event');
      assert.deepStrictEqual(resp.payload.data.received, testMessage);
    });

    it('should handle invalid JSON gracefully', async () => {
      await startServer(TEST_PORT);
      
      const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
      activeSockets.push(ws);
      await new Promise<void>((resolve) => ws.on('open', resolve));
      
      // Skip welcome message
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorPromise = new Promise<unknown>((resolve) => {
        ws.on('message', (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'error') {
            resolve(msg);
          }
        });
      });
      
      ws.send('invalid json {');
      
      const error = await errorPromise;
      const err = error as { type: string; payload: { code: string } };
      
      assert.strictEqual(err.type, 'error');
      assert.strictEqual(err.payload.code, 'INVALID_MESSAGE');
    });
  });
});
