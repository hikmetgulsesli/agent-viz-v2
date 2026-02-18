/**
 * Agent Event Types and Data Structures
 * 
 * TypeScript interfaces for all agent events and state,
 * matching the OpenClaw gateway WebSocket protocol.
 */

/**
 * Union type for all possible agent event types
 */
export type AgentEventType = 
  | 'agent_started'
  | 'agent_ended'
  | 'tool_called'
  | 'model_switched'
  | 'token_update'
  | 'heartbeat';

/**
 * Agent status values
 */
export type AgentStatus = 'running' | 'idle' | 'error';

/**
 * Tool call information
 */
export interface ToolCall {
  name: string;
  args?: Record<string, unknown>;
  result?: unknown;
  startedAt: number;
  endedAt?: number;
}

/**
 * Token usage information
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

/**
 * Agent data structure representing an OpenClaw agent
 */
export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentModel: string;
  tools: ToolCall[];
  tokensUsed: TokenUsage;
  startedAt?: number;
  endedAt?: number;
}

/**
 * Payload types for each event type
 */
export interface AgentStartedPayload {
  name: string;
  model: string;
}

export interface AgentEndedPayload {
  reason?: string;
}

export interface ToolCalledPayload {
  toolName: string;
  args: Record<string, unknown>;
}

export interface ModelSwitchedPayload {
  previousModel: string;
  newModel: string;
}

export interface TokenUpdatePayload {
  input: number;
  output: number;
}

export interface HeartbeatPayload {
  agentId: string;
  status: AgentStatus;
}

/**
 * Union type for all event payloads
 */
export type AgentEventPayload = 
  | AgentStartedPayload
  | AgentEndedPayload
  | ToolCalledPayload
  | ModelSwitchedPayload
  | TokenUpdatePayload
  | HeartbeatPayload;

/**
 * Agent event structure matching WebSocket message format
 */
export interface AgentEvent {
  timestamp: number;
  agentId: string;
  eventType: AgentEventType;
  payload: AgentEventPayload;
}

/**
 * WebSocket message from the gateway
 */
export interface GatewayMessage {
  type: 'event' | 'state' | 'error';
  data: AgentEvent | Agent[] | string;
}

/**
 * Connection state for WebSocket
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
