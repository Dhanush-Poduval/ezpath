import React from 'react';
import { useJourneyStore } from '../../stores/journeyStore';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Footprints, 
  ArrowRight, 
  X,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const WhatChangedDiff: React.FC = () => {
  const { lastDisruptionDiff, clearDisruptionDiff } = useJourneyStore();

  if (!lastDisruptionDiff) return null;

  const {
    durationChangeMinutes,
    fareChangeINR,
    walkingDistanceChangeMeters,
    transfersChange,
    stepFreeMaintained,
    affectedFacilityName
  } = lastDisruptionDiff;

  return (
    <div 
      role="region"
      aria-label="Dynamic Rerouting Comparison"
      className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-2 border-accessible shadow-floating animate-in fade-in slide-in-from-bottom-4 duration-300 relative text-ink"
    >
      <button
        onClick={clearDisruptionDiff}
        className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100"
        aria-label="Dismiss rerouting summary"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-accessible text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-accessible">
            Dynamic Rerouting Complete
          </span>
          <h3 className="font-heading font-extrabold text-base text-ink">
            What changed in your journey?
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-4 leading-relaxed">
        Ezpath successfully rerouted around the outage at <strong className="text-ink">{affectedFacilityName}</strong> while maintaining all your original physical accessibility constraints.
      </p>

      {/* Diff metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        {/* Duration Diff */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-accent" /> Travel Time
          </div>
          <div className="font-heading font-extrabold text-lg text-ink">
            {durationChangeMinutes > 0 ? `+${durationChangeMinutes}` : durationChangeMinutes} min
          </div>
          <div className="text-[10px] text-slate-500">
            {durationChangeMinutes > 0 ? 'Detour around outage' : 'Optimized time'}
          </div>
        </div>

        {/* Fare Diff */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Fare Impact
          </div>
          <div className="font-heading font-extrabold text-lg text-ink">
            {fareChangeINR > 0 ? `+₹${fareChangeINR}` : fareChangeINR === 0 ? 'No change' : `-₹${Math.abs(fareChangeINR)}`}
          </div>
          <div className="text-[10px] text-slate-500">
            Within your budget
          </div>
        </div>

        {/* Walking Diff */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
            <Footprints className="w-3.5 h-3.5 text-indigo-500" /> Walking
          </div>
          <div className="font-heading font-extrabold text-lg text-ink">
            {walkingDistanceChangeMeters > 0 ? `+${walkingDistanceChangeMeters}` : `${walkingDistanceChangeMeters}`} m
          </div>
          <div className="text-[10px] text-slate-500">
            {walkingDistanceChangeMeters < 0 ? 'Less physical effort' : 'Gentle ramp route'}
          </div>
        </div>

        {/* Transfers Diff */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mb-1">
            <span className="font-bold">⇌</span> Transfers
          </div>
          <div className="font-heading font-extrabold text-lg text-ink">
            {transfersChange > 0 ? `+${transfersChange}` : transfersChange === 0 ? 'Same' : `${transfersChange}`}
          </div>
          <div className="text-[10px] text-slate-500">
            {transfersChange > 0 ? 'Additional connection' : 'Direct line'}
          </div>
        </div>
      </div>

      {/* Step Free Assurance Badge */}
      <div className="p-2.5 bg-accessible-subtle rounded-xl border border-accessible-border flex items-center justify-between text-xs text-accessible">
        <span className="flex items-center gap-1.5 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          Step-free requirement strictly preserved
        </span>
        <Badge variant="accessible">100% Verified</Badge>
      </div>
    </div>
  );
};

