import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOperatorStore } from '../stores/operatorStore';
import { DEMO_SCENARIOS } from '../data/demoNetwork';
import { 
  ShieldAlert, 
  RotateCcw, 
  AlertTriangle, 
  Activity, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Radio, 
  BarChart2, 
  Plus, 
  X,
  Server
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authService } from '../services/auth/cognito';

export const OperatorDashboard: React.FC = () => {
  const {
    nodes,
    edges,
    facilities,
    disruptions,
    selectedScenarioId,
    applyScenario,
    resetDemo,
    resolveDisruption,
    createDisruption,
    isSimulating
  } = useOperatorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDisruption, setNewDisruption] = useState({
    entityId: 'elev_a1',
    entityName: 'Elevator A1 (Platform 1-2 & Concourse)',
    stationName: 'Central Station',
    type: 'elevator_outage' as const,
    severity: 'critical' as const,
    reason: 'Routine sensor recalibration and maintenance',
    affectedLinesOrStops: ['Central Station Metro Link'],
    impactOnAccessibility: 'Wheelchair access requires alternate ramp.',
  });

  const currentUser = authService.getCurrentUser();
  const activeDisruptions = disruptions.filter(d => d.isActive);
  const operationalLifts = facilities.filter(f => f.type === 'elevator' && f.operational).length;
  const unavailableLifts = facilities.filter(f => f.type === 'elevator' && !f.operational).length;
  const closedSegments = edges.filter(e => !e.isOperational).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDisruption({
      ...newDisruption,
      effectiveStart: new Date().toISOString(),
      isActive: true,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 bg-operator-bg text-operator-ink min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-operator-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-operator-accent">
              Live Network Disruption Dispatch Console
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Transit Operator Command Centre
          </h1>
          <p className="text-xs text-slate-400">
            Authenticated as: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            <span className="ml-2 px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50 text-[10px]">
              Local Demo Session
            </span>
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <Link to="/operator/network">
            <Button size="sm" variant="outline" className="border-operator-border text-slate-200 bg-operator-surface hover:bg-operator-card text-xs">
              <Server className="w-3.5 h-3.5 mr-1" />
              Infrastructure
            </Button>
          </Link>
          <Link to="/operator/analytics">
            <Button size="sm" variant="outline" className="border-operator-border text-slate-200 bg-operator-surface hover:bg-operator-card text-xs">
              <BarChart2 className="w-3.5 h-3.5 mr-1" />
              Analytics
            </Button>
          </Link>
          <Button
            size="sm"
            variant="operator"
            onClick={() => resetDemo()}
            isLoading={isSimulating}
            className="text-xs gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Top Indicators KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-operator-surface border border-operator-border">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Active Disruptions
          </div>
          <div className={`font-heading font-extrabold text-2xl mt-1 ${activeDisruptions.length > 0 ? 'text-disruption' : 'text-emerald-400'}`}>
            {activeDisruptions.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Real-time alerts</div>
        </div>

        <div className="p-4 rounded-xl bg-operator-surface border border-operator-border">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Operational Lifts
          </div>
          <div className="font-heading font-extrabold text-2xl mt-1 text-emerald-400">
            {operationalLifts}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Telemetry verified</div>
        </div>

        <div className="p-4 rounded-xl bg-operator-surface border border-operator-border">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Unavailable Lifts
          </div>
          <div className={`font-heading font-extrabold text-2xl mt-1 ${unavailableLifts > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
            {unavailableLifts}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Out of service</div>
        </div>

        <div className="p-4 rounded-xl bg-operator-surface border border-operator-border">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Closed Segments
          </div>
          <div className="font-heading font-extrabold text-2xl mt-1 text-slate-200">
            {closedSegments}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Detoured edges</div>
        </div>

        <div className="p-4 rounded-xl bg-operator-surface border border-operator-border">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Accessibility Coverage
          </div>
          <div className="font-heading font-extrabold text-2xl mt-1 text-operator-accent">
            94.2%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Audited transit nodes</div>
        </div>
      </div>

      {/* Hackathon Demo Scenario Presets */}
      <div className="p-5 rounded-xl bg-operator-surface border border-operator-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-operator-accent">
              Judge & Presentation Demonstration Controls
            </span>
            <h2 className="font-heading font-bold text-lg text-white">
              Instant Simulation Scenarios
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            return (
              <div
                key={scenario.id}
                onClick={() => applyScenario(scenario.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-operator-card border-operator-accent ring-2 ring-blue-500/30'
                    : 'bg-operator-bg/60 border-operator-border hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-heading font-bold text-sm text-white">
                    {scenario.name}
                  </span>
                  {isSelected && (
                    <Badge variant="accent" className="bg-blue-900/60 text-blue-200 border-blue-600">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Disruptions Management Panel */}
      <div className="p-5 rounded-xl bg-operator-surface border border-operator-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-disruption" />
            <h2 className="font-heading font-bold text-lg text-white">
              Active Network Disruption Events ({activeDisruptions.length})
            </h2>
          </div>

          <Button
            size="sm"
            variant="operator"
            onClick={() => setIsModalOpen(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Report New Disruption
          </Button>
        </div>

        {activeDisruptions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-operator-bg/50 rounded-lg border border-operator-border">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div>No active disruptions on the network. All elevators and accessible routes are operational.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeDisruptions.map((disruption) => (
              <div
                key={disruption.id}
                className="p-4 rounded-xl bg-operator-card border border-rose-900/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{disruption.entityName}</span>
                    <Badge variant="disruption">{disruption.severity}</Badge>
                    <span className="text-slate-400 text-[11px]">{disruption.stationName}</span>
                  </div>
                  <p className="text-slate-300">{disruption.reason}</p>
                  <p className="text-rose-400 text-[11px] font-medium">Impact: {disruption.impactOnAccessibility}</p>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveDisruption(disruption.id)}
                    className="border-emerald-600/40 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 text-xs"
                  >
                    Resolve & Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-operator-surface rounded-2xl border border-operator-border p-6 space-y-4 text-operator-ink shadow-floating">
            <div className="flex items-center justify-between border-b border-operator-border pb-3">
              <h3 className="font-heading font-bold text-lg text-white">
                Dispatch New Network Disruption
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Affected Facility</label>
                <select
                  value={newDisruption.entityId}
                  onChange={(e) => {
                    const fac = facilities.find(f => f.id === e.target.value);
                    setNewDisruption({
                      ...newDisruption,
                      entityId: e.target.value,
                      entityName: fac ? fac.name : e.target.value,
                      stationName: fac ? fac.stationName : 'Transit Node'
                    });
                  }}
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-white text-xs"
                >
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} &mdash; {fac.stationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Disruption Reason</label>
                <input
                  type="text"
                  value={newDisruption.reason}
                  onChange={(e) => setNewDisruption({ ...newDisruption, reason: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Accessibility Impact Description</label>
                <textarea
                  value={newDisruption.impactOnAccessibility}
                  onChange={(e) => setNewDisruption({ ...newDisruption, impactOnAccessibility: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-white text-xs h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-operator-border">
                <Button size="sm" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  Cancel
                </Button>
                <Button size="sm" variant="danger" type="submit">
                  Dispatch Outage
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

