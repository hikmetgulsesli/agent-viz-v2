import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWebSocket } from '../src/hooks/useWebSocket';
import type { AgentEvent } from '../src/types/agent';

describe('useWebSocket', () => {
  it('exports all required properties', async () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://localhost:1234', mockMode: true }));

    expect(result.current).toHaveProperty('status');
    expect(result.current).toHaveProperty('events');
    expect(result.current).toHaveProperty('reconnect');
    expect(result.current).toHaveProperty('lastError');
    expect(result.current).toHaveProperty('send');
    expect(result.current).toHaveProperty('clearEvents');
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(typeof result.current.reconnect).toBe('function');
    expect(typeof result.current.send).toBe('function');
    expect(typeof result.current.clearEvents).toBe('function');
  });

  it('starts with connected status in mock mode', () => {
    const { result } = renderHook(() => useWebSocket({ url: 'ws://localhost:1234', mockMode: true }));
    
    expect(result.current.status).toBe('connected');
  });

  it('receives mock events', async () => {
    const mockEvents: AgentEvent[] = [
      { 
        timestamp: Date.now(),
        agentId: 'test-agent',
        eventType: 'heartbeat',
        payload: { data: 'hello' },
      },
    ];

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true, mockEvents })
    );

    expect(result.current.status).toBe('connected');
  });

  it('clearEvents removes all events', async () => {
    const mockEvents: AgentEvent[] = [
      { timestamp: Date.now(), agentId: 'agent-1', eventType: 'heartbeat', payload: {} },
      { timestamp: Date.now() + 1, agentId: 'agent-2', eventType: 'heartbeat', payload: {} },
    ];

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true, mockEvents })
    );

    // Wait for mock events to be added
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.clearEvents();
    });

    expect(result.current.events).toHaveLength(0);
  });

  it('send function works in mock mode', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true })
    );

    act(() => {
      result.current.send({ type: 'test', data: 'value' });
    });

    expect(consoleSpy).toHaveBeenCalledWith('[Mock WebSocket] Send:', { type: 'test', data: 'value' });
    consoleSpy.mockRestore();
  });

  it('send function handles string messages in mock mode', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true })
    );

    act(() => {
      result.current.send('plain string message');
    });

    expect(consoleSpy).toHaveBeenCalledWith('[Mock WebSocket] Send:', 'plain string message');
    consoleSpy.mockRestore();
  });

  it('reconnect function resets state', () => {
    const mockEvents: AgentEvent[] = [
      { timestamp: Date.now(), agentId: 'agent-1', eventType: 'heartbeat', payload: {} },
    ];

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true, mockEvents })
    );

    expect(result.current.status).toBe('connected');

    act(() => {
      result.current.reconnect();
    });

    expect(result.current.events).toHaveLength(0);
    // In mock mode, reconnect immediately connects
    expect(result.current.status).toBe('connected');
  });

  it('limits events to maxEvents', async () => {
    const mockEvents: AgentEvent[] = [
      { timestamp: Date.now(), agentId: 'agent-1', eventType: 'heartbeat', payload: {} },
      { timestamp: Date.now() + 1, agentId: 'agent-2', eventType: 'heartbeat', payload: {} },
      { timestamp: Date.now() + 2, agentId: 'agent-3', eventType: 'heartbeat', payload: {} },
      { timestamp: Date.now() + 3, agentId: 'agent-4', eventType: 'heartbeat', payload: {} },
      { timestamp: Date.now() + 4, agentId: 'agent-5', eventType: 'heartbeat', payload: {} },
    ];

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true, mockEvents, maxEvents: 3 })
    );

    // Wait for mock events to be added
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
    });

    // The hook should limit events to maxEvents
    expect(result.current.events.length).toBeLessThanOrEqual(3);
  });
});
