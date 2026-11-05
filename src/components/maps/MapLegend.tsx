import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-subtle-border shadow-floating text-xs space-y-2 pointer-events-auto max-w-[240px]">
      <div className="font-semibold text-ink text-[11px] uppercase tracking-wider text-slate-500">
        Map Cartography & Layers
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 rounded-full bg-accessible"></div>
          <span className="text-ink">Step-Free Accessible Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 rounded-full bg-slate-400"></div>
          <span className="text-ink-secondary">Alternative Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-1 border-b-2 border-dashed border-disruption"></div>
          <span className="text-disruption font-medium">Inaccessible / Disrupted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-white"></div>
          <span className="text-ink">Operational Elevator / Ramp</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-disruption border border-white animate-pulse"></div>
          <span className="text-disruption font-medium">Elevator Outage / Closure</span>
        </div>
      </div>
    </div>
  );
};

