import React from 'react';
import { Link } from 'react-router-dom';
import { useOperatorStore } from '../stores/operatorStore';
import { FacilityStatusTable } from '../components/analytics/FacilityStatusTable';
import { ArrowLeft, Server, Activity, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NetworkStatus: React.FC = () => {
  const { facilities, triggerElevatorFailure, resolveDisruption, disruptions, isSimulating } = useOperatorStore();

  const handleToggleFacility = async (facilityId: string) => {
    const isDisrupted = disruptions.some(d => d.isActive && d.entityId === facilityId);
    if (isDisrupted) {
      const target = disruptions.find(d => d.isActive && d.entityId === facilityId);
      if (target) await resolveDisruption(target.id);
    } else {
      await triggerElevatorFailure(facilityId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/operator" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-ink">
          <ArrowLeft className="w-4 h-4" />
          Back to Command Centre
        </Link>
      </div>

      <div>
        <div className="text-xs font-semibold text-accent uppercase tracking-wider">
          Physical Transit Infrastructure
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">
          Network Facility Telemetry Status
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time IoT operational telemetry for all elevators, wheelchair ramps, and stairs across the multimodal corridor.
        </p>
      </div>

      <FacilityStatusTable
        facilities={facilities}
        onToggleFacility={handleToggleFacility}
        isLoading={isSimulating}
      />
    </div>
  );
};

