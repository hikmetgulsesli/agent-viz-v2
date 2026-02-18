import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModelSwitches } from '../src/components/ModelSwitches';
import type { AgentEvent } from '../src/types/agent';

describe('ModelSwitches', () => {
  const mockEvents: AgentEvent[] = [
    {
      timestamp: 1000,
      agentId: 'agent-1',
      eventType: 'agent_started',
      payload: { name: 'Test Agent 1', model: 'gpt-4' },
    },
    {
      timestamp: 2000,
      agentId: 'agent-2',
      eventType: 'agent_started',
      payload: { name: 'Test Agent 2', model: 'claude-3-opus' },
    },
    {
      timestamp: 3000,
      agentId: 'agent-1',
      eventType: 'model_switched',
      payload: { previousModel: 'gpt-4', newModel: 'gpt-4-turbo' },
    },
    {
      timestamp: 4000,
      agentId: 'agent-2',
      eventType: 'model_switched',
      payload: { previousModel: 'claude-3-opus', newModel: 'claude-3-sonnet' },
    },
    {
      timestamp: 5000,
      agentId: 'agent-1',
      eventType: 'model_switched',
      payload: { previousModel: 'gpt-4-turbo', newModel: 'gpt-4o' },
    },
  ];

  it('renders without crashing', () => {
    render(<ModelSwitches events={[]} />);
    expect(screen.getByTestId('model-switches')).toBeInTheDocument();
  });

  it('shows empty state when no model data', () => {
    render(<ModelSwitches events={[]} />);
    expect(screen.getByTestId('model-switches-empty')).toBeInTheDocument();
    expect(screen.getByText('No model data available')).toBeInTheDocument();
  });

  it('shows empty state with no relevant events', () => {
    const irrelevantEvents: AgentEvent[] = [
      {
        timestamp: 1000,
        agentId: 'agent-1',
        eventType: 'tool_called',
        payload: { toolName: 'read', args: {} },
      },
    ];
    render(<ModelSwitches events={irrelevantEvents} />);
    expect(screen.getByTestId('model-switches-empty')).toBeInTheDocument();
  });

  it('shows current model for each agent', () => {
    render(<ModelSwitches events={mockEvents} />);
    
    expect(screen.getByTestId('current-models-section')).toBeInTheDocument();
    
    const currentModelItems = screen.getAllByTestId('current-model-item');
    expect(currentModelItems).toHaveLength(2);
    
    // Check agent names are displayed using getAllByText since they appear in both sections
    const agent1Elements = screen.getAllByText('agent-1');
    expect(agent1Elements.length).toBeGreaterThan(0);
    
    const agent2Elements = screen.getAllByText('agent-2');
    expect(agent2Elements.length).toBeGreaterThan(0);
    
    // Check current models (should be the latest for each agent) using specific test IDs
    // Current models are sorted by lastUpdated descending, so agent-1 (5000) comes first
    const currentModelNames = screen.getAllByTestId('current-model-name');
    expect(currentModelNames).toHaveLength(2);
    expect(currentModelNames[0]).toHaveTextContent('gpt-4o'); // agent-1's current model (last updated at 5000)
    expect(currentModelNames[1]).toHaveTextContent('claude-3-sonnet'); // agent-2's current model (last updated at 4000)
  });

  it('lists recent model transitions', () => {
    render(<ModelSwitches events={mockEvents} />);
    
    expect(screen.getByTestId('transitions-section')).toBeInTheDocument();
    
    const transitionItems = screen.getAllByTestId('model-transition-item');
    expect(transitionItems).toHaveLength(3); // 3 model_switched events
  });

  it('limits transitions to maximum 10', () => {
    const manySwitchEvents: AgentEvent[] = [];
    
    // Create 15 model_switched events
    for (let i = 0; i < 15; i++) {
      manySwitchEvents.push({
        timestamp: 1000 + i * 100,
        agentId: `agent-${i % 3}`,
        eventType: 'model_switched',
        payload: { previousModel: `model-${i}`, newModel: `model-${i + 1}` },
      });
    }
    
    render(<ModelSwitches events={manySwitchEvents} />);
    
    const transitionItems = screen.getAllByTestId('model-transition-item');
    expect(transitionItems).toHaveLength(10);
    
    // Check count badge shows 10
    expect(screen.getByTestId('transitions-count')).toHaveTextContent('10');
  });

  it('displays transition format correctly: agent: old_model → new model', () => {
    render(<ModelSwitches events={mockEvents} />);
    
    // Check agent names in transitions (first one should be most recent)
    const transitionAgents = screen.getAllByTestId('transition-agent');
    expect(transitionAgents[0]).toHaveTextContent('agent-1'); // Most recent
    
    // Check old models are displayed with strikethrough
    const oldModels = screen.getAllByTestId('old-model');
    expect(oldModels[0]).toHaveTextContent('gpt-4-turbo');
    
    // Check new models are displayed
    const newModels = screen.getAllByTestId('new-model');
    expect(newModels[0]).toHaveTextContent('gpt-4o');
  });

  it('shows timestamp for each transition', () => {
    render(<ModelSwitches events={mockEvents} />);
    
    const timestamps = screen.getAllByTestId('transition-timestamp');
    expect(timestamps.length).toBeGreaterThan(0);
    
    // Check timestamps are in HH:MM:SS format
    timestamps.forEach(timestamp => {
      expect(timestamp.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  it('sorts transitions by timestamp descending (newest first)', () => {
    render(<ModelSwitches events={mockEvents} />);
    
    const newModels = screen.getAllByTestId('new-model');
    
    // Most recent should be first (gpt-4o from timestamp 5000)
    expect(newModels[0]).toHaveTextContent('gpt-4o');
    // Second should be claude-3-sonnet from timestamp 4000
    expect(newModels[1]).toHaveTextContent('claude-3-sonnet');
    // Third should be gpt-4-turbo from timestamp 3000
    expect(newModels[2]).toHaveTextContent('gpt-4-turbo');
  });

  it('extracts current models from agent_started events', () => {
    const startedOnlyEvents: AgentEvent[] = [
      {
        timestamp: 1000,
        agentId: 'agent-a',
        eventType: 'agent_started',
        payload: { name: 'Agent A', model: 'gpt-3.5-turbo' },
      },
      {
        timestamp: 2000,
        agentId: 'agent-b',
        eventType: 'agent_started',
        payload: { name: 'Agent B', model: 'claude-instant' },
      },
    ];
    
    render(<ModelSwitches events={startedOnlyEvents} />);
    
    // Should show current models section but not transitions section
    expect(screen.getByTestId('current-models-section')).toBeInTheDocument();
    expect(screen.queryByTestId('transitions-section')).not.toBeInTheDocument();
    
    // Check models are displayed using specific test IDs
    // Current models are sorted by lastUpdated descending (agent-b at 2000 comes first)
    const currentModelNames = screen.getAllByTestId('current-model-name');
    expect(currentModelNames).toHaveLength(2);
    expect(currentModelNames[0]).toHaveTextContent('claude-instant'); // agent-b, last updated at 2000
    expect(currentModelNames[1]).toHaveTextContent('gpt-3.5-turbo'); // agent-a, last updated at 1000
  });

  it('updates current model when model_switched event occurs', () => {
    const eventsWithSwitch: AgentEvent[] = [
      {
        timestamp: 1000,
        agentId: 'agent-1',
        eventType: 'agent_started',
        payload: { name: 'Agent 1', model: 'gpt-4' },
      },
      {
        timestamp: 2000,
        agentId: 'agent-1',
        eventType: 'model_switched',
        payload: { previousModel: 'gpt-4', newModel: 'gpt-4-turbo' },
      },
    ];
    
    render(<ModelSwitches events={eventsWithSwitch} />);
    
    // Current model should show the switched-to model using specific test ID
    const currentModelNames = screen.getAllByTestId('current-model-name');
    expect(currentModelNames).toHaveLength(1);
    expect(currentModelNames[0]).toHaveTextContent('gpt-4-turbo');
    
    // Should not show the old model as current (exact match)
    expect(currentModelNames[0].textContent).not.toBe('gpt-4');
    
    // But the transition should show the old model
    const oldModels = screen.getAllByTestId('old-model');
    expect(oldModels[0]).toHaveTextContent('gpt-4');
  });

  it('handles multiple agents independently', () => {
    const multiAgentEvents: AgentEvent[] = [
      {
        timestamp: 1000,
        agentId: 'agent-x',
        eventType: 'agent_started',
        payload: { name: 'Agent X', model: 'model-a' },
      },
      {
        timestamp: 2000,
        agentId: 'agent-y',
        eventType: 'agent_started',
        payload: { name: 'Agent Y', model: 'model-b' },
      },
      {
        timestamp: 3000,
        agentId: 'agent-x',
        eventType: 'model_switched',
        payload: { previousModel: 'model-a', newModel: 'model-c' },
      },
    ];
    
    render(<ModelSwitches events={multiAgentEvents} />);
    
    // Both agents should be listed with their current models
    const currentModelItems = screen.getAllByTestId('current-model-item');
    expect(currentModelItems).toHaveLength(2);
    
    // Check current models using specific test IDs
    // Sorted by lastUpdated descending: agent-x (3000) comes first, then agent-y (2000)
    const currentModelNames = screen.getAllByTestId('current-model-name');
    expect(currentModelNames).toHaveLength(2);
    
    // agent-x should show model-c (switched, last updated at 3000)
    expect(currentModelNames[0]).toHaveTextContent('model-c');
    // agent-y should show model-b (unchanged, last updated at 2000)
    expect(currentModelNames[1]).toHaveTextContent('model-b');
  });
});
