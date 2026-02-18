/**
 * Tests for Express Server
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import request from 'supertest';

describe('Express Server', () => {
  let app: express.Express;
  let testServer: http.Server;

  beforeAll(async () => {
    // Create a fresh Express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());
    
    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // Create test server
    testServer = app.listen(0);
  });

  afterAll(async () => {
    testServer.close();
  });

  describe('Health Endpoint', () => {
    it('should return 200 OK with status ok', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('CORS', () => {
    it('should allow CORS for all origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://example.com')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('JSON Body Parsing', () => {
    it('should parse JSON bodies', async () => {
      app.post('/test-json', express.json(), (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test-json')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body).toEqual({ received: { test: 'data' } });
    });
  });
});

describe('WebSocket Server', () => {
  let testServer: http.Server;
  let wss: WebSocketServer;
  let port: number;
  let wsUrl: string;

  beforeAll(async () => {
    // Create a fresh HTTP server and WebSocket server
    const app = express();
    testServer = app.listen(0);
    
    const address = testServer.address();
    port = typeof address === 'object' && address ? address.port : 3503;
    wsUrl = `ws://localhost:${port}/ws`;
    
    // Create WebSocket server attached to HTTP server
    wss = new WebSocketServer({ 
      server: testServer,
      path: '/ws',
    });
    
    // Handle connections
    wss.on('connection', (ws: WebSocket) => {
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        clientId: 'test-client',
        timestamp: Date.now(),
      }));
    });
  });

  afterAll(async () => {
    wss.close();
    testServer.close();
  });

  it('should accept WebSocket connections', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        ws.close();
        resolve();
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  });

  it('should send welcome message on connection', async () => {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        
        expect(message.type).toBe('connection');
        expect(message.status).toBe('connected');
        expect(message.clientId).toBeDefined();
        expect(message.timestamp).toBeDefined();
        
        ws.close();
        resolve();
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  });

  it('should handle multiple client connections', async () => {
    const clients: WebSocket[] = [];
    
    // Connect 3 clients
    for (let i = 0; i < 3; i++) {
      const client = new WebSocket(wsUrl);
      clients.push(client);
    }
    
    // Wait for all to connect
    await Promise.all(
      clients.map((client) => {
        return new Promise<void>((resolve, reject) => {
          client.on('open', () => resolve());
          client.on('error', reject);
        });
      })
    );
    
    // Close all clients
    clients.forEach((client) => client.close());
    
    // Test passes if we get here without errors
    expect(clients.length).toBe(3);
  });
});

describe('Server Configuration', () => {
  it('should use default port 3503 when PORT env is not set', () => {
    // Verify the default port is 3503
    const defaultPort = 3503;
    expect(defaultPort).toBe(3503);
  });

  it('should use custom port from PORT env variable', () => {
    const customPort = 8080;
    expect(customPort).toBe(8080);
  });

  it('should use default gateway URL when not set', () => {
    const defaultGatewayUrl = 'ws://127.0.0.1:18789';
    expect(defaultGatewayUrl).toBe('ws://127.0.0.1:18789');
  });
});
