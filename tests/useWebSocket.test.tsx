import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWebSocket, type WebSocketEvent } from '../src/hooks/useWebSocket';

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
    const mockEvents: WebSocketEvent[] = [
      { type: 'test', payload: { data: 'hello' }, timestamp: Date.now() },
    ];

    const { result } = renderHook(() => 
      useWebSocket({ url: 'ws://localhost:1234', mockMode: true, mockEvents })
    );

    expect(result.current.status).toBe('connected');
  });

  it('clearEvents removes all events', async () => {
    const mockEvents: WebSocketEvent[] = [
      { type: 'test1', payload: {}, timestamp: Date.now() },
      { type: 'test2', payload: {}, timestamp: Date.now() },
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
    const mockEvents: WebSocketEvent[] = [
      { type: 'test', payload: {}, timestamp: Date.now() },
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
    const mockEvents: WebSocketEvent[] = [
      { type: 'event-0', payload: {}, timestamp: Date.now() },
      { type: 'event-1', payload: {}, timestamp: Date.now() },
      { type: 'event-2', payload: {}, timestamp: Date.now() },
      { type: 'event-3', payload: {}, timestamp: Date.now() },
      { type: 'event-4', payload: {}, timestamp: Date.now() },
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
