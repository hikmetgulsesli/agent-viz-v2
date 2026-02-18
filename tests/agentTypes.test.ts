/**
 * Type definition tests for AgentViz
 */

import { describe, it, expect } from 'vitest';
import type {
  AgentEventType,
  AgentStatus,
  Agent,
  AgentEvent,
  AgentEventPayload,
  ToolCall,
  TokenUsage,
  ConnectionStatus,
} from '../src/types/agent';

describe('AgentEventType', () => {
  it('should include all required event types', () => {
    const eventTypes: AgentEventType[] = [
      'agent_started',
      'agent_ended',
      'tool_called',
      'model_switched',
      'token_update',
      'heartbeat',
    ];

    expect(eventTypes).toHaveLength(6);
    expect(eventTypes).toContain('agent_started');
    expect(eventTypes).toContain('agent_ended');
    expect(eventTypes).toContain('tool_called');
    expect(eventTypes).toContain('model_switched');
    expect(eventTypes).toContain('token_update');
    expect(eventTypes).toContain('heartbeat');
  });
});

describe('AgentStatus', () => {
  it('should include all required status values', () => {
    const statuses: AgentStatus[] = ['running', 'idle', 'error'];

    expect(statuses).toHaveLength(3);
    expect(statuses).toContain('running');
    expect(statuses).toContain('idle');
    expect(statuses).toContain('error');
  });
});

describe('ConnectionStatus', () => {
  it('should include all required connection states', () => {
    const states: ConnectionStatus[] = ['connecting', 'connected', 'disconnected', 'error'];

    expect(states).toHaveLength(4);
  });
});

describe('Agent interface', () => {
  it('should create a valid Agent object', () => {
    const agent: Agent = {
      id: 'agent-001',
      name: 'Test Agent',
      status: 'running',
      currentModel: 'gpt-4',
      tools: [],
      tokensUsed: {
        input: 1000,
        output: 500,
        total: 1500,
      },
      startedAt: Date.now(),
    };

    expect(agent.id).toBe('agent-001');
    expect(agent.name).toBe('Test Agent');
    expect(agent.status).toBe('running');
    expect(agent.currentModel).toBe('gpt-4');
    expect(agent.tools).toEqual([]);
    expect(agent.tokensUsed.total).toBe(1500);
  });

  it('should allow adding tools to an agent', () => {
    const tool: ToolCall = {
      name: 'read_file',
      args: { path: '/test.txt' },
      startedAt: Date.now(),
    };

    const agent: Agent = {
      id: 'agent-001',
      name: 'Test Agent',
      status: 'running',
      currentModel: 'gpt-4',
      tools: [tool],
      tokensUsed: {
        input: 0,
        output: 0,
        total: 0,
      },
    };

    expect(agent.tools).toHaveLength(1);
    expect(agent.tools[0].name).toBe('read_file');
  });
});

describe('AgentEvent interface', () => {
  it('should create a valid AgentEvent for agent_started', () => {
    const event: AgentEvent = {
      timestamp: Date.now(),
      agentId: 'agent-001',
      eventType: 'agent_started',
      payload: {
        name: 'Test Agent',
        model: 'gpt-4',
      },
    };

    expect(event.eventType).toBe('agent_started');
    expect(event.agentId).toBe('agent-001');
    expect(event.payload).toHaveProperty('name');
    expect(event.payload).toHaveProperty('model');
  });

  it('should create a valid AgentEvent for tool_called', () => {
    const event: AgentEvent = {
      timestamp: Date.now(),
      agentId: 'agent-001',
      eventType: 'tool_called',
      payload: {
        toolName: 'read_file',
        args: { path: '/test.txt' },
      },
    };

    expect(event.eventType).toBe('tool_called');
    expect(event.payload).toHaveProperty('toolName');
  });

  it('should create a valid AgentEvent for token_update', () => {
    const event: AgentEvent = {
      timestamp: Date.now(),
      agentId: 'agent-001',
      eventType: 'token_update',
      payload: {
        input: 500,
        output: 250,
      },
    };

    expect(event.eventType).toBe('token_update');
    expect(event.payload).toHaveProperty('input');
    expect(event.payload).toHaveProperty('output');
  });

  it('should create a valid AgentEvent for model_switched', () => {
    const event: AgentEvent = {
      timestamp: Date.now(),
      agentId: 'agent-001',
      eventType: 'model_switched',
      payload: {
        previousModel: 'gpt-4',
        newModel: 'gpt-4-turbo',
      },
    };

    expect(event.eventType).toBe('model_switched');
    expect(event.payload).toHaveProperty('previousModel');
    expect(event.payload).toHaveProperty('newModel');
  });
});

describe('TokenUsage', () => {
  it('should correctly calculate total tokens', () => {
    const tokens: TokenUsage = {
      input: 1000,
      output: 500,
      total: 1500,
    };

    expect(tokens.input + tokens.output).toBe(tokens.total);
  });

  it('should handle zero tokens', () => {
    const tokens: TokenUsage = {
      input: 0,
      output: 0,
      total: 0,
    };

    expect(tokens.total).toBe(0);
  });
});
