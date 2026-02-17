/**
 * useWebSocket hook
 * 
 * Connects to OpenClaw gateway WebSocket with auto-reconnection.
 * Handles connection states, message parsing, and exponential backoff.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface AgentEvent {
  type: string;
  agentId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface AgentActivity {
  agentId: string;
  status: 'active' | 'idle' | 'error';
  currentModel?: string;
  toolsUsed: string[];
  tokenCount: number;
  lastActivity: number;
}

export interface WebSocketMessage {
  type: 'agent_event' | 'agent_activity' | 'heartbeat' | 'error';
  payload: AgentEvent | AgentActivity | Record<string, unknown>;
}

export interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  reconnectDecay?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  send: (data: string | object) => void;
}

const DEFAULT_URL = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_OPENCLAW_WS_URL) 
  ? import.meta.env.VITE_OPENCLAW_WS_URL 
  : 'ws://127.0.0.1:18789';
const DEFAULT_RECONNECT_INTERVAL = 1000; // 1 second base
const DEFAULT_MAX_RECONNECT_INTERVAL = 30000; // 30 seconds max
const DEFAULT_RECONNECT_DECAY = 2; // Exponential backoff multiplier
const DEFAULT_MAX_RECONNECT_ATTEMPTS = Infinity;

/**
 * Validates incoming WebSocket message structure
 */
function isValidMessage(data: unknown): data is WebSocketMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const msg = data as Record<string, unknown>;
  
  // Must have a type field that's a string
  if (typeof msg.type !== 'string') {
    return false;
  }
  
  // Must have a payload field that's an object
  if (typeof msg.payload !== 'object' || msg.payload === null) {
    return false;
  }
  
  // Validate known message types
  const validTypes = ['agent_event', 'agent_activity', 'heartbeat', 'error'];
  if (!validTypes.includes(msg.type)) {
    return false;
  }
  
  return true;
}

/**
 * React hook for WebSocket connection with auto-reconnection
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = DEFAULT_URL,
    reconnectInterval = DEFAULT_RECONNECT_INTERVAL,
    maxReconnectInterval = DEFAULT_MAX_RECONNECT_INTERVAL,
    reconnectDecay = DEFAULT_RECONNECT_DECAY,
    maxReconnectAttempts = DEFAULT_MAX_RECONNECT_ATTEMPTS,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isManualDisconnectRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const getReconnectDelay = useCallback((): number => {
    const delay = reconnectInterval * Math.pow(reconnectDecay, reconnectAttemptsRef.current);
    return Math.min(delay, maxReconnectInterval);
  }, [reconnectInterval, reconnectDecay, maxReconnectInterval]);

  const scheduleReconnect = useCallback(() => {
    if (isManualDisconnectRef.current) {
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.warn('[useWebSocket] Max reconnection attempts reached');
      setError(new Error('Max reconnection attempts reached'));
      setStatus('disconnected');
      return;
    }

    const delay = getReconnectDelay();
    console.log(`[useWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      connectInternal();
    }, delay);
  }, [getReconnectDelay, maxReconnectAttempts]);

  const connectInternal = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useWebSocket] Connected');
        setStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (!isValidMessage(data)) {
            console.warn('[useWebSocket] Invalid message received:', data);
            return;
          }
          
          setLastMessage(data);
        } catch (err) {
          console.warn('[useWebSocket] Failed to parse message:', event.data, err);
        }
      };

      ws.onerror = (event) => {
        console.error('[useWebSocket] WebSocket error:', event);
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('[useWebSocket] Disconnected');
        setStatus('disconnected');
        wsRef.current = null;
        
        if (!isManualDisconnectRef.current) {
          scheduleReconnect();
        }
      };
    } catch (err) {
      console.error('[useWebSocket] Failed to create WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Failed to create WebSocket'));
      setStatus('disconnected');
      scheduleReconnect();
    }
  }, [url, scheduleReconnect]);

  const connect = useCallback(() => {
    isManualDisconnectRef.current = false;
    reconnectAttemptsRef.current = 0;
    clearReconnectTimer();
    connectInternal();
  }, [connectInternal, clearReconnectTimer]);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearReconnectTimer();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimer]);

  const send = useCallback((data: string | object) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('[useWebSocket] Cannot send, WebSocket not connected');
      return;
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    wsRef.current.send(message);
  }, []);

  // Connect on mount
  useEffect(() => {
    isManualDisconnectRef.current = false;
    connectInternal();

    return () => {
      clearReconnectTimer();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connectInternal, clearReconnectTimer]);

  return {
    status,
    lastMessage,
    error,
    connect,
    disconnect,
    send,
  };
}

export default useWebSocket;
