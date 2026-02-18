/**
 * Express Server for AgentViz v2
 * 
 * Serves static files and proxies WebSocket connections to OpenClaw gateway.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3503;
const GATEWAY_WS_URL = process.env.GATEWAY_WS_URL || 'ws://127.0.0.1:18789';
const STATIC_DIR = path.resolve(__dirname, '../../dist/client');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];

// Create Express app
const app = express();

// CORS configuration - restrict to allowed origins in production
const corsOptions: cors.CorsOptions = {
  origin: ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : true, // Allow all in dev, restrict in prod
  credentials: true,
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for clients
const wss = new WebSocketServer({ 
  server,
  path: '/ws',
});

// Track connected clients
interface ClientInfo {
  ws: WebSocket;
  id: string;
  connectedAt: number;
}

const clients = new Map<string, ClientInfo>();
let clientIdCounter = 0;

// Gateway WebSocket connection
let gatewayWs: WebSocket | null = null;
let gatewayReconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let gatewayReconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;
const INITIAL_RECONNECT_DELAY = 1000;

/**
 * Generate a unique client ID
 */
function generateClientId(): string {
  return `client-${++clientIdCounter}-${Date.now()}`;
}

/**
 * Calculate exponential backoff delay
 */
function getReconnectDelay(): number {
  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, gatewayReconnectAttempts);
  return Math.min(delay, MAX_RECONNECT_DELAY);
}

/**
 * Clear gateway reconnect timeout
 */
function clearGatewayReconnectTimeout(): void {
  if (gatewayReconnectTimeout) {
    clearTimeout(gatewayReconnectTimeout);
    gatewayReconnectTimeout = null;
  }
}

/**
 * Broadcast a message to all connected clients
 */
function broadcastToClients(message: string | object): void {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(messageStr);
    }
  });
}

/**
 * Connect to the OpenClaw gateway WebSocket
 */
function connectToGateway(): void {
  // Don't connect if already connected or connecting
  if (gatewayWs?.readyState === WebSocket.OPEN || 
      gatewayWs?.readyState === WebSocket.CONNECTING) {
    return;
  }

  clearGatewayReconnectTimeout();

  console.log(`[Gateway] Connecting to ${GATEWAY_WS_URL}...`);

  try {
    gatewayWs = new WebSocket(GATEWAY_WS_URL);

    gatewayWs.on('open', () => {
      console.log('[Gateway] Connected to OpenClaw gateway');
      gatewayReconnectAttempts = 0;
      
      // Notify all clients that gateway is connected
      broadcastToClients({
        type: 'connection',
        status: 'connected',
        timestamp: Date.now(),
      });
    });

    gatewayWs.on('message', (data) => {
      // Forward gateway messages to all connected clients
      const messageStr = data.toString();
      
      try {
        // Parse and validate the message
        const parsed = JSON.parse(messageStr);
        
        // Forward to all clients
        broadcastToClients({
          type: 'event',
          data: parsed,
          timestamp: Date.now(),
        });
      } catch {
        // Forward raw message if not valid JSON
        broadcastToClients({
          type: 'event',
          data: { raw: messageStr },
          timestamp: Date.now(),
        });
      }
    });

    gatewayWs.on('error', (error) => {
      console.error('[Gateway] WebSocket error:', error.message);
    });

    gatewayWs.on('close', () => {
      console.log('[Gateway] Connection closed');
      gatewayWs = null;
      
      // Notify clients that gateway is disconnected
      broadcastToClients({
        type: 'connection',
        status: 'disconnected',
        timestamp: Date.now(),
      });
      
      // Schedule reconnect
      const delay = getReconnectDelay();
      gatewayReconnectAttempts++;
      
      console.log(`[Gateway] Reconnecting in ${delay}ms (attempt ${gatewayReconnectAttempts})`);
      
      gatewayReconnectTimeout = setTimeout(() => {
        connectToGateway();
      }, delay);
    });
  } catch (error) {
    console.error('[Gateway] Failed to connect:', error);
    
    // Schedule reconnect
    const delay = getReconnectDelay();
    gatewayReconnectAttempts++;
    
    gatewayReconnectTimeout = setTimeout(() => {
      connectToGateway();
    }, delay);
  }
}

/**
 * Handle client WebSocket connections
 */
wss.on('connection', (ws: WebSocket) => {
  const clientId = generateClientId();
  const clientInfo: ClientInfo = {
    ws,
    id: clientId,
    connectedAt: Date.now(),
  };
  
  clients.set(clientId, clientInfo);
  console.log(`[Client] Connected: ${clientId} (total: ${clients.size})`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    clientId,
    gatewayConnected: gatewayWs?.readyState === WebSocket.OPEN,
    timestamp: Date.now(),
  }));
  
  // Handle client messages
  ws.on('message', (data) => {
    const messageStr = data.toString();
    console.log(`[Client] Message from ${clientId}:`, messageStr);
    
    // Forward to gateway if connected
    if (gatewayWs?.readyState === WebSocket.OPEN) {
      gatewayWs.send(messageStr);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[Client] Disconnected: ${clientId} (total: ${clients.size})`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`[Client] Error for ${clientId}:`, error);
  });
});

// Serve static files from dist/client
app.use(express.static(STATIC_DIR));

// Serve index.html for all other routes (SPA support)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`[Server] AgentViz v2 server running on port ${PORT}`);
  console.log(`[Server] Static files served from: ${STATIC_DIR}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
  console.log(`[Server] WebSocket endpoint: ws://localhost:${PORT}/ws`);
  console.log(`[Server] Gateway proxy: ${GATEWAY_WS_URL}`);
  console.log(`[Server] Allowed origins: ${ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS.join(', ') : 'all (development)'}`);
  
  // Connect to gateway
  connectToGateway();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  
  clearGatewayReconnectTimeout();
  
  if (gatewayWs) {
    gatewayWs.close();
  }
  
  clients.forEach((client) => {
    client.ws.close();
  });
  
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  
  clearGatewayReconnectTimeout();
  
  if (gatewayWs) {
    gatewayWs.close();
  }
  
  clients.forEach((client) => {
    client.ws.close();
  });
  
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

export { app, server, wss };
