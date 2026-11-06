import campusCatalogJson from '../../traversal/routing/config/campus-locations.json';
import { isDemoMode } from '../config/runtime';
import { NetworkNode } from '../types';
import { DEMO_NODES } from './demoNetwork';

export interface JourneyLocation {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
}

interface CampusCatalog {
  graph_id: string;
  locations: Array<{
    id: string;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
  }>;
}

const campusCatalog = campusCatalogJson as CampusCatalog;

export const CAMPUS_LOCATIONS: JourneyLocation[] = campusCatalog.locations.map((location) => ({
  id: location.id,
  name: location.name,
  category: location.category,
  latitude: location.latitude,
  longitude: location.longitude,
}));

const DEMO_LOCATIONS: JourneyLocation[] = DEMO_NODES.map((node) => ({
  id: node.id,
  name: node.name,
  category: node.type,
  latitude: node.coordinates[1],
  longitude: node.coordinates[0],
}));

export const ACTIVE_LOCATIONS = isDemoMode ? DEMO_LOCATIONS : CAMPUS_LOCATIONS;
export const DEFAULT_ORIGIN_ID = isDemoMode ? 'node_central_station' : 'srm-library';
export const DEFAULT_DESTINATION_ID = isDemoMode
  ? 'node_riverside_campus'
  : 'srm-medical-college-hospital';

export function getJourneyLocation(id: string): JourneyLocation | undefined {
  return ACTIVE_LOCATIONS.find((location) => location.id === id);
}

export function getCampusLocation(id: string): JourneyLocation | undefined {
  return CAMPUS_LOCATIONS.find((location) => location.id === id);
}

export function getJourneyLocationName(id: string): string {
  return getJourneyLocation(id)?.name ?? id;
}

function campusNodeType(category: string): NetworkNode['type'] {
  if (category === 'bus_stop' || category === 'transit_stop') return 'bus_stop';
  if (category === 'gate') return 'entrance';
  return 'destination';
}

export const CAMPUS_NETWORK_NODES: NetworkNode[] = CAMPUS_LOCATIONS.map((location) => ({
  id: location.id,
  name: location.name,
  type: campusNodeType(location.category),
  coordinates: [location.longitude, location.latitude],
  accessibilityStatus: 'unknown',
  isWheelchairAccessible: null,
  hasElevator: false,
  hasRamps: false,
  hasTactilePaving: false,
  facilities: [],
  zone: 'SRM Kattankulathur',
}));

export const ACTIVE_NETWORK_NODES = isDemoMode ? DEMO_NODES : CAMPUS_NETWORK_NODES;

export const ACTIVE_MAP_CONFIG = isDemoMode
  ? {
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=77.2000%2C28.6180%2C77.2600%2C28.6550&layer=mapnik&marker=28.6328%2C77.2185',
      fullMapUrl: 'https://www.openstreetmap.org/#map=14/28.6350/77.2300',
      schematicViewBox: '77.20 28.61 0.06 0.04',
      subtitle: 'Demo multimodal corridor',
    }
  : {
      embedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=80.0330%2C12.8118%2C80.0570%2C12.8351&layer=mapnik&marker=12.8234361%2C80.0450412',
      fullMapUrl: 'https://www.openstreetmap.org/#map=16/12.8234361/80.0450412',
      schematicViewBox: '80.032 12.810 0.027 0.027',
      subtitle: 'SRM walking network',
    };

export const CAMPUS_GRAPH_ID = campusCatalog.graph_id;
