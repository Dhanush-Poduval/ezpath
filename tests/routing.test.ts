import { describe, it, expect, beforeEach } from 'vitest';
import { demoApiAdapter } from '../src/services/api/demoAdapter';
import { DEFAULT_PROFILES } from '../src/stores/journeyStore';

describe('AccessPath Routing Engine & Disruption Recalculation', () => {
  beforeEach(async () => {
    // Reset network state before each test
    await demoApiAdapter.resetDemo();
  });

  it('calculates accessible step-free route for wheelchair profile under normal operations', async () => {
    const result = await demoApiAdapter.searchRoutes({
      originId: 'node_central_station',
      destinationId: 'node_riverside_campus',
      departureTime: new Date().toISOString(),
      profile: DEFAULT_PROFILES.wheelchair,
    });

    expect(result.routes.length).toBeGreaterThan(0);
    const topRoute = result.routes[0];

    // Must be step-free and wheelchair accessible
    expect(topRoute.isStepFree).toBe(true);
    expect(topRoute.isWheelchairAccessible).toBe(true);
    expect(topRoute.isFeasible).toBe(true);

    // Walking distance must be within 600m
    expect(topRoute.walkingDistanceMeters).toBeLessThanOrEqual(600);

    // Budget must be within ₹50
    expect(topRoute.totalFareINR).toBeLessThanOrEqual(50);

    // Must rely on Elevator A1
    expect(topRoute.dependentLifts).toContain('elev_a1');
  });

  it('evaluates all physical constraints in route explanation', async () => {
    const result = await demoApiAdapter.searchRoutes({
      originId: 'node_central_station',
      destinationId: 'node_riverside_campus',
      departureTime: new Date().toISOString(),
      profile: DEFAULT_PROFILES.wheelchair,
    });

    const route = result.routes[0];
    const { evaluations } = route.explanation;

    expect(evaluations.length).toBeGreaterThanOrEqual(4);

    const stepFreeEval = evaluations.find(e => e.constraintId === 'step_free');
    expect(stepFreeEval?.status).toBe('passed');

    const stairsEval = evaluations.find(e => e.constraintId === 'avoid_stairs');
    expect(stairsEval?.status).toBe('passed');

    const liftEval = evaluations.find(e => e.constraintId === 'lift_status');
    expect(liftEval?.status).toBe('passed');
  });

  it('dynamically replans route when Elevator A1 has an outage without violating constraints', async () => {
    // 1. Initial search under normal conditions
    const initialResult = await demoApiAdapter.searchRoutes({
      originId: 'node_central_station',
      destinationId: 'node_riverside_campus',
      departureTime: new Date().toISOString(),
      profile: DEFAULT_PROFILES.wheelchair,
    });
    const initialRoute = initialResult.routes[0];
    expect(initialRoute.dependentLifts).toContain('elev_a1');

    // 2. Trigger Elevator A1 outage (Scenario 2)
    await demoApiAdapter.applyScenario('scenario_2');

    // 3. Replan journey
    const replanResult = await demoApiAdapter.replanRoute(initialRoute.id, {
      originId: 'node_central_station',
      destinationId: 'node_riverside_campus',
      departureTime: new Date().toISOString(),
      profile: DEFAULT_PROFILES.wheelchair,
    });

    expect(replanResult.success).toBe(true);
    const newRoute = replanResult.newRoute;

    // The new route MUST NOT use broken Elevator A1
    expect(newRoute.dependentLifts).not.toContain('elev_a1');

    // The new route MUST STILL BE step-free and compliant with wheelchair constraints!
    expect(newRoute.isStepFree).toBe(true);
    expect(newRoute.isWheelchairAccessible).toBe(true);
    expect(newRoute.walkingDistanceMeters).toBeLessThanOrEqual(DEFAULT_PROFILES.wheelchair.maxWalkingDistanceMeters);
    expect(newRoute.totalFareINR).toBeLessThanOrEqual(DEFAULT_PROFILES.wheelchair.maxBudgetINR);

    // Verify What Changed diff calculation
    expect(replanResult.diff.stepFreeMaintained).toBe(true);
    expect(replanResult.diff.affectedFacilityName).toContain('Elevator A1');
  });

  it('rejects routes with stairs when avoidStairs is true', async () => {
    const result = await demoApiAdapter.searchRoutes({
      originId: 'node_central_station',
      destinationId: 'node_riverside_campus',
      departureTime: new Date().toISOString(),
      profile: {
        ...DEFAULT_PROFILES.standard,
        avoidStairs: true,
        requireStepFree: true,
      },
    });

    // None of the returned routes should contain stairs
    for (const route of result.routes) {
      expect(route.legs.some(l => l.legType === 'stairs')).toBe(false);
      expect(route.isStepFree).toBe(true);
    }
  });
});

