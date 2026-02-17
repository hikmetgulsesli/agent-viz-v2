/**
 * Server entry point
 * 
 * Starts the Express WebSocket server for AgentViz.
 * 
 * Usage:
 *   npm run server          # Start server on default port (18789)
 *   WS_PORT=3000 npm run server  # Start on custom port
 */

import { startServer, stopServer } from './websocketServer.js';

const DEFAULT_PORT = 18789;
const port = parseInt(process.env.WS_PORT || String(DEFAULT_PORT), 10);

console.log('[AgentViz Server] Starting...');
console.log(`[AgentViz Server] Port: ${port}`);

startServer(port)
  .then(({ url }) => {
    console.log('[AgentViz Server] Ready');
    console.log(`[AgentViz Server] WebSocket URL: ${url}`);
  })
  .catch((err) => {
    console.error('[AgentViz Server] Failed to start:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[AgentViz Server] Received SIGTERM, shutting down...');
  stopServer().then(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[AgentViz Server] Received SIGINT, shutting down...');
  stopServer().then(() => process.exit(0));
});
