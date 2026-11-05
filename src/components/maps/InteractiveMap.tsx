import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { DEMO_NODES, DEMO_EDGES } from '../../data/demoNetwork';
import { JourneyRoute, FacilityStatus, NetworkNode } from '../../types';
import { MapLegend } from './MapLegend';
import { locationMapAdapter } from '../../services/maps/locationAdapter';
import { useOperatorStore } from '../../stores/operatorStore';
import { 
  Maximize2, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  X,
  Navigation
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface InteractiveMapProps {
  routes?: JourneyRoute[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  className = "w-full h-full relative"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<NetworkNode | FacilityStatus | null>(null);
  const [isWebGlSupported, setIsWebGlSupported] = useState<boolean>(true);
  const { disruptions } = useOperatorStore();

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = Boolean(
        window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setIsWebGlSupported(supported);
    } catch {
      setIsWebGlSupported(false);
    }
  }, []);

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!isWebGlSupported || !mapContainerRef.current || mapRef.current) return;

    try {
      const mapConfig = locationMapAdapter.getMapConfig();
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapConfig.styleUrl,
        center: mapConfig.defaultCenter,
        zoom: mapConfig.defaultZoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      mapRef.current = map;

      map.on('load', () => {
        updateMapLayers(map);
      });
    } catch {
      setIsWebGlSupported(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isWebGlSupported]);

  // Update MapLibre layers when routes or disruptions change
  const updateMapLayers = (map: maplibregl.Map) => {
    if (!map.isStyleLoaded()) return;

    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Network Nodes & Facility markers
    DEMO_NODES.forEach(node => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer transform hover:scale-110 transition-transform';
      
      const isStart = selectedRoute?.legs[0]?.fromNodeId === node.id;
      const isEnd = selectedRoute?.legs[selectedRoute.legs.length - 1]?.toNodeId === node.id;

      let markerBg = 'bg-slate-700';
      if (isStart) markerBg = 'bg-accent ring-4 ring-blue-100';
      else if (isEnd) markerBg = 'bg-accessible ring-4 ring-emerald-100';
      else if (node.type === 'station') markerBg = 'bg-blue-600';

      el.innerHTML = `
        <div class="w-6 h-6 rounded-full ${markerBg} text-white flex items-center justify-center text-[10px] font-bold shadow-md">
          ${isStart ? 'A' : isEnd ? 'B' : '•'}
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedEntity(node);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(node.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Add route line sources and layers if route geometries exist
    const sourceId = 'accesspath-routes-source';
    const features: any[] = [];

    routes.forEach(route => {
      const isSelected = route.id === selectedRoute?.id;
      const isAffected = route.affectedByDisruption;

      features.push({
        type: 'Feature',
        properties: {
          routeId: route.id,
          isSelected,
          isAffected,
          isStepFree: route.isStepFree,
          color: isAffected ? '#C43D43' : isSelected ? '#087F6D' : '#94A3B8',
          width: isSelected ? 5 : 3,
        },
        geometry: {
          type: 'LineString',
          coordinates: route.geometry
        }
      });
    });

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      map.addLayer({
        id: 'accesspath-routes-layer',
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': 0.9
        }
      });
    }

    // Fit bounds if selected route has geometry
    if (selectedRoute?.geometry && selectedRoute.geometry.length > 0) {
      const bounds = locationMapAdapter.calculateBounds(selectedRoute.geometry);
      if (bounds) {
        map.fitBounds(bounds, { padding: 60, duration: 800 });
      }
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      updateMapLayers(mapRef.current);
    }
  }, [routes, selectedRoute, disruptions]);

  const fitToSelectedRoute = () => {
    if (mapRef.current && selectedRoute?.geometry) {
      const bounds = locationMapAdapter.calculateBounds(selectedRoute.geometry);
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: 60, duration: 600 });
      }
    }
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`} aria-label="Interactive Transit and Route Map">
      {/* MapLibre WebGL Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className={`w-full h-full ${!isWebGlSupported ? 'hidden' : 'block'}`}
      />

      {/* High-Fidelity SVG Fallback Cartography (Guarantees flawless visual map even without WebGL) */}
      {!isWebGlSupported && (
        <div className="w-full h-full relative bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
          <svg viewBox="77.20 28.61 0.06 0.04" className="w-full h-full max-h-[700px] preserve-3d">
            {/* Draw Base Edges */}
            {DEMO_EDGES.map(edge => {
              const isStairs = edge.mode === 'stairs';
              const isSelected = selectedRoute?.legs.some(l => l.fromNodeId === edge.fromNodeId && l.toNodeId === edge.toNodeId);
              const isLiftDown = edge.elevatorId && disruptions.some(d => d.isActive && d.entityId === edge.elevatorId);

              const stroke = isLiftDown || isStairs ? '#C43D43' : isSelected ? '#087F6D' : '#CBD5E1';
              const strokeWidth = isSelected ? '0.0009' : '0.0004';
              const strokeDash = isStairs || isLiftDown ? '0.0006, 0.0004' : 'none';

              const pathData = edge.geometry.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ');

              return (
                <path
                  key={edge.id}
                  d={pathData}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Draw Nodes */}
            {DEMO_NODES.map(node => {
              const isOrigin = selectedRoute?.legs[0]?.fromNodeId === node.id;
              const isDest = selectedRoute?.legs[selectedRoute.legs.length - 1]?.toNodeId === node.id;
              const fill = isOrigin ? '#2563EB' : isDest ? '#087F6D' : '#334155';

              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer group"
                  onClick={() => setSelectedEntity(node)}
                >
                  <circle
                    cx={node.coordinates[0]}
                    cy={node.coordinates[1]}
                    r={isOrigin || isDest ? 0.0012 : 0.0008}
                    fill={fill}
                    stroke="#FFFFFF"
                    strokeWidth="0.0002"
                  />
                  <text
                    x={node.coordinates[0]}
                    y={node.coordinates[1] - 0.0012}
                    fontSize="0.001"
                    textAnchor="middle"
                    fill="#14243A"
                    fontWeight={isOrigin || isDest ? "700" : "500"}
                  >
                    {node.name.split(' (')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Top Map Floating Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-subtle-border shadow-subtle flex items-center gap-2 text-xs font-medium text-ink">
          <Navigation className="w-3.5 h-3.5 text-accent" />
          <span>Multimodal Network Visualizer</span>
          <span className="text-slate-300">|</span>
          <span className="text-ink-muted">Delhi NCR Accessible Corridor</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fitToSelectedRoute}
          title="Fit view to active route"
          className="bg-white/95 backdrop-blur-sm h-8 px-2.5 text-xs shadow-subtle"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-1">Fit Route</span>
        </Button>
      </div>

      {/* Map Legend */}
      <MapLegend />

      {/* Interactive Entity Inspection Drawer (when a station/facility marker is clicked) */}
      {selectedEntity && (
        <div className="absolute top-4 right-4 z-30 w-80 max-w-[calc(100%-2rem)] bg-white/98 backdrop-blur-md rounded-xl border border-subtle-border shadow-floating p-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between gap-2 border-b border-subtle-border pb-2.5 mb-3">
            <div>
              <div className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                {'type' in selectedEntity ? 'Transit Infrastructure Node' : 'Facility Sensor'}
              </div>
              <h3 className="font-heading font-bold text-sm text-ink leading-tight">
                {selectedEntity.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {'zone' in selectedEntity && selectedEntity.zone && (
              <div className="flex justify-between items-center text-slate-600">
                <span>District / Zone</span>
                <span className="font-medium text-ink">{selectedEntity.zone}</span>
              </div>
            )}

            {'facilities' in selectedEntity && selectedEntity.facilities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="font-semibold text-ink text-[11px] uppercase tracking-wider text-slate-500">
                  Station Hardware & Lifts
                </div>
                <div className="space-y-2">
                  {selectedEntity.facilities.map(fac => {
                    const isDisrupted = disruptions.some(d => d.isActive && d.entityId === fac.id);
                    return (
                      <div 
                        key={fac.id} 
                        className={`p-2 rounded-lg border text-xs ${
                          isDisrupted 
                            ? 'bg-disruption-subtle border-disruption-border text-disruption' 
                            : 'bg-slate-50 border-slate-200 text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{fac.name}</span>
                          {isDisrupted ? (
                            <Badge variant="disruption">Unavailable</Badge>
                          ) : (
                            <Badge variant="accessible">Operational</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600">
                          {isDisrupted ? fac.statusDescription : 'Telemetry confirmed operational'}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{fac.verifiedBy}</span>
                          <span>{fac.lastUpdated}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {'isWheelchairAccessible' in selectedEntity && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-600">Wheelchair Accessible</span>
                {selectedEntity.isWheelchairAccessible ? (
                  <span className="flex items-center gap-1 font-semibold text-accessible">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-semibold text-disruption">
                    <XCircle className="w-3.5 h-3.5" /> No (Stairs only)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

