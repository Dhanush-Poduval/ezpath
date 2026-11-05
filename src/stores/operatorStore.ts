import { create } from 'zustand';
import { FacilityStatus, DisruptionEvent, NetworkNode, NetworkEdge } from '../types';
import { demoApiAdapter } from '../services/api/demoAdapter';
import { liveEventsService } from '../services/realtime/liveEvents';
import { DEMO_SCENARIOS } from '../data/demoNetwork';

interface OperatorState {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  facilities: FacilityStatus[];
  disruptions: DisruptionEvent[];
  selectedScenarioId: string;
  isSimulating: boolean;

  // Actions
  loadNetworkData: () => Promise<void>;
  applyScenario: (scenarioId: string) => Promise<void>;
  triggerElevatorFailure: (elevatorId?: string) => Promise<void>;
  createDisruption: (disruption: Omit<DisruptionEvent, 'id'>) => Promise<void>;
  resolveDisruption: (id: string) => Promise<void>;
  resetDemo: () => Promise<void>;
}

export const useOperatorStore = create<OperatorState>((set, get) => ({
  nodes: [],
  edges: [],
  facilities: [],
  disruptions: [],
  selectedScenarioId: 'scenario_1',
  isSimulating: false,

  loadNetworkData: async () => {
    const data = await demoApiAdapter.getNetworkEntities();
    const disruptions = await demoApiAdapter.getActiveEvents();
    set({
      nodes: data.nodes,
      edges: data.edges,
      facilities: data.facilities,
      disruptions
    });
  },

  applyScenario: async (scenarioId: string) => {
    set({ isSimulating: true });
    await demoApiAdapter.applyScenario(scenarioId);
    liveEventsService.broadcastUpdate();
    await get().loadNetworkData();
    set({ selectedScenarioId: scenarioId, isSimulating: false });
  },

  triggerElevatorFailure: async (elevatorId = 'elev_a1') => {
    set({ isSimulating: true });
    await demoApiAdapter.createEvent({
      entityId: elevatorId,
      entityName: 'Elevator A1 (Platform 1-2 & Concourse)',
      stationName: 'Central Station',
      type: 'elevator_outage',
      severity: 'critical',
      reason: 'Traction motor overheating - Maintenance dispatch in progress',
      effectiveStart: new Date().toISOString(),
      estimatedResolution: 'In ~3 hours',
      affectedLinesOrStops: ['Metro Blue Line Platform Access', 'Central Station Platform 1-2'],
      impactOnAccessibility: 'Direct wheelchair access between Central Station Concourse and Metro Blue Line severed. Step-free path blocked.',
      isActive: true
    });
    liveEventsService.broadcastUpdate();
    await get().loadNetworkData();
    set({ selectedScenarioId: 'scenario_2', isSimulating: false });
  },

  createDisruption: async (disruptionData) => {
    await demoApiAdapter.createEvent(disruptionData);
    liveEventsService.broadcastUpdate();
    await get().loadNetworkData();
  },

  resolveDisruption: async (id: string) => {
    await demoApiAdapter.resolveEvent(id);
    liveEventsService.broadcastUpdate();
    await get().loadNetworkData();
  },

  resetDemo: async () => {
    set({ isSimulating: true });
    await demoApiAdapter.resetDemo();
    liveEventsService.broadcastUpdate();
    await get().loadNetworkData();
    set({ selectedScenarioId: 'scenario_1', isSimulating: false });
  }
}));

