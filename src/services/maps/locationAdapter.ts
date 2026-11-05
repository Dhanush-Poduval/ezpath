/**
 * Amazon Location Service & MapLibre Integration Adapter
 * Uses OpenStreetMap (OSM) standard tiles by default for instant, dependency-free cartography,
 * with AWS Amazon Location Service integration ready.
 */

export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    'osm-tiles': {
      type: 'raster' as const,
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster' as const,
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export interface MapConfig {
  style: any;
  defaultCenter: [number, number];
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
}

export class LocationMapAdapter {
  private mapName: string;
  private region: string;

  constructor() {
    this.mapName = import.meta.env.VITE_LOCATION_MAP_NAME || 'AccessPathDefaultMap';
    this.region = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
  }

  getMapConfig(): MapConfig {
    const hasAwsConfig = Boolean(import.meta.env.VITE_LOCATION_MAP_NAME && import.meta.env.VITE_AWS_REGION);

    // If AWS credentials / Amazon Location map is configured, use AWS style descriptor URL;
    // otherwise use high-speed direct OpenStreetMap (OSM) tiles
    const style = hasAwsConfig 
      ? `https://maps.geo.${this.region}.amazonaws.com/maps/v0/maps/${this.mapName}/style-descriptor`
      : OSM_STYLE;

    return {
      style,
      defaultCenter: [77.2300, 28.6350], // Centered around Delhi multimodal corridor
      defaultZoom: 13.5,
      minZoom: 10,
      maxZoom: 18,
    };
  }

  /**
   * Helper to calculate a bounding box for a set of GeoJSON coordinates
   */
  calculateBounds(coordinates: [number, number][]): [[number, number], [number, number]] | null {
    if (!coordinates || coordinates.length === 0) return null;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    for (const [lng, lat] of coordinates) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }

    // Add padding
    const lngPadding = (maxLng - minLng) * 0.1 || 0.005;
    const latPadding = (maxLat - minLat) * 0.1 || 0.005;

    return [
      [minLng - lngPadding, minLat - latPadding],
      [maxLng + lngPadding, maxLat + latPadding]
    ];
  }
}

export const locationMapAdapter = new LocationMapAdapter();
