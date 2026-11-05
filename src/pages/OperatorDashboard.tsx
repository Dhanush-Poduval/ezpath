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

  const metrics = [
    { label: 'Active disruptions', value: activeDisruptions.length, detail: 'Requiring attention', alert: activeDisruptions.length > 0 },
    { label: 'Operational lifts', value: operationalLifts, detail: 'Available across the network', alert: false },
    { label: 'Unavailable lifts', value: unavailableLifts, detail: 'Awaiting restoration', alert: unavailableLifts > 0 },
    { label: 'Closed segments', value: closedSegments, detail: 'Alternative route required', alert: closedSegments > 0 },
    { label: 'Accessibility coverage', value: '94.2%', detail: 'Demo audit coverage', alert: false },
  ];

  return (
    <div className="product-page operator-page">
      <div data-reveal className="operator-heading">
        <div><h1 className="product-title">A clearer view of your network.</h1>
          <p className="product-description">Monitor access. Manage disruptions. Keep every journey moving.</p>
          <div className="operator-session"><span className="status-dot" /> {currentUser.name}<span className="session-divider" /><span>Demo workspace</span></div>
        </div>
        <nav className="operator-actions" aria-label="Operator tools">
          <Link to="/operator/network" className="workspace-link"><Server size={15} /> Infrastructure</Link>
          <Link to="/operator/analytics" className="workspace-link"><BarChart2 size={15} /> Analytics</Link>
          <Button size="sm" variant="outline" onClick={() => resetDemo()} isLoading={isSimulating}><RotateCcw size={14} /> Reset demo</Button>
        </nav>
      </div>
      <div data-reveal className="operator-metrics">
        {metrics.map(metric => <div key={metric.label} className="operator-metric"><span>{metric.label}</span><strong className={metric.alert ? 'text-disruption' : ''}>{metric.value}</strong><small>{metric.detail}</small></div>)}
      </div>
      {/* Hackathon Demo Scenario Presets */}
      <div data-reveal className="workspace-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>

            <h2 className="font-heading font-medium text-xl text-ink">
              Explore a network scenario
            </h2>
            <p className="product-description">Test how the planner responds when access changes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            return (
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={isSimulating}
                key={scenario.id}
                onClick={() => applyScenario(scenario.id)}
                className={`scenario-option ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <span className="font-heading font-medium text-base text-ink">
                    {scenario.name.replace(/^Scenario \d+: /, '').replace(' (Hero Hackathon Demo)', '')}
                  </span>
                  {isSelected && (
                    <Badge variant="accent" className="bg-accent text-white border-transparent">Active</Badge>
                  )}
                </div>
                <span className="block text-sm text-ink-secondary leading-relaxed">
                  {scenario.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Disruptions Management Panel */}
      <div data-reveal className="workspace-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-disruption" />
            <h2 className="font-heading font-bold text-lg text-ink">
              Network disruptions <span className="text-ink-muted">({activeDisruptions.length})</span>
            </h2>
          </div>

          <Button
            size="sm"
            variant="operator"
            onClick={() => setIsModalOpen(true)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Report disruption
          </Button>
        </div>

        {activeDisruptions.length === 0 ? (
          <div className="network-empty">
            <CheckCircle2 className="w-8 h-8 text-accessible mx-auto mb-2" />
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-ink">{disruption.entityName}</span>
                    <Badge variant="disruption">{disruption.severity}</Badge>
                    <span className="text-ink-muted text-[11px]">{disruption.stationName}</span>
                  </div>
                  <p className="text-ink-secondary">{disruption.reason}</p>
                  <p className="text-disruption text-[11px] font-medium">Impact: {disruption.impactOnAccessibility}</p>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveDisruption(disruption.id)}
                    className="border-emerald-600/40 text-accessible bg-accessible-subtle hover:bg-accessible-subtle text-xs"
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
          <div role="dialog" aria-modal="true" aria-labelledby="report-heading" className="w-full max-w-lg bg-operator-surface rounded-2xl border border-operator-border p-6 space-y-4 text-operator-ink shadow-floating">
            <div className="flex items-center justify-between border-b border-operator-border pb-3">
              <h3 id="report-heading" className="font-heading font-bold text-lg text-ink">
                Dispatch New Network Disruption
              </h3>
              <button aria-label="Close disruption report" onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-ink-muted mb-1">Affected Facility</label>
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
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-ink text-xs"
                >
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} &mdash; {fac.stationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-muted mb-1">Disruption Reason</label>
                <input
                  type="text"
                  value={newDisruption.reason}
                  onChange={(e) => setNewDisruption({ ...newDisruption, reason: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-ink text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-muted mb-1">Accessibility Impact Description</label>
                <textarea
                  value={newDisruption.impactOnAccessibility}
                  onChange={(e) => setNewDisruption({ ...newDisruption, impactOnAccessibility: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-operator-bg border border-operator-border text-ink text-xs h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-operator-border">
                <Button type="button" size="sm" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink">
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

