import React from 'react';
import { FacilityStatus } from '../../types';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Power,
  Clock,
  Database
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface FacilityStatusTableProps {
  facilities: FacilityStatus[];
  onToggleFacility: (facilityId: string) => void;
  isLoading?: boolean;
}

export const FacilityStatusTable: React.FC<FacilityStatusTableProps> = ({
  facilities,
  onToggleFacility,
  isLoading
}) => {
  return (
    <div data-reveal className="overflow-x-auto rounded-xl border border-subtle-border bg-white">
      <table className="min-w-[760px] w-full text-left text-xs border-collapse">
        <thead className="bg-slate-50 border-b border-subtle-border text-slate-500 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="py-3 px-4">Facility / Hardware</th>
            <th className="py-3 px-4">Station Location</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Telemetry Verification</th>
            <th className="py-3 px-4 text-right">Operator Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle-border text-ink">
          {facilities.map((fac) => {
            return (
              <tr key={fac.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-bold">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{fac.name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {fac.stationName}
                </td>
                <td className="py-3.5 px-4 capitalize font-medium text-slate-500">
                  {fac.type}
                </td>
                <td className="py-3.5 px-4">
                  {fac.operational ? (
                    <Badge variant="accessible" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Operational
                    </Badge>
                  ) : (
                    <Badge variant="disruption" className="gap-1 animate-pulse">
                      <XCircle className="w-3 h-3" /> Unavailable
                    </Badge>
                  )}
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{fac.verifiedBy}</span>
                    <span className="text-[10px] text-slate-400">{fac.lastUpdated}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    size="sm"
                    variant={fac.operational ? 'danger' : 'secondary'}
                    onClick={() => onToggleFacility(fac.id)}
                    disabled={isLoading}
                    className="text-xs h-7 px-2.5"
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {fac.operational ? 'Mark Outage' : 'Restore'}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

