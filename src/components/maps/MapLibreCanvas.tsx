import React, { useEffect, useRef } from 'react';
import maplibregl, { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import { ACTIVE_NETWORK_NODES } from '../../data/networkLocations';
import { locationMapAdapter } from '../../services/maps/locationAdapter';
import { JourneyRoute, NetworkNode } from '../../types';

interface MapLibreCanvasProps {
  selectedRoute?: JourneyRoute;
  onSelectEntity: (entity: NetworkNode) => void;
}

const ROUTE_SOURCE_ID = 'ezpath-selected-route';
const ROUTE_LAYER_ID = 'ezpath-selected-route-line';

function routeFeature(route?: JourneyRoute) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: route?.geometry ?? [],
    },
  };
}

export const MapLibreCanvas: React.FC<MapLibreCanvasProps> = ({
  selectedRoute,
  onSelectEntity,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = locationMapAdapter.getMapConfig();
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: config.style,
      center: config.defaultCenter,
      zoom: config.defaultZoom,
      minZoom: config.minZoom,
      maxZoom: config.maxZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.on('load', () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: 'geojson',
        data: routeFeature(selectedRoute),
      });
      map.addLayer({
        id: ROUTE_LAYER_ID,
        type: 'line',
        source: ROUTE_SOURCE_ID,
        paint: {
          'line-color': '#087F6D',
          'line-width': 6,
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      if (selectedRoute?.geometry.length) {
        const bounds = locationMapAdapter.calculateBounds(selectedRoute.geometry);
        if (bounds) map.fitBounds(bounds, { padding: 72, maxZoom: 17, duration: 0 });
      }
    });

    markersRef.current = ACTIVE_NETWORK_NODES.map((node) => {
      const markerElement = document.createElement('button');
      markerElement.type = 'button';
      markerElement.className =
        'h-4 w-4 rounded-full border-2 border-white bg-slate-700 shadow-md focus:outline-none focus:ring-2 focus:ring-accent';
      markerElement.title = node.name;
      markerElement.setAttribute('aria-label', `Inspect ${node.name}`);
      markerElement.addEventListener('click', () => onSelectEntity(node));

      return new maplibregl.Marker({ element: markerElement })
        .setLngLat(node.coordinates)
        .addTo(map);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectEntity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(routeFeature(selectedRoute));

    if (selectedRoute?.geometry.length) {
      const bounds = locationMapAdapter.calculateBounds(selectedRoute.geometry);
      if (bounds) map.fitBounds(bounds, { padding: 72, maxZoom: 17, duration: 400 });
    }
  }, [selectedRoute]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
};
