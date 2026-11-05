import { NetworkNode, NetworkEdge, FacilityStatus, DisruptionEvent } from '../types';

// Anchor coordinates centered around an accessible metropolitan multimodal corridor
// [longitude, latitude]
export const DEMO_NODES: NetworkNode[] = [
  {
    id: 'node_central_station',
    name: 'Central Station (Main Concourse)',
    type: 'station',
    coordinates: [77.2185, 28.6328],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'elev_a1',
        name: 'Elevator A1 (Platform 1-2 & Concourse)',
        stationId: 'node_central_station',
        stationName: 'Central Station',
        type: 'elevator',
        operational: true,
        statusDescription: 'Operational - Verified by Station IoT Telemetry',
        lastUpdated: '10 minutes ago',
        verifiedBy: 'IoT Sensor Node #401',
        latitude: 28.6329,
        longitude: 77.2186,
      },
      {
        id: 'ramp_w1',
        name: 'West Wing Street Ramp W1',
        stationId: 'node_central_station',
        stationName: 'Central Station',
        type: 'ramp',
        operational: true,
        statusDescription: 'Operational - Slope 1:14 with dual handrails',
        lastUpdated: '1 hour ago',
        verifiedBy: 'Municipal Accessibility Audit',
        latitude: 28.6325,
        longitude: 77.2178,
      },
      {
        id: 'stairs_c1',
        name: 'Main Subway Stairs C1 (24 Steps)',
        stationId: 'node_central_station',
        stationName: 'Central Station',
        type: 'stairs',
        operational: true,
        statusDescription: 'Steep flight of stairs (No ramp or lift)',
        lastUpdated: '3 hours ago',
        verifiedBy: 'Station Audit',
        latitude: 28.6331,
        longitude: 77.2190,
      }
    ],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_central_lower_platform',
    name: 'Central Station (Metro Blue Line Platform)',
    type: 'platform',
    coordinates: [77.2192, 28.6334],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: false,
    hasTactilePaving: true,
    facilities: [],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_central_east_exit',
    name: 'Central Station (East Pedestrian Concourse)',
    type: 'intersection',
    coordinates: [77.2210, 28.6342],
    isWheelchairAccessible: false, // connected via stairs only from main concourse
    hasElevator: false,
    hasRamps: false,
    hasTactilePaving: false,
    facilities: [],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_central_bus_terminal',
    name: 'Central Bus Terminal (Bay 4)',
    type: 'bus_stop',
    coordinates: [77.2168, 28.6315],
    isWheelchairAccessible: true,
    hasElevator: false,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'ramp_b1',
        name: 'Bus Terminal Low-Curb Ramp B1',
        stationId: 'node_central_bus_terminal',
        stationName: 'Central Bus Terminal',
        type: 'ramp',
        operational: true,
        statusDescription: 'Level boarding platform with kneeling bus curbs',
        lastUpdated: '25 minutes ago',
        verifiedBy: 'City Transit IoT',
        latitude: 28.6316,
        longitude: 77.2169,
      }
    ],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_market_square',
    name: 'Market Square Station',
    type: 'station',
    coordinates: [77.2280, 28.6270],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'elev_m1',
        name: 'Elevator M1 (Market Square Street to Platform)',
        stationId: 'node_market_square',
        stationName: 'Market Square Station',
        type: 'elevator',
        operational: true,
        statusDescription: 'Operational',
        lastUpdated: '15 minutes ago',
        verifiedBy: 'Station IoT',
        latitude: 28.6271,
        longitude: 77.2281,
      }
    ],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_riverside_north',
    name: 'Riverside North Metro Stop',
    type: 'station',
    coordinates: [77.2410, 28.6415],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'elev_r1',
        name: 'Elevator R1 (Riverside Platform to Bridge)',
        stationId: 'node_riverside_north',
        stationName: 'Riverside North Metro Stop',
        type: 'elevator',
        operational: true,
        statusDescription: 'Operational - Checked today',
        lastUpdated: '8 minutes ago',
        verifiedBy: 'Station Telemetry',
        latitude: 28.6416,
        longitude: 77.2412,
      }
    ],
    zone: 'Zone 2 - North Riverside'
  },
  {
    id: 'node_riverside_gate_a',
    name: 'Riverside Promenade Walkway',
    type: 'intersection',
    coordinates: [77.2440, 28.6430],
    isWheelchairAccessible: true,
    hasElevator: false,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [],
    zone: 'Zone 2 - North Riverside'
  },
  {
    id: 'node_riverside_campus',
    name: 'Riverside Campus (Academic Center)',
    type: 'destination',
    coordinates: [77.2475, 28.6450],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'ramp_camp1',
        name: 'Riverside Main Entrance Ramp',
        stationId: 'node_riverside_campus',
        stationName: 'Riverside Campus',
        type: 'ramp',
        operational: true,
        statusDescription: 'Operational - Wide automatic sensory doors',
        lastUpdated: '1 hour ago',
        verifiedBy: 'Campus Access Audit',
        latitude: 28.6451,
        longitude: 77.2476,
      }
    ],
    zone: 'Zone 2 - North Riverside'
  },
  {
    id: 'node_south_avenue_bus_stop',
    name: 'South Avenue Junction (Bus 402 Stop)',
    type: 'bus_stop',
    coordinates: [77.2315, 28.6210],
    isWheelchairAccessible: true,
    hasElevator: false,
    hasRamps: true,
    hasTactilePaving: false,
    facilities: [],
    zone: 'Zone 3 - South Corridor'
  },
  {
    id: 'node_tech_park_station',
    name: 'Tech Park Metro Interchange',
    type: 'station',
    coordinates: [77.2350, 28.6360],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [
      {
        id: 'elev_tp1',
        name: 'Elevator TP-1 (Interchange Transfer Lift)',
        stationId: 'node_tech_park_station',
        stationName: 'Tech Park Metro Interchange',
        type: 'elevator',
        operational: true,
        statusDescription: 'Operational',
        lastUpdated: '12 minutes ago',
        verifiedBy: 'Metro Dispatch',
        latitude: 28.6361,
        longitude: 77.2352,
      }
    ],
    zone: 'Zone 1 - Downtown'
  },
  {
    id: 'node_city_hospital',
    name: 'City Care Hospital Gate 2',
    type: 'destination',
    coordinates: [77.2120, 28.6220],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [],
    zone: 'Zone 3 - Medical District'
  },
  {
    id: 'node_green_park',
    name: 'Green Park Transit Hub',
    type: 'station',
    coordinates: [77.2050, 28.6180],
    isWheelchairAccessible: true,
    hasElevator: true,
    hasRamps: true,
    hasTactilePaving: true,
    facilities: [],
    zone: 'Zone 3 - South Corridor'
  }
];

export const DEMO_EDGES: NetworkEdge[] = [
  // 1. Direct Stairs connection at Central Station (Shortest foot distance, but INACCESSIBLE)
  {
    id: 'edge_central_stairs',
    fromNodeId: 'node_central_station',
    toNodeId: 'node_central_east_exit',
    mode: 'stairs',
    distanceMeters: 90,
    durationMinutes: 2,
    fareINR: 0,
    stepFree: false,
    wheelchairAccessible: false,
    hasStairs: true,
    evidenceSource: 'station_audit',
    lastUpdated: '2026-11-04T10:00:00Z',
    isOperational: true,
    geometry: [
      [77.2185, 28.6328],
      [77.2198, 28.6335],
      [77.2210, 28.6342]
    ]
  },
  // East exit direct bus / walking link to Riverside (Forms the naive shortest path containing stairs!)
  {
    id: 'edge_east_to_riverside_direct',
    fromNodeId: 'node_central_east_exit',
    toNodeId: 'node_riverside_campus',
    mode: 'bus',
    lineName: 'Shuttle 10-Express',
    lineColor: '#6B7280',
    distanceMeters: 3100,
    durationMinutes: 12,
    fareINR: 25,
    stepFree: false, // high-floor historic shuttle with stairs
    wheelchairAccessible: false,
    hasStairs: true,
    evidenceSource: 'municipal_survey',
    lastUpdated: '2026-11-04T08:30:00Z',
    isOperational: true,
    geometry: [
      [77.2210, 28.6342],
      [77.2300, 28.6380],
      [77.2390, 28.6420],
      [77.2475, 28.6450]
    ]
  },

  // 2. Central Station Elevator A1 leg to Metro Blue Line Platform (Crucial ACCESSIBLE leg)
  {
    id: 'edge_central_elevator_a1',
    fromNodeId: 'node_central_station',
    toNodeId: 'node_central_lower_platform',
    mode: 'elevator',
    elevatorId: 'elev_a1',
    distanceMeters: 40,
    durationMinutes: 2,
    fareINR: 0,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:45:00Z',
    isOperational: true, // will be flipped to false during disruption!
    geometry: [
      [77.2185, 28.6328],
      [77.2186, 28.6330],
      [77.2192, 28.6334]
    ]
  },

  // 3. Metro Blue Line from Central Lower Platform to Tech Park & Riverside North
  {
    id: 'edge_metro_central_to_techpark',
    fromNodeId: 'node_central_lower_platform',
    toNodeId: 'node_tech_park_station',
    mode: 'metro',
    lineName: 'Blue Line (Rapid Metro)',
    lineColor: '#2563EB',
    distanceMeters: 2200,
    durationMinutes: 6,
    fareINR: 20,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:50:00Z',
    isOperational: true,
    geometry: [
      [77.2192, 28.6334],
      [77.2260, 28.6345],
      [77.2350, 28.6360]
    ]
  },
  {
    id: 'edge_metro_techpark_to_riverside_north',
    fromNodeId: 'node_tech_park_station',
    toNodeId: 'node_riverside_north',
    mode: 'metro',
    lineName: 'Blue Line (Rapid Metro)',
    lineColor: '#2563EB',
    distanceMeters: 1800,
    durationMinutes: 5,
    fareINR: 15,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:50:00Z',
    isOperational: true,
    geometry: [
      [77.2350, 28.6360],
      [77.2385, 28.6390],
      [77.2410, 28.6415]
    ]
  },

  // 4. Riverside North Elevator R1 and Level Promenade to Riverside Campus
  {
    id: 'edge_riverside_lift_to_promenade',
    fromNodeId: 'node_riverside_north',
    toNodeId: 'node_riverside_gate_a',
    mode: 'elevator',
    elevatorId: 'elev_r1',
    distanceMeters: 60,
    durationMinutes: 2,
    fareINR: 0,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:52:00Z',
    isOperational: true,
    geometry: [
      [77.2410, 28.6415],
      [77.2425, 28.6422],
      [77.2440, 28.6430]
    ]
  },
  {
    id: 'edge_promenade_to_campus',
    fromNodeId: 'node_riverside_gate_a',
    toNodeId: 'node_riverside_campus',
    mode: 'walking',
    distanceMeters: 180,
    durationMinutes: 3,
    fareINR: 0,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'station_audit',
    lastUpdated: '2026-11-04T12:00:00Z',
    isOperational: true,
    geometry: [
      [77.2440, 28.6430],
      [77.2458, 28.6440],
      [77.2475, 28.6450]
    ]
  },

  // 5. Alternative Accessible Route: West Wing Ramp W1 -> Central Bus Terminal
  {
    id: 'edge_central_west_ramp',
    fromNodeId: 'node_central_station',
    toNodeId: 'node_central_bus_terminal',
    mode: 'ramp',
    distanceMeters: 140,
    durationMinutes: 3,
    fareINR: 0,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'municipal_survey',
    lastUpdated: '2026-11-05T06:00:00Z',
    isOperational: true,
    geometry: [
      [77.2185, 28.6328],
      [77.2175, 28.6320],
      [77.2168, 28.6315]
    ]
  },

  // 6. Accessible Low-Floor Bus 402: Central Bus Terminal -> South Ave -> Riverside Campus
  {
    id: 'edge_bus_terminal_to_south_ave',
    fromNodeId: 'node_central_bus_terminal',
    toNodeId: 'node_south_avenue_bus_stop',
    mode: 'bus',
    lineName: 'Bus 402 (Accessible Low-Floor Kneeling Bus)',
    lineColor: '#087F6D',
    distanceMeters: 1900,
    durationMinutes: 10,
    fareINR: 20,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:40:00Z',
    isOperational: true,
    geometry: [
      [77.2168, 28.6315],
      [77.2240, 28.6260],
      [77.2315, 28.6210]
    ]
  },
  {
    id: 'edge_south_ave_to_riverside',
    fromNodeId: 'node_south_avenue_bus_stop',
    toNodeId: 'node_riverside_campus',
    mode: 'bus',
    lineName: 'Bus 402 (Accessible Low-Floor Kneeling Bus)',
    lineColor: '#087F6D',
    distanceMeters: 3400,
    durationMinutes: 13,
    fareINR: 25,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:40:00Z',
    isOperational: true,
    geometry: [
      [77.2315, 28.6210],
      [77.2390, 28.6320],
      [77.2440, 28.6400],
      [77.2475, 28.6450]
    ]
  },

  // 7. Alternative Metro Route via Market Square (Yellow Line connection)
  {
    id: 'edge_central_to_market_sq',
    fromNodeId: 'node_central_station',
    toNodeId: 'node_market_square',
    mode: 'bus',
    lineName: 'City Link 12 (Low Floor)',
    lineColor: '#B66A08',
    distanceMeters: 1200,
    durationMinutes: 7,
    fareINR: 15,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:30:00Z',
    isOperational: true,
    geometry: [
      [77.2185, 28.6328],
      [77.2230, 28.6300],
      [77.2280, 28.6270]
    ]
  },
  {
    id: 'edge_market_sq_to_techpark',
    fromNodeId: 'node_market_square',
    toNodeId: 'node_tech_park_station',
    mode: 'metro',
    lineName: 'Yellow Line Express',
    lineColor: '#B66A08',
    distanceMeters: 1600,
    durationMinutes: 6,
    fareINR: 15,
    stepFree: true,
    wheelchairAccessible: true,
    hasStairs: false,
    evidenceSource: 'operator_iot',
    lastUpdated: '2026-11-05T07:30:00Z',
    isOperational: true,
    geometry: [
      [77.2280, 28.6270],
      [77.2310, 28.6315],
      [77.2350, 28.6360]
    ]
  }
];

export const INITIAL_DISRUPTIONS: DisruptionEvent[] = [];

export const DEMO_SCENARIOS = [
  {
    id: 'scenario_1',
    name: 'Scenario 1: Normal Operations',
    description: 'All elevators, ramps, low-floor buses and rapid metro services operating normally.',
    disruptions: []
  },
  {
    id: 'scenario_2',
    name: 'Scenario 2: Elevator A1 Outage (Hero Hackathon Demo)',
    description: 'Elevator A1 at Central Station fails due to traction motor overheating. Primary wheelchair metro connection is severed; system dynamically replans via West Wing Ramp & Accessible Bus 402.',
    disruptions: [
      {
        id: 'disrupt_elev_a1',
        entityId: 'elev_a1',
        entityName: 'Elevator A1 (Platform 1-2 & Concourse)',
        stationName: 'Central Station',
        type: 'elevator_outage',
        severity: 'critical',
        reason: 'Traction motor overheating - Maintenance dispatch in progress',
        effectiveStart: '2026-11-05T08:05:00Z',
        estimatedResolution: '2026-11-05T12:00:00Z',
        affectedLinesOrStops: ['Metro Blue Line Platform Access', 'Central Station Platform 1-2'],
        impactOnAccessibility: 'Direct wheelchair access between Central Station Concourse and Metro Blue Line severed. Step-free path blocked.',
        isActive: true
      }
    ]
  },
  {
    id: 'scenario_3',
    name: 'Scenario 3: Riverside Promenade Path Closure',
    description: 'Maintenance repaving on Riverside Promenade walkway. Wheelchair travellers routed via East Academic Bridge.',
    disruptions: [
      {
        id: 'disrupt_promenade',
        entityId: 'edge_promenade_to_campus',
        entityName: 'Riverside Promenade Walkway',
        stationName: 'Riverside Campus',
        type: 'path_closure',
        severity: 'warning',
        reason: 'Surface resealing and stone realignment',
        effectiveStart: '2026-11-05T06:00:00Z',
        estimatedResolution: '2026-11-05T16:00:00Z',
        affectedLinesOrStops: ['Riverside Gate A', 'Academic Center'],
        impactOnAccessibility: 'Tactile paving and wheelchair route detoured 90 meters.',
        isActive: true
      }
    ]
  }
];

