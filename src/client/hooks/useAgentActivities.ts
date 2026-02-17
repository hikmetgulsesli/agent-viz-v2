/**
 * useAgentActivities hook
 * 
 * Manages agent activity state from WebSocket events.
 * Maintains a Map of agentId -> AgentActivity with automatic updates.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  type AgentEvent,
  type AgentEventUnion,
  type AgentActivity,
  type AgentActivityMap,
  createInitialActivity,
  updateActivityFromEvent,
  isAgentStartedEvent,
} from '../types/agentEvents';

export interface UseAgentActivitiesReturn {
  /** Map of agentId to AgentActivity */
  activities: AgentActivityMap;
  /** Array of all activities for easy iteration */
  activitiesList: AgentActivity[];
  /** Total number of active agents */
  activeCount: number;
  /** Total token usage across all agents */
  totalTokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Process a new agent event */
  processEvent: (event: AgentEvent | AgentEventUnion) => void;
  /** Process multiple events at once */
  processEvents: (events: (AgentEvent | AgentEventUnion)[]) => void;
  /** Get activity for a specific agent */
  getActivity: (agentId: string) => AgentActivity | undefined;
  /** Clear all activities */
  clearActivities: () => void;
  /** Remove a specific agent's activity */
  removeActivity: (agentId: string) => void;
  /** Get activities by status */
  getActivitiesByStatus: (status: AgentActivity['status']) => AgentActivity[];
}

/**
 * Validates if an event has the required fields
 */
function isValidAgentEvent(event: unknown): event is AgentEvent {
  if (typeof event !== 'object' || event === null) {
    return false;
  }

  const e = event as Record<string, unknown>;

  // Must have type field
  if (typeof e.type !== 'string') {
    return false;
  }

  // Must have agentId field
  if (typeof e.agentId !== 'string') {
    return false;
  }

  // Must have timestamp field
  if (typeof e.timestamp !== 'number') {
    return false;
  }

  // Validate event type
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

/**
 * React hook for managing agent activities from WebSocket events
 */
export function useAgentActivities(): UseAgentActivitiesReturn {
  const [activities, setActivities] = useState<AgentActivityMap>(new Map());
  const activitiesRef = useRef(activities);

  // Keep ref in sync with state for synchronous access
  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  /**
   * Process a single agent event and update the activities Map
   */
  const processEvent = useCallback((event: AgentEvent | AgentEventUnion) => {
    if (!isValidAgentEvent(event)) {
      console.warn('[useAgentActivities] Invalid event:', event);
      return;
    }

    setActivities((prevActivities) => {
      const newActivities = new Map(prevActivities);
      const existingActivity = newActivities.get(event.agentId);

      if (isAgentStartedEvent(event)) {
        // Create new activity or update existing
        if (existingActivity) {
          newActivities.set(
            event.agentId,
            updateActivityFromEvent(existingActivity, event)
          );
        } else {
          newActivities.set(
            event.agentId,
            createInitialActivity(
              event.agentId,
              event.data.model,
              event.data.metadata
            )
          );
        }
      } else if (existingActivity) {
        // Update existing activity for all other event types
        newActivities.set(
          event.agentId,
          updateActivityFromEvent(existingActivity, event as AgentEventUnion)
        );
      } else {
        // Event for unknown agent - create placeholder activity
        console.warn(
          `[useAgentActivities] Event for unknown agent: ${event.agentId}`
        );
        const placeholder = createInitialActivity(event.agentId);
        newActivities.set(
          event.agentId,
          updateActivityFromEvent(placeholder, event as AgentEventUnion)
        );
      }

      return newActivities;
    });
  }, []);

  /**
   * Process multiple events at once (useful for batch updates)
   */
  const processEvents = useCallback((events: (AgentEvent | AgentEventUnion)[]) => {
    setActivities((prevActivities) => {
      const newActivities = new Map(prevActivities);

      for (const event of events) {
        if (!isValidAgentEvent(event)) {
          console.warn('[useAgentActivities] Invalid event in batch:', event);
          continue;
        }

        const existingActivity = newActivities.get(event.agentId);

        if (isAgentStartedEvent(event)) {
          if (existingActivity) {
            newActivities.set(
              event.agentId,
              updateActivityFromEvent(existingActivity, event)
            );
          } else {
            newActivities.set(
              event.agentId,
              createInitialActivity(
                event.agentId,
                event.data.model,
                event.data.metadata
              )
            );
          }
        } else if (existingActivity) {
          newActivities.set(
            event.agentId,
            updateActivityFromEvent(existingActivity, event as AgentEventUnion)
          );
        } else {
          // Event for unknown agent - create placeholder
          const placeholder = createInitialActivity(event.agentId);
          newActivities.set(
            event.agentId,
            updateActivityFromEvent(placeholder, event as AgentEventUnion)
          );
        }
      }

      return newActivities;
    });
  }, []);

  /**
   * Get activity for a specific agent (synchronous)
   */
  const getActivity = useCallback((agentId: string): AgentActivity | undefined => {
    return activitiesRef.current.get(agentId);
  }, []);

  /**
   * Clear all activities
   */
  const clearActivities = useCallback(() => {
    setActivities(new Map());
  }, []);

  /**
   * Remove a specific agent's activity
   */
  const removeActivity = useCallback((agentId: string) => {
    setActivities((prevActivities) => {
      const newActivities = new Map(prevActivities);
      newActivities.delete(agentId);
      return newActivities;
    });
  }, []);

  /**
   * Get activities filtered by status
   */
  const getActivitiesByStatus = useCallback(
    (status: AgentActivity['status']): AgentActivity[] => {
      return Array.from(activities.values()).filter(
        (activity) => activity.status === status
      );
    },
    [activities]
  );

  // Derived values
  const activitiesList = Array.from(activities.values());
  const activeCount = activitiesList.filter(
    (a) => a.status === 'active' || a.status === 'idle'
  ).length;

  const totalTokenUsage = activitiesList.reduce(
    (acc, activity) => ({
      promptTokens: acc.promptTokens + activity.tokenUsage.promptTokens,
      completionTokens: acc.completionTokens + activity.tokenUsage.completionTokens,
      totalTokens: acc.totalTokens + activity.tokenUsage.totalTokens,
    }),
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  return {
    activities,
    activitiesList,
    activeCount,
    totalTokenUsage,
    processEvent,
    processEvents,
    getActivity,
    clearActivities,
    removeActivity,
    getActivitiesByStatus,
  };
}

export default useAgentActivities;
