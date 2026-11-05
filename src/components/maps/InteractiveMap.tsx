import React, { useState, useMemo } from 'react';
import { DEMO_NODES } from '../../data/demoNetwork';
import { JourneyRoute, FacilityStatus, NetworkNode } from '../../types';
import { MapLegend } from './MapLegend';
import { useOperatorStore } from '../../stores/operatorStore';
import { 
  Navigation, 
  MapPin, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface InteractiveMapProps {
  routes?: JourneyRoute[];
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routes = [],
  selectedRouteId,
  className = "w-full h-full relative"
}) => {
  const [selectedEntity, setSelectedEntity] = useState<NetworkNode | FacilityStatus | null>(null);
  const [mapMode, setMapMode] = useState<'osm' | 'schematic'>('osm');
  const { disruptions } = useOperatorStore();

  const selectedRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Center coordinate bbox for OpenStreetMap embed (Central Station to Riverside Campus corridor)
  // Coordinates: ~28.6180 to 28.6550 lat, 77.2000 to 77.2600 lng
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=77.2000%2C28.6180%2C77.2600%2C28.6550&layer=mapnik&marker=28.6328%2C77.2185`;

  return (
    <div 
      className={`relative w-full h-full min-h-[500px] overflow-hidden bg-slate-100 flex flex-col ${className}`}
      aria-label="Transit and Accessible Route Map"
    >
      {/* 1. OpenStreetMap (OSM) Map View */}
      {mapMode === 'osm' ? (
        <div className="absolute inset-0 w-full h-full">
          <iframe
            title="OpenStreetMap Live Cartography"
            src={osmEmbedUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="eager"
          />
        </div>
      ) : (
        /* 2. Multimodal Transit Schematic Overlay */
        <div className="absolute inset-0 w-full h-full bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
          <svg viewBox="77.20 28.61 0.06 0.04" className="w-full h-full max-h-[700px]">
            {/* Draw Base Nodes */}
            {DEMO_NODES.map(node => {
              const isOrigin = selectedRoute?.legs[0]?.fromNodeId === node.id;
              const isDest = selectedRoute?.legs[selectedRoute.legs.length - 1]?.toNodeId === node.id;
              const fill = isOrigin ? '#2563EB' : isDest ? '#087F6D' : '#334155';

              return (
                <g 
                  key={node.id} 
                  className="cursor-pointer"
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

      {/* Top Floating Map Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-floating flex items-center gap-2.5 text-xs font-medium text-ink pointer-events-auto">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
            OSM
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-ink leading-none">OpenStreetMap</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Delhi Multimodal Accessible Corridor</span>
          </div>
          <span className="text-slate-300">|</span>
          <a
            href="https://www.openstreetmap.org/#map=14/28.6350/77.2300"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover inline-flex items-center gap-1 text-[11px] font-semibold"
          >
            Full Map <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Map View Mode Switcher */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-floating pointer-events-auto text-xs">
          <button
            onClick={() => setMapMode('osm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mapMode === 'osm' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-ink'
            }`}
          >
            Street (OSM)
          </button>
          <button
            onClick={() => setMapMode('schematic')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              mapMode === 'schematic' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-600 hover:text-ink'
            }`}
          >
            Network Nodes
          </button>
        </div>
      </div>

      {/* Floating Active Route Pills on Map */}
      <div className="absolute top-16 left-4 z-20 space-y-1.5 pointer-events-auto max-w-sm">
        {selectedRoute && (
          <div className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-floating text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-accessible" />
                {selectedRoute.label}
              </span>
              <span className="font-semibold text-slate-500">
                {selectedRoute.totalDurationMinutes} min · ₹{selectedRoute.totalFareINR}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-accent" /> Central Station
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-accessible" /> Riverside Campus
              </span>
            </div>
          </div>
        )}
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
