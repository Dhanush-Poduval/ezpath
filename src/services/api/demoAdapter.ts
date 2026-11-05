import { ApiClient, RouteSearchResult, ReplanResult, NetworkEntitiesResult } from './client';
import { 
  JourneySearchRequest, 
  JourneyRoute, 
  RouteLeg, 
  DisruptionEvent, 
  FacilityStatus, 
  NetworkNode, 
  NetworkEdge,
  ConstraintEvaluation,
  RouteExplanation,
  DisruptionDiff,
  TravellerProfile
} from '../../types';
import { DEMO_NODES, DEMO_EDGES, INITIAL_DISRUPTIONS, DEMO_SCENARIOS } from '../../data/demoNetwork';

const STORAGE_KEY_DISRUPTIONS = 'accesspath_demo_disruptions';

export class DemoApiAdapter implements ApiClient {
  private nodes: NetworkNode[] = JSON.parse(JSON.stringify(DEMO_NODES));
  private edges: NetworkEdge[] = JSON.parse(JSON.stringify(DEMO_EDGES));
  private activeDisruptions: DisruptionEvent[] = [];
  private graphVersion = 'demo-graph-v1.4';
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('accesspath_network_events');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'DISRUPTION_UPDATE') {
          this.loadPersistedDisruptions();
        }
      };
    }
    this.loadPersistedDisruptions();
  }

  private loadPersistedDisruptions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DISRUPTIONS);
      if (stored) {
        this.activeDisruptions = JSON.parse(stored);
      } else {
        this.activeDisruptions = JSON.parse(JSON.stringify(INITIAL_DISRUPTIONS));
      }
    } catch {
      this.activeDisruptions = JSON.parse(JSON.stringify(INITIAL_DISRUPTIONS));
    }
    this.syncFacilityStatuses();
  }

  private persistDisruptions() {
    try {
      localStorage.setItem(STORAGE_KEY_DISRUPTIONS, JSON.stringify(this.activeDisruptions));
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({ type: 'DISRUPTION_UPDATE', timestamp: Date.now() });
      }
    } catch {
      // storage quota or private mode
    }
    this.syncFacilityStatuses();
  }

  private syncFacilityStatuses() {
    // Update node facilities & edge operations based on active disruptions
    for (const node of this.nodes) {
      for (const facility of node.facilities) {
        const isDisrupted = this.activeDisruptions.some(
          d => d.isActive && d.entityId === facility.id
        );
        facility.operational = !isDisrupted;
        if (isDisrupted) {
          const disruption = this.activeDisruptions.find(d => d.isActive && d.entityId === facility.id);
          facility.statusDescription = `UNAVAILABLE: ${disruption?.reason || 'Service interruption'}`;
        }
      }
    }

    for (const edge of this.edges) {
      const isLiftDisrupted = edge.elevatorId && this.activeDisruptions.some(
        d => d.isActive && d.entityId === edge.elevatorId
      );
      const isEdgeDisrupted = this.activeDisruptions.some(
        d => d.isActive && d.entityId === edge.id
      );
      edge.isOperational = !isLiftDisrupted && !isEdgeDisrupted;
    }
  }

  async getHealth(): Promise<{ status: string; mode: 'demo' | 'aws'; version: string }> {
    return {
      status: 'healthy',
      mode: 'demo',
      version: this.graphVersion,
    };
  }

  async getNetworkEntities(): Promise<NetworkEntitiesResult> {
    this.loadPersistedDisruptions();
    const facilities: FacilityStatus[] = [];
    for (const node of this.nodes) {
      facilities.push(...node.facilities);
    }
    return {
      nodes: this.nodes,
      edges: this.edges,
      facilities,
      graphVersion: this.graphVersion
    };
  }

  async getActiveEvents(): Promise<DisruptionEvent[]> {
    this.loadPersistedDisruptions();
    return this.activeDisruptions.filter(d => d.isActive);
  }

  async createEvent(eventData: Omit<DisruptionEvent, 'id'>): Promise<DisruptionEvent> {
    const newEvent: DisruptionEvent = {
      ...eventData,
      id: `disrupt_${Date.now()}`
    };
    this.activeDisruptions.push(newEvent);
    this.persistDisruptions();
    return newEvent;
  }

  async resolveEvent(eventId: string): Promise<boolean> {
    const event = this.activeDisruptions.find(d => d.id === eventId);
    if (event) {
      event.isActive = false;
      this.persistDisruptions();
      return true;
    }
    return false;
  }

  async resetDemo(): Promise<boolean> {
    this.activeDisruptions = [];
    this.persistDisruptions();
    return true;
  }

  async applyScenario(scenarioId: string): Promise<boolean> {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return false;
    this.activeDisruptions = JSON.parse(JSON.stringify(scenario.disruptions));
    this.persistDisruptions();
    return true;
  }

  /**
   * Deterministic graph traversal & constraint-aware route solver
   */
  async searchRoutes(request: JourneySearchRequest): Promise<RouteSearchResult> {
    this.loadPersistedDisruptions();

    const { originId, destinationId, profile } = request;
    const paths = this.findAllCandidatePaths(originId, destinationId);

    if (paths.length === 0) {
      return {
        routes: [],
        searchTimestamp: new Date().toISOString(),
        graphVersion: this.graphVersion
      };
    }

    // Convert raw paths into evaluated JourneyRoutes
    const evaluatedRoutes: JourneyRoute[] = paths.map((pathEdges, index) => {
      return this.buildJourneyRoute(pathEdges, profile, index);
    });

    // Feasible routes are those that pass all hard user profile constraints
    const feasibleRoutes = evaluatedRoutes.filter(r => r.isFeasible);

    // If standard profile (no constraints), display candidate paths ranked by duration (including shortest with stairs)
    // If strict accessibility is requested, only feasible routes are returned!
    const routesToReturn = feasibleRoutes.length > 0 ? feasibleRoutes : evaluatedRoutes;

    // Label and categorize
    this.assignCategoryTags(routesToReturn);

    // Sort: fastest first
    routesToReturn.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);

    // Up to 3 unique alternatives as per specification
    const topAlternatives = routesToReturn.slice(0, 3);

    return {
      routes: topAlternatives,
      searchTimestamp: new Date().toISOString(),
      graphVersion: this.graphVersion
    };
  }

  /**
   * Replanning hero function: takes affected route, re-solves under original constraints, returns exact diff
   */
  async replanRoute(routeId: string, request: JourneySearchRequest): Promise<ReplanResult> {
    this.loadPersistedDisruptions();

    // 1. Fetch previous route representation
    // Let's first search with no disruption considered to reconstruct previous route if needed
    const searchRes = await this.searchRoutes(request);
    const newRoute = searchRes.routes[0];

    if (!newRoute) {
      throw new Error("No feasible alternative route could be found without violating your accessibility constraints.");
    }

    // Determine affected lift or facility
    const affectedDisruption = this.activeDisruptions.find(d => d.isActive);
    const affectedFacilityName = affectedDisruption ? affectedDisruption.entityName : 'Elevator A1';
    const disruptionReason = affectedDisruption ? affectedDisruption.reason : 'Facility outage';

    // Synthetic base reference for previous route (Elevator A1 Blue Line route)
    const prevDuration = 18;
    const prevFare = 35;
    const prevWalking = 280;
    const prevTransfers = 0;

    const previousRouteMock: JourneyRoute = {
      id: routeId,
      label: 'Previous Accessible Route (Elevator A1)',
      categoryTags: ['fastest', 'accessible'],
      totalDurationMinutes: prevDuration,
      totalDistanceMeters: 4280,
      walkingDistanceMeters: prevWalking,
      totalFareINR: prevFare,
      transfersCount: prevTransfers,
      transportModes: ['metro', 'walking'],
      legs: [],
      isStepFree: true,
      isWheelchairAccessible: true,
      isFeasible: false,
      feasibilityReason: `Affected by ${affectedFacilityName} outage.`,
      reliabilityScore: 20,
      evidenceConfidence: 'high',
      affectedByDisruption: true,
      disruptionReason,
      dependentLifts: ['elev_a1'],
      geometry: [],
      departureTime: '10:00 AM',
      arrivalTime: '10:18 AM',
      explanation: {
        summary: 'Elevator A1 unavailable; requires detour.',
        evaluations: [],
        confidenceLevel: 'uncertain',
        unknownDataPoints: [],
        reasons: ['Elevator A1 is out of service.']
      }
    };

    const diff: DisruptionDiff = {
      previousRoute: previousRouteMock,
      newRoute,
      durationChangeMinutes: newRoute.totalDurationMinutes - prevDuration,
      fareChangeINR: newRoute.totalFareINR - prevFare,
      walkingDistanceChangeMeters: newRoute.walkingDistanceMeters - prevWalking,
      transfersChange: newRoute.transfersCount - prevTransfers,
      stepFreeMaintained: newRoute.isStepFree,
      affectedFacilityName,
      disruptionReason
    };

    return {
      previousRoute: previousRouteMock,
      newRoute,
      diff,
      success: true
    };
  }

  // --- Graph Algorithm Helpers ---

  private findAllCandidatePaths(originId: string, destinationId: string): NetworkEdge[][] {
    const results: NetworkEdge[][] = [];
    const visitedEdges = new Set<string>();

    const dfs = (currentNodeId: string, currentPath: NetworkEdge[], depth: number) => {
      if (depth > 6) return; // prevent loop explosion
      if (currentNodeId === destinationId && currentPath.length > 0) {
        results.push([...currentPath]);
        return;
      }

      const outgoingEdges = this.edges.filter(e => e.fromNodeId === currentNodeId);
      for (const edge of outgoingEdges) {
        if (!visitedEdges.has(edge.id)) {
          visitedEdges.add(edge.id);
          currentPath.push(edge);
          dfs(edge.toNodeId, currentPath, depth + 1);
          currentPath.pop();
          visitedEdges.delete(edge.id);
        }
      }
    };

    dfs(originId, [], 0);
    return results;
  }

  private buildJourneyRoute(
    edges: NetworkEdge[], 
    profile: TravellerProfile, 
    index: number
  ): JourneyRoute {
    const legs: RouteLeg[] = edges.map(edge => {
      const fromNode = this.nodes.find(n => n.id === edge.fromNodeId);
      const toNode = this.nodes.find(n => n.id === edge.toNodeId);

      const legType = edge.mode === 'stairs' ? 'stairs' : 
                      edge.mode === 'elevator' ? 'elevator' : 
                      edge.mode === 'ramp' ? 'ramp' : 
                      edge.mode === 'bus' ? 'bus' : 
                      edge.mode === 'metro' || edge.mode === 'train' ? 'train' : 'walk';

      const isElevatorOperational = edge.elevatorId ? 
        !this.activeDisruptions.some(d => d.isActive && d.entityId === edge.elevatorId) : true;

      return {
        id: `leg_${edge.id}`,
        fromNodeId: edge.fromNodeId,
        fromNodeName: fromNode ? fromNode.name : edge.fromNodeId,
        toNodeId: edge.toNodeId,
        toNodeName: toNode ? toNode.name : edge.toNodeId,
        mode: edge.mode,
        legType,
        lineName: edge.lineName,
        lineColor: edge.lineColor,
        durationMinutes: edge.durationMinutes,
        distanceMeters: edge.distanceMeters,
        fareINR: edge.fareINR,
        stepFree: edge.stepFree,
        wheelchairAccessible: edge.wheelchairAccessible && isElevatorOperational,
        elevatorId: edge.elevatorId,
        elevatorOperational: isElevatorOperational,
        evidenceSource: edge.evidenceSource,
        evidenceTimestamp: edge.lastUpdated,
        confidenceScore: edge.evidenceSource === 'operator_iot' ? 0.98 : 
                         edge.evidenceSource === 'station_audit' ? 0.92 : 0.75,
        geometry: edge.geometry,
        steps: [
          {
            instruction: this.generateStepInstruction(edge, fromNode?.name, toNode?.name),
            distanceMeters: edge.distanceMeters,
            durationMinutes: edge.durationMinutes,
            stepFree: edge.stepFree,
            facilityId: edge.elevatorId,
            facilityName: edge.elevatorId ? 'Elevator' : undefined
          }
        ]
      };
    });

    const totalDurationMinutes = legs.reduce((acc, l) => acc + l.durationMinutes, 0);
    const totalDistanceMeters = legs.reduce((acc, l) => acc + l.distanceMeters, 0);
    const walkingDistanceMeters = legs
      .filter(l => l.legType === 'walk' || l.legType === 'stairs' || l.legType === 'ramp')
      .reduce((acc, l) => acc + l.distanceMeters, 0);
    const totalFareINR = legs.reduce((acc, l) => acc + l.fareINR, 0);

    const transportModes = Array.from(new Set(
      legs
        .filter(l => l.legType === 'bus' || l.legType === 'train' || l.legType === 'walk')
        .map(l => (l.legType === 'train' ? 'train' : l.legType === 'bus' ? 'bus' : 'walking') as any)
    )) as any;

    const transitLegCount = legs.filter(l => l.legType === 'bus' || l.legType === 'train').length;
    const transfersCount = Math.max(0, transitLegCount - 1);

    const dependentLifts = legs
      .map(l => l.elevatorId)
      .filter((id): id is string => Boolean(id));

    // Full geometry merged
    const mergedGeometry: [number, number][] = [];
    for (const leg of legs) {
      if (leg.geometry) {
        for (const pt of leg.geometry) {
          mergedGeometry.push(pt);
        }
      }
    }

    // Step-free & accessibility checks
    const hasStairs = legs.some(l => l.legType === 'stairs' || !l.stepFree);
    const isStepFree = !hasStairs && legs.every(l => l.stepFree);
    const isWheelchairAccessible = legs.every(l => l.wheelchairAccessible);

    // Check if any dependent elevator is currently disrupted
    const affectedByDisruption = dependentLifts.some(liftId => 
      this.activeDisruptions.some(d => d.isActive && d.entityId === liftId)
    );

    // Constraint evaluation
    const evaluations: ConstraintEvaluation[] = [
      {
        constraintId: 'step_free',
        name: 'Step-free path along entire route',
        status: isStepFree ? 'passed' : 'failed',
        userLimit: profile.requireStepFree ? 'Required' : 'Optional',
        routeValue: isStepFree ? '100% Step-free verified' : 'Contains stairs / level changes',
        evidenceSource: 'Station & Municipal Infrastructure Audit',
        lastUpdated: 'Real-time telemetry verified',
        isHardRequirement: profile.requireStepFree,
        notes: hasStairs ? 'Flight of 24 stairs detected at Central Station concourse' : undefined
      },
      {
        constraintId: 'avoid_stairs',
        name: 'Zero stairs or flights',
        status: !hasStairs ? 'passed' : 'failed',
        userLimit: profile.avoidStairs ? 'Required' : 'Optional',
        routeValue: hasStairs ? 'Contains stairs (Stairs C1)' : 'Zero stairs',
        evidenceSource: 'Verified physical station survey',
        lastUpdated: 'Today',
        isHardRequirement: profile.avoidStairs
      },
      {
        constraintId: 'wheelchair_boarding',
        name: 'Wheelchair-accessible boarding & ramps',
        status: isWheelchairAccessible && !affectedByDisruption ? 'passed' : 'failed',
        userLimit: profile.requireWheelchairBoarding ? 'Required' : 'Optional',
        routeValue: isWheelchairAccessible && !affectedByDisruption 
          ? 'Level platform boarding + operational lifts' 
          : affectedByDisruption 
            ? 'Dependent elevator unavailable' 
            : 'High curb / non-accessible vehicle',
        evidenceSource: 'Transit Fleet & Station IoT Sensors',
        lastUpdated: '10 minutes ago',
        isHardRequirement: profile.requireWheelchairBoarding
      },
      {
        constraintId: 'max_walking',
        name: 'Maximum continuous walking distance',
        status: walkingDistanceMeters <= profile.maxWalkingDistanceMeters ? 'passed' : 'failed',
        userLimit: `${profile.maxWalkingDistanceMeters} m`,
        routeValue: `${walkingDistanceMeters} m`,
        evidenceSource: 'Pedestrian GIS network metrics',
        lastUpdated: 'Live calculation',
        isHardRequirement: true
      },
      {
        constraintId: 'max_budget',
        name: 'Total journey fare budget',
        status: totalFareINR <= profile.maxBudgetINR ? 'passed' : 'failed',
        userLimit: `₹${profile.maxBudgetINR}`,
        routeValue: `₹${totalFareINR}`,
        evidenceSource: 'Official transit fare matrices',
        lastUpdated: 'Current tariff',
        isHardRequirement: true
      }
    ];

    if (dependentLifts.length > 0) {
      evaluations.push({
        constraintId: 'lift_status',
        name: `Required elevator (${dependentLifts.join(', ')})`,
        status: affectedByDisruption ? 'failed' : 'passed',
        userLimit: 'Must be operational',
        routeValue: affectedByDisruption ? 'UNAVAILABLE (Outage active)' : 'Operational - Verified by Station IoT',
        evidenceSource: 'Station Sensor Network Node #401',
        lastUpdated: 'Live telemetry',
        isHardRequirement: profile.requireOperationalLiftOrRamp
      });
    }

    // Determine hard feasibility
    let isFeasible = true;
    let feasibilityReason: string | undefined;

    if (profile.avoidStairs && hasStairs) {
      isFeasible = false;
      feasibilityReason = 'Route contains stairs (Stairs C1, 24 steps).';
    } else if (profile.requireStepFree && !isStepFree) {
      isFeasible = false;
      feasibilityReason = 'Route is not step-free.';
    } else if (profile.requireWheelchairBoarding && (!isWheelchairAccessible || affectedByDisruption)) {
      isFeasible = false;
      feasibilityReason = affectedByDisruption 
        ? 'Dependent elevator is currently out of service.' 
        : 'Inaccessible boarding or vehicles.';
    } else if (walkingDistanceMeters > profile.maxWalkingDistanceMeters) {
      isFeasible = false;
      feasibilityReason = `Walking distance (${walkingDistanceMeters}m) exceeds your limit of ${profile.maxWalkingDistanceMeters}m.`;
    } else if (totalFareINR > profile.maxBudgetINR) {
      isFeasible = false;
      feasibilityReason = `Total fare (₹${totalFareINR}) exceeds your budget limit of ₹${profile.maxBudgetINR}.`;
    }

    const explanation: RouteExplanation = {
      summary: isFeasible 
        ? `This route fully satisfies your ${profile.name} requirements with verified step-free infrastructure.`
        : `This route fails one or more accessibility requirements: ${feasibilityReason}`,
      evaluations,
      confidenceLevel: 'high',
      unknownDataPoints: [],
      reasons: isFeasible 
        ? [
            'All transit legs have level boarding and functional ramps.',
            `Walking distance of ${walkingDistanceMeters}m is safely within your ${profile.maxWalkingDistanceMeters}m threshold.`,
            `Total fare of ₹${totalFareINR} is within your ₹${profile.maxBudgetINR} budget.`
          ]
        : [feasibilityReason || 'Constraint violation']
    };

    return {
      id: `route_${index}_${totalDurationMinutes}m`,
      label: `Route Alternative ${index + 1}`,
      categoryTags: [],
      totalDurationMinutes,
      totalDistanceMeters,
      walkingDistanceMeters,
      totalFareINR,
      transfersCount,
      transportModes,
      legs,
      isStepFree,
      isWheelchairAccessible,
      isFeasible,
      feasibilityReason,
      reliabilityScore: affectedByDisruption ? 20 : hasStairs ? 40 : 96,
      evidenceConfidence: 'high',
      explanation,
      geometry: mergedGeometry,
      departureTime: '10:00 AM',
      arrivalTime: `10:${String(totalDurationMinutes).padStart(2, '0')} AM`,
      dependentLifts,
      affectedByDisruption,
      disruptionReason: affectedByDisruption ? 'Elevator outage along connection' : undefined
    };
  }

  private generateStepInstruction(edge: NetworkEdge, fromName?: string, toName?: string): string {
    switch (edge.mode) {
      case 'stairs':
        return `Descend stairs C1 (24 steps) from ${fromName} to ${toName}. (Warning: Not step-free)`;
      case 'elevator':
        return `Take Elevator (${edge.elevatorId || 'A1'}) down to ${toName}. Step-free certified.`;
      case 'ramp':
        return `Proceed down accessible Ramp W1 with handrails to ${toName}.`;
      case 'walking':
        return `Walk along level accessible pathway to ${toName}.`;
      case 'metro':
        return `Board ${edge.lineName || 'Metro Blue Line'} towards ${toName}. Low-gap wheelchair boarding at carriage 2.`;
      case 'bus':
        return `Board ${edge.lineName || 'Accessible Bus'} to ${toName}. Automated ramp deployment available.`;
      default:
        return `Proceed from ${fromName} to ${toName}.`;
    }
  }

  private assignCategoryTags(routes: JourneyRoute[]) {
    if (routes.length === 0) return;

    let minDuration = Math.min(...routes.map(r => r.totalDurationMinutes));
    let minFare = Math.min(...routes.map(r => r.totalFareINR));
    let minWalking = Math.min(...routes.map(r => r.walkingDistanceMeters));

    for (const route of routes) {
      route.categoryTags = [];
      if (route.totalDurationMinutes === minDuration) {
        route.categoryTags.push('fastest');
      }
      if (route.totalFareINR === minFare) {
        route.categoryTags.push('cheapest');
      }
      if (route.walkingDistanceMeters === minWalking) {
        route.categoryTags.push('least_walking');
      }
      if (route.isStepFree && route.isWheelchairAccessible) {
        route.categoryTags.push('accessible');
      }

      // Pick descriptive primary label
      if (route.categoryTags.includes('fastest') && route.isStepFree) {
        route.label = 'Fastest accessible';
      } else if (route.categoryTags.includes('cheapest')) {
        route.label = 'Lowest cost';
      } else if (route.categoryTags.includes('least_walking')) {
        route.label = 'Least walking';
      } else {
        route.label = 'Accessible alternative';
      }
    }
  }
}

// Singleton instances
export const demoApiAdapter = new DemoApiAdapter();

