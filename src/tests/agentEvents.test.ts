/**
 * Tests for agent event types and useAgentActivities hook
 * 
 * Tests type validation, event processing, and state updates.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Agent Event Types', () => {
  describe('AgentEventType', () => {
    it('should accept all valid event types', () => {
      const types: string[] = [
        'agent_started',
        'agent_ended',
        'tool_called',
        'model_switched',
        'token_update',
        'heartbeat',
      ];

      for (const type of types) {
        assert.ok(
          ['agent_started', 'agent_ended', 'tool_called', 'model_switched', 'token_update', 'heartbeat'].includes(type),
          `Type ${type} should be valid`
        );
      }
    });
  });

  describe('AgentStatus', () => {
    it('should accept all valid status values', () => {
      const statuses: string[] = ['active', 'idle', 'error', 'ended'];

      for (const status of statuses) {
        assert.ok(
          ['active', 'idle', 'error', 'ended'].includes(status),
          `Status ${status} should be valid`
        );
      }
    });
  });

  describe('AgentStartedEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'agent_started' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          model: 'gpt-4',
          task: 'process request',
        },
      };

      assert.strictEqual(event.type, 'agent_started');
      assert.strictEqual(typeof event.agentId, 'string');
      assert.strictEqual(typeof event.timestamp, 'number');
      assert.strictEqual(typeof event.data, 'object');
    });

    it('should allow optional data fields', () => {
      const event = {
        type: 'agent_started' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
      };

      assert.strictEqual(event.data, undefined);
    });
  });

  describe('AgentEndedEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'agent_ended' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          reason: 'completed' as const,
          finalTokenCount: 1500,
        },
      };

      assert.strictEqual(event.type, 'agent_ended');
      assert.ok(['completed', 'error', 'cancelled'].includes(event.data.reason));
    });
  });

  describe('ToolCalledEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'tool_called' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          toolName: 'read_file',
          toolInput: { path: '/test.txt' },
          duration: 150,
        },
      };

      assert.strictEqual(event.type, 'tool_called');
      assert.strictEqual(event.data.toolName, 'read_file');
    });
  });

  describe('ModelSwitchedEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'model_switched' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          previousModel: 'gpt-3.5',
          newModel: 'gpt-4',
          reason: 'upgrade',
        },
      };

      assert.strictEqual(event.type, 'model_switched');
      assert.strictEqual(event.data.newModel, 'gpt-4');
      assert.strictEqual(event.data.previousModel, 'gpt-3.5');
    });
  });

  describe('TokenUpdateEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'token_update' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          delta: 25,
        },
      };

      assert.strictEqual(event.type, 'token_update');
      assert.strictEqual(event.data.promptTokens, 100);
      assert.strictEqual(event.data.completionTokens, 50);
      assert.strictEqual(event.data.totalTokens, 150);
    });
  });

  describe('HeartbeatEvent', () => {
    it('should have required fields', () => {
      const event = {
        type: 'heartbeat' as const,
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: {
          status: 'active' as const,
        },
      };

      assert.strictEqual(event.type, 'heartbeat');
      assert.ok(['active', 'idle', 'error', 'ended'].includes(event.data.status));
    });
  });
});

describe('AgentActivity', () => {
  describe('AgentActivity structure', () => {
    it('should have all required fields', () => {
      const activity = {
        agentId: 'agent-1',
        status: 'active' as const,
        currentModel: 'gpt-4',
        toolsUsed: [],
        tokenUsage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        lastActivity: Date.now(),
        startedAt: Date.now(),
      };

      assert.strictEqual(typeof activity.agentId, 'string');
      assert.ok(['active', 'idle', 'error', 'ended'].includes(activity.status));
      assert.ok(Array.isArray(activity.toolsUsed));
      assert.strictEqual(typeof activity.tokenUsage.promptTokens, 'number');
      assert.strictEqual(typeof activity.lastActivity, 'number');
      assert.strictEqual(typeof activity.startedAt, 'number');
    });

    it('should allow optional endedAt field', () => {
      const activity = {
        agentId: 'agent-1',
        status: 'ended' as const,
        toolsUsed: [],
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        lastActivity: Date.now(),
        startedAt: Date.now(),
        endedAt: Date.now(),
      };

      assert.strictEqual(typeof activity.endedAt, 'number');
    });
  });

  describe('TokenUsage structure', () => {
    it('should have all required fields', () => {
      const usage = {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      };

      assert.strictEqual(usage.promptTokens, 100);
      assert.strictEqual(usage.completionTokens, 50);
      assert.strictEqual(usage.totalTokens, 150);
    });
  });

  describe('ToolCall structure', () => {
    it('should have required fields', () => {
      const toolCall = {
        toolName: 'read_file',
        timestamp: Date.now(),
      };

      assert.strictEqual(toolCall.toolName, 'read_file');
      assert.strictEqual(typeof toolCall.timestamp, 'number');
    });

    it('should allow optional fields', () => {
      const toolCall = {
        toolName: 'write_file',
        timestamp: Date.now(),
        duration: 200,
        input: { path: '/test.txt', content: 'hello' },
      };

      assert.strictEqual(toolCall.duration, 200);
      assert.deepStrictEqual(toolCall.input, { path: '/test.txt', content: 'hello' });
    });
  });
});

describe('Type Guards', () => {
  /**
   * Type guard implementations for testing
   */
  function isAgentStartedEvent(event: { type: string }): boolean {
    return event.type === 'agent_started';
  }

  function isAgentEndedEvent(event: { type: string }): boolean {
    return event.type === 'agent_ended';
  }

  function isToolCalledEvent(event: { type: string }): boolean {
    return event.type === 'tool_called';
  }

  function isModelSwitchedEvent(event: { type: string }): boolean {
    return event.type === 'model_switched';
  }

  function isTokenUpdateEvent(event: { type: string }): boolean {
    return event.type === 'token_update';
  }

  function isHeartbeatEvent(event: { type: string }): boolean {
    return event.type === 'heartbeat';
  }

  describe('isAgentStartedEvent', () => {
    it('should return true for agent_started events', () => {
      assert.strictEqual(isAgentStartedEvent({ type: 'agent_started' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isAgentStartedEvent({ type: 'agent_ended' }), false);
      assert.strictEqual(isAgentStartedEvent({ type: 'tool_called' }), false);
    });
  });

  describe('isAgentEndedEvent', () => {
    it('should return true for agent_ended events', () => {
      assert.strictEqual(isAgentEndedEvent({ type: 'agent_ended' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isAgentEndedEvent({ type: 'agent_started' }), false);
    });
  });

  describe('isToolCalledEvent', () => {
    it('should return true for tool_called events', () => {
      assert.strictEqual(isToolCalledEvent({ type: 'tool_called' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isToolCalledEvent({ type: 'agent_started' }), false);
    });
  });

  describe('isModelSwitchedEvent', () => {
    it('should return true for model_switched events', () => {
      assert.strictEqual(isModelSwitchedEvent({ type: 'model_switched' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isModelSwitchedEvent({ type: 'agent_started' }), false);
    });
  });

  describe('isTokenUpdateEvent', () => {
    it('should return true for token_update events', () => {
      assert.strictEqual(isTokenUpdateEvent({ type: 'token_update' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isTokenUpdateEvent({ type: 'agent_started' }), false);
    });
  });

  describe('isHeartbeatEvent', () => {
    it('should return true for heartbeat events', () => {
      assert.strictEqual(isHeartbeatEvent({ type: 'heartbeat' }), true);
    });

    it('should return false for other event types', () => {
      assert.strictEqual(isHeartbeatEvent({ type: 'agent_started' }), false);
    });
  });
});

describe('createInitialActivity', () => {
  /**
   * Implementation of createInitialActivity for testing
   */
  function createInitialActivity(
    agentId: string,
    model?: string,
    metadata?: Record<string, unknown>
  ) {
    return {
      agentId,
      status: 'active' as const,
      currentModel: model,
      toolsUsed: [],
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
      lastActivity: Date.now(),
      startedAt: Date.now(),
      metadata,
    };
  }

  it('should create activity with required fields', () => {
    const activity = createInitialActivity('agent-1');

    assert.strictEqual(activity.agentId, 'agent-1');
    assert.strictEqual(activity.status, 'active');
    assert.deepStrictEqual(activity.toolsUsed, []);
    assert.strictEqual(activity.tokenUsage.totalTokens, 0);
    assert.strictEqual(activity.currentModel, undefined);
  });

  it('should include model when provided', () => {
    const activity = createInitialActivity('agent-1', 'gpt-4');

    assert.strictEqual(activity.currentModel, 'gpt-4');
  });

  it('should include metadata when provided', () => {
    const meta = { task: 'test', priority: 1 };
    const activity = createInitialActivity('agent-1', undefined, meta);

    assert.deepStrictEqual(activity.metadata, meta);
  });
});

describe('updateActivityFromEvent', () => {
  /**
   * Implementation of updateActivityFromEvent for testing
   */
  function updateActivityFromEvent(activity: any, event: any): any {
    const updated = {
      ...activity,
      lastActivity: event.timestamp,
    };

    switch (event.type) {
      case 'agent_started':
        updated.status = 'active';
        if (event.data?.model) {
          updated.currentModel = event.data.model;
        }
        if (event.data?.metadata) {
          updated.metadata = { ...updated.metadata, ...event.data.metadata };
        }
        break;

      case 'agent_ended':
        updated.status = event.data?.reason === 'error' ? 'error' : 'ended';
        updated.endedAt = event.timestamp;
        if (event.data?.finalTokenCount) {
          updated.tokenUsage.totalTokens = event.data.finalTokenCount;
        }
        break;

      case 'tool_called':
        updated.toolsUsed = [
          ...updated.toolsUsed,
          {
            toolName: event.data.toolName,
            timestamp: event.timestamp,
            duration: event.data?.duration,
            input: event.data?.toolInput,
          },
        ];
        break;

      case 'model_switched':
        updated.currentModel = event.data.newModel;
        break;

      case 'token_update':
        updated.tokenUsage = {
          promptTokens: event.data.promptTokens,
          completionTokens: event.data.completionTokens,
          totalTokens: event.data.totalTokens,
        };
        break;

      case 'heartbeat':
        updated.status = event.data.status;
        break;
    }

    return updated;
  }

  const baseActivity = {
    agentId: 'agent-1',
    status: 'active' as const,
    currentModel: 'gpt-3.5',
    toolsUsed: [],
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    lastActivity: 1000,
    startedAt: 1000,
  };

  describe('agent_started event', () => {
    it('should update status to active', () => {
      const event = {
        type: 'agent_started' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: {},
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.status, 'active');
      assert.strictEqual(updated.lastActivity, 2000);
    });

    it('should update currentModel when provided', () => {
      const event = {
        type: 'agent_started' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { model: 'gpt-4' },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.currentModel, 'gpt-4');
    });

    it('should merge metadata when provided', () => {
      const activity = { ...baseActivity, metadata: { existing: true } };
      const event = {
        type: 'agent_started' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { metadata: { new: 'value' } },
      };

      const updated = updateActivityFromEvent(activity, event);
      assert.deepStrictEqual(updated.metadata, { existing: true, new: 'value' });
    });
  });

  describe('agent_ended event', () => {
    it('should update status to ended on completion', () => {
      const event = {
        type: 'agent_ended' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { reason: 'completed' as const },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.status, 'ended');
      assert.strictEqual(updated.endedAt, 2000);
    });

    it('should update status to error on error reason', () => {
      const event = {
        type: 'agent_ended' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { reason: 'error' as const },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.status, 'error');
    });

    it('should update final token count when provided', () => {
      const event = {
        type: 'agent_ended' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { reason: 'completed' as const, finalTokenCount: 1500 },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.tokenUsage.totalTokens, 1500);
    });
  });

  describe('tool_called event', () => {
    it('should add tool to toolsUsed array', () => {
      const event = {
        type: 'tool_called' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { toolName: 'read_file' },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.toolsUsed.length, 1);
      assert.strictEqual(updated.toolsUsed[0].toolName, 'read_file');
      assert.strictEqual(updated.toolsUsed[0].timestamp, 2000);
    });

    it('should append to existing toolsUsed array', () => {
      const activity = {
        ...baseActivity,
        toolsUsed: [{ toolName: 'existing_tool', timestamp: 1500 }],
      };
      const event = {
        type: 'tool_called' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { toolName: 'new_tool', duration: 100 },
      };

      const updated = updateActivityFromEvent(activity, event);
      assert.strictEqual(updated.toolsUsed.length, 2);
      assert.strictEqual(updated.toolsUsed[1].toolName, 'new_tool');
      assert.strictEqual(updated.toolsUsed[1].duration, 100);
    });

    it('should include tool input when provided', () => {
      const event = {
        type: 'tool_called' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: {
          toolName: 'write_file',
          toolInput: { path: '/test.txt', content: 'hello' },
        },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.deepStrictEqual(updated.toolsUsed[0].input, { path: '/test.txt', content: 'hello' });
    });
  });

  describe('model_switched event', () => {
    it('should update currentModel', () => {
      const event = {
        type: 'model_switched' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { newModel: 'gpt-4-turbo' },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.currentModel, 'gpt-4-turbo');
    });
  });

  describe('token_update event', () => {
    it('should update all token counts', () => {
      const event = {
        type: 'token_update' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.tokenUsage.promptTokens, 100);
      assert.strictEqual(updated.tokenUsage.completionTokens, 50);
      assert.strictEqual(updated.tokenUsage.totalTokens, 150);
    });
  });

  describe('heartbeat event', () => {
    it('should update status', () => {
      const event = {
        type: 'heartbeat' as const,
        agentId: 'agent-1',
        timestamp: 2000,
        data: { status: 'idle' as const },
      };

      const updated = updateActivityFromEvent(baseActivity, event);
      assert.strictEqual(updated.status, 'idle');
    });
  });
});

describe('AgentActivityMap operations', () => {
  /**
   * Simulates Map-based activity tracking
   */
  function createActivityMap(): Map<string, any> {
    return new Map();
  }

  function addOrUpdateActivity(
    map: Map<string, any>,
    event: any,
    createFn: (id: string) => any,
    updateFn: (activity: any, event: any) => any
  ): Map<string, any> {
    const newMap = new Map(map);
    const existing = newMap.get(event.agentId);

    if (event.type === 'agent_started') {
      if (existing) {
        newMap.set(event.agentId, updateFn(existing, event));
      } else {
        const newActivity = createFn(event.agentId);
        newMap.set(event.agentId, updateFn(newActivity, event));
      }
    } else if (existing) {
      newMap.set(event.agentId, updateFn(existing, event));
    } else {
      // Unknown agent - create placeholder
      const placeholder = createFn(event.agentId);
      newMap.set(event.agentId, updateFn(placeholder, event));
    }

    return newMap;
  }

  const createInitialActivity = (agentId: string) => ({
    agentId,
    status: 'active',
    toolsUsed: [],
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    lastActivity: Date.now(),
    startedAt: Date.now(),
  });

  const updateActivityFromEvent = (activity: any, event: any) => ({
    ...activity,
    lastActivity: event.timestamp,
    status: event.type === 'agent_ended' ? 'ended' : activity.status,
    toolsUsed:
      event.type === 'tool_called'
        ? [...activity.toolsUsed, { toolName: event.data.toolName, timestamp: event.timestamp }]
        : activity.toolsUsed,
    currentModel:
      event.type === 'model_switched'
        ? event.data.newModel
        : event.type === 'agent_started' && event.data?.model
          ? event.data.model
          : activity.currentModel,
    tokenUsage:
      event.type === 'token_update'
        ? event.data
        : activity.tokenUsage,
  });

  describe('agent_started event', () => {
    it('should create new activity for new agent', () => {
      let map = createActivityMap();
      const event = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: {},
      };

      map = addOrUpdateActivity(map, event, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.size, 1);
      assert.ok(map.has('agent-1'));
      assert.strictEqual(map.get('agent-1').status, 'active');
    });

    it('should update existing activity for restarted agent', () => {
      let map = createActivityMap();
      const event1 = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: {},
      };
      map = addOrUpdateActivity(map, event1, createInitialActivity, updateActivityFromEvent);

      const event2 = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 2000,
        data: { model: 'gpt-4' },
      };
      map = addOrUpdateActivity(map, event2, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.size, 1);
      assert.strictEqual(map.get('agent-1').lastActivity, 2000);
    });
  });

  describe('agent_ended event', () => {
    it('should update status to ended', () => {
      let map = createActivityMap();
      const startEvent = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: {},
      };
      map = addOrUpdateActivity(map, startEvent, createInitialActivity, updateActivityFromEvent);

      const endEvent = {
        type: 'agent_ended',
        agentId: 'agent-1',
        timestamp: 2000,
        data: { reason: 'completed' },
      };
      map = addOrUpdateActivity(map, endEvent, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.get('agent-1').status, 'ended');
    });
  });

  describe('tool_called event', () => {
    it('should grow toolsUsed array', () => {
      let map = createActivityMap();
      const startEvent = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: {},
      };
      map = addOrUpdateActivity(map, startEvent, createInitialActivity, updateActivityFromEvent);

      const toolEvent1 = {
        type: 'tool_called',
        agentId: 'agent-1',
        timestamp: 1500,
        data: { toolName: 'read_file' },
      };
      map = addOrUpdateActivity(map, toolEvent1, createInitialActivity, updateActivityFromEvent);

      const toolEvent2 = {
        type: 'tool_called',
        agentId: 'agent-1',
        timestamp: 1600,
        data: { toolName: 'write_file' },
      };
      map = addOrUpdateActivity(map, toolEvent2, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.get('agent-1').toolsUsed.length, 2);
      assert.strictEqual(map.get('agent-1').toolsUsed[0].toolName, 'read_file');
      assert.strictEqual(map.get('agent-1').toolsUsed[1].toolName, 'write_file');
    });
  });

  describe('model_switched event', () => {
    it('should update currentModel', () => {
      let map = createActivityMap();
      const startEvent = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: { model: 'gpt-3.5' },
      };
      map = addOrUpdateActivity(map, startEvent, createInitialActivity, updateActivityFromEvent);

      const switchEvent = {
        type: 'model_switched',
        agentId: 'agent-1',
        timestamp: 2000,
        data: { newModel: 'gpt-4' },
      };
      map = addOrUpdateActivity(map, switchEvent, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.get('agent-1').currentModel, 'gpt-4');
    });
  });

  describe('token_update event', () => {
    it('should update tokenUsage', () => {
      let map = createActivityMap();
      const startEvent = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: {},
      };
      map = addOrUpdateActivity(map, startEvent, createInitialActivity, updateActivityFromEvent);

      const tokenEvent = {
        type: 'token_update',
        agentId: 'agent-1',
        timestamp: 2000,
        data: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
      };
      map = addOrUpdateActivity(map, tokenEvent, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.get('agent-1').tokenUsage.totalTokens, 150);
    });
  });

  describe('multiple agents', () => {
    it('should track multiple agents independently', () => {
      let map = createActivityMap();

      const agent1Start = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: 1000,
        data: { model: 'gpt-4' },
      };
      map = addOrUpdateActivity(map, agent1Start, createInitialActivity, updateActivityFromEvent);

      const agent2Start = {
        type: 'agent_started',
        agentId: 'agent-2',
        timestamp: 1100,
        data: { model: 'claude-3' },
      };
      map = addOrUpdateActivity(map, agent2Start, createInitialActivity, updateActivityFromEvent);

      assert.strictEqual(map.size, 2);
      assert.strictEqual(map.get('agent-1').currentModel, 'gpt-4');
      assert.strictEqual(map.get('agent-2').currentModel, 'claude-3');
    });
  });
});

describe('Event Validation', () => {
  /**
   * Event validation logic from useAgentActivities
   */
  function isValidAgentEvent(event: unknown): boolean {
    if (typeof event !== 'object' || event === null) {
      return false;
    }

    const e = event as Record<string, unknown>;

    if (typeof e.type !== 'string') {
      return false;
    }

    if (typeof e.agentId !== 'string') {
      return false;
    }

    if (typeof e.timestamp !== 'number') {
      return false;
    }

    const validTypes = [
      'agent_started',
      'agent_ended',
      'tool_called',
      'model_switched',
      'token_update',
      'heartbeat',
    ];

    if (!validTypes.includes(e.type)) {
      return false;
    }

    return true;
  }

  describe('Valid events', () => {
    it('should accept valid agent_started event', () => {
      const event = {
        type: 'agent_started',
        agentId: 'agent-1',
        timestamp: Date.now(),
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });

    it('should accept valid agent_ended event', () => {
      const event = {
        type: 'agent_ended',
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: { reason: 'completed' },
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });

    it('should accept valid tool_called event', () => {
      const event = {
        type: 'tool_called',
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: { toolName: 'read_file' },
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });

    it('should accept valid model_switched event', () => {
      const event = {
        type: 'model_switched',
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: { newModel: 'gpt-4' },
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });

    it('should accept valid token_update event', () => {
      const event = {
        type: 'token_update',
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });

    it('should accept valid heartbeat event', () => {
      const event = {
        type: 'heartbeat',
        agentId: 'agent-1',
        timestamp: Date.now(),
        data: { status: 'active' },
      };
      assert.strictEqual(isValidAgentEvent(event), true);
    });
  });

  describe('Invalid events', () => {
    it('should reject null', () => {
      assert.strictEqual(isValidAgentEvent(null), false);
    });

    it('should reject undefined', () => {
      assert.strictEqual(isValidAgentEvent(undefined), false);
    });

    it('should reject strings', () => {
      assert.strictEqual(isValidAgentEvent('not an event'), false);
    });

    it('should reject numbers', () => {
      assert.strictEqual(isValidAgentEvent(123), false);
    });

    it('should reject arrays', () => {
      assert.strictEqual(isValidAgentEvent([1, 2, 3]), false);
    });

    it('should reject objects without type', () => {
      const event = { agentId: 'agent-1', timestamp: Date.now() };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject objects with non-string type', () => {
      const event = { type: 123, agentId: 'agent-1', timestamp: Date.now() };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject objects without agentId', () => {
      const event = { type: 'agent_started', timestamp: Date.now() };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject objects with non-string agentId', () => {
      const event = { type: 'agent_started', agentId: 123, timestamp: Date.now() };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject objects without timestamp', () => {
      const event = { type: 'agent_started', agentId: 'agent-1' };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject objects with non-number timestamp', () => {
      const event = { type: 'agent_started', agentId: 'agent-1', timestamp: 'now' };
      assert.strictEqual(isValidAgentEvent(event), false);
    });

    it('should reject unknown event types', () => {
      const event = { type: 'unknown_type', agentId: 'agent-1', timestamp: Date.now() };
      assert.strictEqual(isValidAgentEvent(event), false);
    });
  });
});
