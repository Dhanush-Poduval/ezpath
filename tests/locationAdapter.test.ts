import { describe, expect, it } from 'vitest';
import {
  LocationMapAdapter,
  OSM_STYLE,
} from '../src/services/maps/locationAdapter';

describe('LocationMapAdapter', () => {
  it('uses OpenStreetMap when the complete AWS browser configuration is unavailable', () => {
    const adapter = new LocationMapAdapter({
      mapName: 'EzPathCampusMap',
      region: 'ap-south-1',
      apiKey: '',
      demoMode: false,
    });

    expect(adapter.getMapConfig()).toMatchObject({
      style: OSM_STYLE,
      provider: 'openstreetmap',
      defaultCenter: [80.0450412, 12.8234361],
    });
  });

  it('builds a key-authenticated Amazon Location style descriptor URL', () => {
    const adapter = new LocationMapAdapter({
      mapName: 'EzPath Campus',
      region: 'ap-south-1',
      apiKey: 'v1.public/key+value',
      demoMode: false,
    });

    expect(adapter.getMapConfig()).toMatchObject({
      provider: 'amazon-location',
      style:
        'https://maps.geo.ap-south-1.amazonaws.com/maps/v0/maps/EzPath%20Campus/style-descriptor?key=v1.public%2Fkey%2Bvalue',
    });
  });

  it('pads calculated route bounds and returns null for an empty route', () => {
    const adapter = new LocationMapAdapter({ demoMode: true });

    expect(adapter.calculateBounds([])).toBeNull();
    expect(
      adapter.calculateBounds([
        [80.04, 12.82],
        [80.05, 12.83],
      ]),
    ).toEqual([
      [80.039, 12.819],
      [80.051, 12.831],
    ]);
  });
});
