import React, { useState } from 'react';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';

interface MapLegendProps {
  className?: string;
}

export const MapLegend: React.FC<MapLegendProps> = ({ className = "bottom-4 left-1/2 -translate-x-1/2" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`absolute z-20 pointer-events-auto transition-all ${className}`}>
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-floating text-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between gap-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-500">
            <Layers className="w-3.5 h-3.5 text-accent" />
            Map Layers & Legend
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {isExpanded && (
          <div className="p-3 pt-1 border-t border-slate-100 space-y-1.5 min-w-[230px]">
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
        )}
      </div>
    </div>
  );
};
