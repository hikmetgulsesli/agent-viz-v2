import { useState, useEffect, useRef, useCallback } from 'react';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketEvent {
  type: string;
  payload: unknown;
  timestamp: number;
}

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  events: WebSocketEvent[];
  lastError: Error | null;
  reconnect: () => void;
  send: (message: string | object) => void;
  clearEvents: () => void;
}

interface UseWebSocketOptions {
  url: string;
  mockMode?: boolean;
  mockEvents?: WebSocketEvent[];
  maxReconnectDelay?: number;
  initialReconnectDelay?: number;
  maxEvents?: number;
  autoReconnect?: boolean;
}

// Mock WebSocket event generator for development
function generateMockEvents(): WebSocketEvent[] {
  return [
    {
      type: 'agent:start',
      payload: { agentId: 'agent-1', name: 'Developer Agent' },
      timestamp: Date.now(),
    },
    {
      type: 'tool:call',
      payload: { agentId: 'agent-1', tool: 'read', args: { file: 'src/App.tsx' } },
      timestamp: Date.now() + 100,
    },
    {
      type: 'model:transition',
      payload: { agentId: 'agent-1', from: 'gpt-4', to: 'gpt-4-turbo' },
      timestamp: Date.now() + 200,
    },
  ];
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    mockMode = import.meta.env.VITE_MOCK_WS === 'true',
    mockEvents,
    maxReconnectDelay = 30000,
    initialReconnectDelay = 1000,
    maxEvents = 1000,
    autoReconnect = true,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [events, setEvents] = useState<WebSocketEvent[]>([]);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualCloseRef = useRef(false);

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback((): number => {
    const delay = initialReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
    return Math.min(delay, maxReconnectDelay);
  }, [initialReconnectDelay, maxReconnectDelay]);

  // Clear any pending reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Add event to the events array (with max limit)
  const addEvent = useCallback((event: WebSocketEvent) => {
    setEvents(prev => {
      const newEvents = [...prev, event];
      if (newEvents.length > maxEvents) {
        return newEvents.slice(newEvents.length - maxEvents);
      }
      return newEvents;
    });
  }, [maxEvents]);

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Send message through WebSocket
  const send = useCallback((message: string | object) => {
    if (mockMode) {
      console.log('[Mock WebSocket] Send:', message);
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [mockMode]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (mockMode) {
      setStatus('connected');
      setLastError(null);
      
      // Simulate receiving mock events
      const eventsToUse = mockEvents || generateMockEvents();
      eventsToUse.forEach((event, index) => {
        setTimeout(() => {
          addEvent(event);
        }, index * 500);
      });
      
      return;
    }

    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    clearReconnectTimeout();
    setStatus('connecting');
    setLastError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        setLastError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addEvent({
            type: data.type || 'unknown',
            payload: data.payload || data,
            timestamp: Date.now(),
          });
        } catch {
          // Handle non-JSON messages
          addEvent({
            type: 'message',
            payload: event.data,
            timestamp: Date.now(),
          });
        }
      };

      ws.onerror = (error) => {
        setStatus('error');
        setLastError(new Error('WebSocket error occurred'));
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;

        // Only auto-reconnect if not manually closed and autoReconnect is enabled
        if (!isManualCloseRef.current && autoReconnect) {
          const delay = getReconnectDelay();
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
        
        isManualCloseRef.current = false;
      };
    } catch (error) {
      setStatus('error');
      setLastError(error instanceof Error ? error : new Error('Failed to connect'));
      
      // Schedule reconnect only if autoReconnect is enabled
      if (autoReconnect) {
        const delay = getReconnectDelay();
        reconnectAttemptsRef.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    }
  }, [url, mockMode, mockEvents, getReconnectDelay, clearReconnectTimeout, addEvent]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    // Close existing connection
    if (wsRef.current) {
      isManualCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
    
    clearReconnectTimeout();
    reconnectAttemptsRef.current = 0;
    setEvents([]);
    
    // Small delay to ensure clean state
    setTimeout(() => {
      connect();
    }, 100);
  }, [connect, clearReconnectTimeout]);

  // Connect on mount
  useEffect(() => {
    isManualCloseRef.current = false;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      isManualCloseRef.current = true;
      clearReconnectTimeout();
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, clearReconnectTimeout]);

  return {
    status,
    events,
    lastError,
    reconnect,
    send,
    clearEvents,
  };
}

export default useWebSocket;
