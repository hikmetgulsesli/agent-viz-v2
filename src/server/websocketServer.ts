/**
 * Express WebSocket Server
 * 
 * Provides a WebSocket endpoint for real-time agent event streaming.
 * Built with Express and the 'ws' library.
 * 
 * Features:
 * - WebSocket endpoint at ws://host:port
 * - Broadcasts agent events to all connected clients
 * - Simulates agent events for demo/testing
 * - Health check endpoint at /health
 * - Graceful shutdown handling
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import type { AgentEvent, AgentEventType, AgentStatus } from '../client/types/agentEvents.js';

// Configuration
const DEFAULT_PORT = 18789;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SIMULATION_INTERVAL = 2000; // 2 seconds between simulated events

// Server state
interface ServerState {
  wss: WebSocketServer | null;
  server: ReturnType<typeof createServer> | null;
  heartbeatInterval: ReturnType<typeof setInterval> | null;
  simulationInterval: ReturnType<typeof setInterval> | null;
  clients: Set<WebSocket>;
  isRunning: boolean;
}

const state: ServerState = {
  wss: null,
  server: null,
  heartbeatInterval: null,
  simulationInterval: null,
  clients: new Set(),
  isRunning: false,
};

// Sample data for simulation
const SAMPLE_AGENT_IDS = ['agent-001', 'agent-002', 'agent-003', 'agent-004'];
const SAMPLE_MODELS = ['gpt-4', 'gpt-4-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'];
const SAMPLE_TOOLS = ['search_web', 'read_file', 'write_file', 'execute_code', 'send_message'];
const SAMPLE_TASKS = [
  'Analyzing codebase structure',
  'Generating documentation',
  'Refactoring module',
  'Writing tests',
  'Reviewing PR',
];

/**
 * Create a WebSocket message in the expected format
 */
function createMessage(type: 'agent_event' | 'agent_activity' | 'heartbeat' | 'error', payload: unknown): string {
  return JSON.stringify({ type, payload });
}

/**
 * Generate a random agent event for simulation
 */
function generateRandomEvent(): AgentEvent {
  const agentId = SAMPLE_AGENT_IDS[Math.floor(Math.random() * SAMPLE_AGENT_IDS.length)];
  const timestamp = Date.now();
  const eventTypes: AgentEventType[] = ['agent_started', 'agent_ended', 'tool_called', 'model_switched', 'token_update', 'heartbeat'];
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

  const baseEvent = {
    agentId,
    timestamp,
    type,
  };

  switch (type) {
    case 'agent_started':
      return {
        ...baseEvent,
        type: 'agent_started',
        data: {
          model: SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)],
          task: SAMPLE_TASKS[Math.floor(Math.random() * SAMPLE_TASKS.length)],
        },
      };

    case 'agent_ended':
      return {
        ...baseEvent,
        type: 'agent_ended',
        data: {
          reason: Math.random() > 0.8 ? 'error' : 'completed',
          finalTokenCount: Math.floor(Math.random() * 10000) + 1000,
        },
      };

    case 'tool_called':
      return {
        ...baseEvent,
        type: 'tool_called',
        data: {
          toolName: SAMPLE_TOOLS[Math.floor(Math.random() * SAMPLE_TOOLS.length)],
          toolInput: { query: 'sample query', path: '/tmp/file.txt' },
          duration: Math.floor(Math.random() * 5000) + 100,
        },
      };

    case 'model_switched':
      return {
        ...baseEvent,
        type: 'model_switched',
        data: {
          previousModel: SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)],
          newModel: SAMPLE_MODELS[Math.floor(Math.random() * SAMPLE_MODELS.length)],
          reason: 'Cost optimization',
        },
      };

    case 'token_update':
      return {
        ...baseEvent,
        type: 'token_update',
        data: {
          promptTokens: Math.floor(Math.random() * 5000) + 100,
          completionTokens: Math.floor(Math.random() * 3000) + 50,
          totalTokens: Math.floor(Math.random() * 8000) + 150,
          delta: Math.floor(Math.random() * 500) + 10,
        },
      };

    case 'heartbeat':
      return {
        ...baseEvent,
        type: 'heartbeat',
        data: {
          status: (['active', 'idle', 'error'][Math.floor(Math.random() * 3)]) as AgentStatus,
        },
      };

    default:
      return baseEvent as AgentEvent;
  }
}

/**
 * Broadcast a message to all connected WebSocket clients
 */
function broadcast(message: string): void {
  state.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Send a message to a specific client
 */
function sendToClient(client: WebSocket, message: string): void {
  if (client.readyState === WebSocket.OPEN) {
    client.send(message);
  }
}

/**
 * Start the heartbeat interval to keep connections alive
 */
function startHeartbeat(): void {
  state.heartbeatInterval = setInterval(() => {
    state.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Send ping frame (handled automatically by ws library)
        client.ping();
      }
    });
  }, HEARTBEAT_INTERVAL);
}

/**
 * Start the event simulation for demo purposes
 */
function startSimulation(): void {
  state.simulationInterval = setInterval(() => {
    const event = generateRandomEvent();
    const message = createMessage('agent_event', event);
    broadcast(message);
  }, SIMULATION_INTERVAL);
}

/**
 * Stop the event simulation
 */
function stopSimulation(): void {
  if (state.simulationInterval) {
    clearInterval(state.simulationInterval);
    state.simulationInterval = null;
  }
}

/**
 * Handle WebSocket connection
 */
function handleWebSocketConnection(ws: WebSocket): void {
  // Add client to set
  state.clients.add(ws);
  console.log(`[WebSocket] Client connected. Total clients: ${state.clients.size}`);

  // Send welcome message
  sendToClient(ws, createMessage('agent_event', {
    type: 'agent_started',
    agentId: 'system',
    timestamp: Date.now(),
    data: { message: 'Connected to AgentViz WebSocket server' },
  }));

  // Handle messages from client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('[WebSocket] Received message:', message);

      // Echo back with acknowledgment
      sendToClient(ws, createMessage('agent_event', {
        type: 'heartbeat',
        agentId: 'system',
        timestamp: Date.now(),
        data: { received: message },
      }));
    } catch (err) {
      console.error('[WebSocket] Failed to parse message:', err);
      sendToClient(ws, createMessage('error', {
        code: 'INVALID_MESSAGE',
        message: 'Failed to parse message as JSON',
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    state.clients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Total clients: ${state.clients.size}`);
  });

  // Handle errors
  ws.on('error', (err) => {
    console.error('[WebSocket] Client error:', err);
    state.clients.delete(ws);
  });

  // Handle pong (response to ping)
  ws.on('pong', () => {
    // Client is alive, connection is healthy
    ws.isAlive = true;
  });
}

/**
 * Create and configure the Express app
 */
function createApp(): express.Application {
  const app = express();

  // Middleware
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      clients: state.clients.size,
      timestamp: new Date().toISOString(),
    });
  });

  // API endpoint to manually trigger an event (for testing)
  app.post('/api/events', (req, res) => {
    const event = req.body as AgentEvent;
    
    if (!event.type || !event.agentId) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Event must have type and agentId',
        },
      });
      return;
    }

    const message = createMessage('agent_event', {
      ...event,
      timestamp: event.timestamp || Date.now(),
    });
    
    broadcast(message);
    
    res.status(201).json({
      data: { sent: true, clients: state.clients.size },
    });
  });

  // Get server stats
  app.get('/api/stats', (_req, res) => {
    res.json({
      data: {
        connectedClients: state.clients.size,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
  });

  return app;
}

/**
 * Start the WebSocket server
 */
export function startServer(port: number = DEFAULT_PORT): Promise<{ port: number; url: string }> {
  return new Promise((resolve, reject) => {
    if (state.isRunning) {
      reject(new Error('Server is already running'));
      return;
    }

    const app = createApp();
    const server = createServer(app);

    // Create WebSocket server
    const wss = new WebSocketServer({ server });

    // Handle WebSocket connections
    wss.on('connection', handleWebSocketConnection);

    // Handle WebSocket server errors
    wss.on('error', (err) => {
      console.error('[WebSocketServer] Error:', err);
    });

    // Start HTTP server
    server.listen(port, () => {
      console.log(`[Server] HTTP server listening on port ${port}`);
      console.log(`[Server] WebSocket endpoint: ws://localhost:${port}`);
      console.log(`[Server] Health check: http://localhost:${port}/health`);

      state.server = server;
      state.wss = wss;
      state.isRunning = true;

      // Start heartbeat and simulation
      startHeartbeat();
      startSimulation();

      resolve({ port, url: `ws://localhost:${port}` });
    });

    server.on('error', (err) => {
      console.error('[Server] HTTP server error:', err);
      reject(err);
    });
  });
}

/**
 * Stop the WebSocket server
 */
export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!state.isRunning) {
      resolve();
      return;
    }

    console.log('[Server] Shutting down...');

    // Stop intervals
    if (state.heartbeatInterval) {
      clearInterval(state.heartbeatInterval);
      state.heartbeatInterval = null;
    }
    stopSimulation();

    // Close all client connections
    state.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });
    state.clients.clear();

    // Close WebSocket server
    state.wss?.close(() => {
      console.log('[Server] WebSocket server closed');

      // Close HTTP server
      state.server?.close(() => {
        console.log('[Server] HTTP server closed');
        state.server = null;
        state.wss = null;
        state.isRunning = false;
        resolve();
      });
    });
  });
}

/**
 * Get current server state
 */
export function getServerState(): Readonly<ServerState> {
  return { ...state };
}

// Extend WebSocket interface to track alive status
declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.WS_PORT || String(DEFAULT_PORT), 10);
  
  startServer(port).catch((err) => {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    stopServer().then(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    stopServer().then(() => process.exit(0));
  });
}

export default { startServer, stopServer, getServerState };
