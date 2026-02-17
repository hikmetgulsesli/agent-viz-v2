/**
 * Agent event types and interfaces
 * 
 * Defines TypeScript types for agent events and activity tracking.
 */

/** Types of agent events that can be received from WebSocket */
export type AgentEventType =
  | 'agent_started'
  | 'agent_ended'
  | 'tool_called'
  | 'model_switched'
  | 'token_update'
  | 'heartbeat';

/** Agent status states */
export type AgentStatus = 'active' | 'idle' | 'error' | 'ended';

/** Base interface for all agent events */
export interface AgentEvent {
  type: AgentEventType;
  agentId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

/** Event fired when an agent starts processing */
export interface AgentStartedEvent extends AgentEvent {
  type: 'agent_started';
  data: {
    model?: string;
    task?: string;
    metadata?: Record<string, unknown>;
  };
}

/** Event fired when an agent completes or stops */
export interface AgentEndedEvent extends AgentEvent {
  type: 'agent_ended';
  data: {
    reason?: 'completed' | 'error' | 'cancelled';
    finalTokenCount?: number;
  };
}

/** Event fired when an agent calls a tool */
export interface ToolCalledEvent extends AgentEvent {
  type: 'tool_called';
  data: {
    toolName: string;
    toolInput?: Record<string, unknown>;
    duration?: number;
  };
}

/** Event fired when an agent switches models */
export interface ModelSwitchedEvent extends AgentEvent {
  type: 'model_switched';
  data: {
    previousModel?: string;
    newModel: string;
    reason?: string;
  };
}

/** Event fired when token usage is updated */
export interface TokenUpdateEvent extends AgentEvent {
  type: 'token_update';
  data: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    delta?: number;
  };
}

/** Heartbeat event to keep connection alive */
export interface HeartbeatEvent extends AgentEvent {
  type: 'heartbeat';
  data: {
    status: AgentStatus;
  };
}

/** Union type of all agent event types */
export type AgentEventUnion =
  | AgentStartedEvent
  | AgentEndedEvent
  | ToolCalledEvent
  | ModelSwitchedEvent
  | TokenUpdateEvent
  | HeartbeatEvent;

/** Token usage tracking for an agent */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/** Tool call record for tracking tool usage */
export interface ToolCall {
  toolName: string;
  timestamp: number;
  duration?: number;
  input?: Record<string, unknown>;
}

/** Complete activity state for a single agent */
export interface AgentActivity {
  agentId: string;
  status: AgentStatus;
  currentModel?: string;
  toolsUsed: ToolCall[];
  tokenUsage: TokenUsage;
  lastActivity: number;
  startedAt: number;
  endedAt?: number;
  metadata?: Record<string, unknown>;
}

/** Map of agentId to AgentActivity for tracking multiple agents */
export type AgentActivityMap = Map<string, AgentActivity>;

/** Type guard to check if an event is an AgentStartedEvent */
export function isAgentStartedEvent(event: AgentEvent): event is AgentStartedEvent {
  return event.type === 'agent_started';
}

/** Type guard to check if an event is an AgentEndedEvent */
export function isAgentEndedEvent(event: AgentEvent): event is AgentEndedEvent {
  return event.type === 'agent_ended';
}

/** Type guard to check if an event is a ToolCalledEvent */
export function isToolCalledEvent(event: AgentEvent): event is ToolCalledEvent {
  return event.type === 'tool_called';
}

/** Type guard to check if an event is a ModelSwitchedEvent */
export function isModelSwitchedEvent(event: AgentEvent): event is ModelSwitchedEvent {
  return event.type === 'model_switched';
}

/** Type guard to check if an event is a TokenUpdateEvent */
export function isTokenUpdateEvent(event: AgentEvent): event is TokenUpdateEvent {
  return event.type === 'token_update';
}

/** Type guard to check if an event is a HeartbeatEvent */
export function isHeartbeatEvent(event: AgentEvent): event is HeartbeatEvent {
  return event.type === 'heartbeat';
}

/** Create initial AgentActivity state for a new agent */
export function createInitialActivity(
  agentId: string,
  model?: string,
  metadata?: Record<string, unknown>
): AgentActivity {
  return {
    agentId,
    status: 'active',
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

/** Update activity state from an AgentEvent */
export function updateActivityFromEvent(
  activity: AgentActivity,
  event: AgentEventUnion
): AgentActivity {
  const updated: AgentActivity = {
    ...activity,
    lastActivity: event.timestamp,
  };

  switch (event.type) {
    case 'agent_started':
      updated.status = 'active';
      if (event.data.model) {
        updated.currentModel = event.data.model;
      }
      if (event.data.metadata) {
        updated.metadata = { ...updated.metadata, ...event.data.metadata };
      }
      break;

    case 'agent_ended':
      updated.status = event.data.reason === 'error' ? 'error' : 'ended';
      updated.endedAt = event.timestamp;
      if (event.data.finalTokenCount) {
        updated.tokenUsage.totalTokens = event.data.finalTokenCount;
      }
      break;

    case 'tool_called':
      updated.toolsUsed = [
        ...updated.toolsUsed,
        {
          toolName: event.data.toolName,
          timestamp: event.timestamp,
          duration: event.data.duration,
          input: event.data.toolInput,
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
