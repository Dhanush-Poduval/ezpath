import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourneyStore, getStationName } from '../stores/journeyStore';
import { SearchControls } from '../components/journey/SearchControls';
import { RouteCard } from '../components/journey/RouteCard';
import { InteractiveMap } from '../components/maps/InteractiveMap';
import { DisruptionBanner } from '../components/disruptions/DisruptionBanner';
import { WhatChangedDiff } from '../components/journey/WhatChangedDiff';
import { ConstraintInspector } from '../components/accessibility/ConstraintInspector';
import { RouteComparison } from '../components/journey/RouteComparison';
import { saveJourney } from '../services/offline/idbStorage';
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen, 
  Scale, 
  Bookmark, 
  Check, 
  Compass, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const JourneyPlanner: React.FC = () => {
  const navigate = useNavigate();
  const {
    originId,
    destinationId,
    routes,
    selectedRouteId,
    setSelectedRouteId,
    searchJourneys,
    isLoading,
    error,
    isConstraintInspectorOpen,
    setConstraintInspectorOpen,
    isComparisonModalOpen,
    setComparisonModalOpen,
  } = useJourneyStore();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [savedRouteId, setSavedRouteId] = useState<string | null>(null);

  // Automatically perform initial search on mount
  useEffect(() => {
    if (routes.length === 0) {
      searchJourneys();
    }
  }, []);

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0] || null;

  const handleSaveCurrentJourney = async () => {
    if (!selectedRoute) return;
    try {
      await saveJourney(
        selectedRoute, 
        getStationName(originId), 
        getStationName(destinationId)
      );
      setSavedRouteId(selectedRoute.id);
      setTimeout(() => setSavedRouteId(null), 3000);
    } catch {
      // IndexedDB save handling
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative">
      {/* Three-Region Desktop Workspace Container */}
      <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden relative">

        {/* 1. LEFT PANEL — Journey Controls (340-380px, collapsible) */}
        <aside 
          aria-label="Journey Planning Controls"
          className={`bg-white border-r border-subtle-border flex flex-col z-20 transition-all duration-300 ${
            leftOpen ? 'w-full lg:w-[360px]' : 'w-0 hidden lg:flex overflow-hidden'
          }`}
        >
          {/* Top Panel Bar */}
          <div className="p-3.5 border-b border-subtle-border flex items-center justify-between bg-slate-50/50">
            <span className="font-heading font-bold text-sm text-ink flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent" />
              Journey Requirements
            </span>
            <button
              onClick={() => setLeftOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100 hidden lg:block"
              aria-label="Collapse search panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto">
            <SearchControls />
          </div>
        </aside>

        {/* Toggle button when Left Panel is collapsed */}
        {!leftOpen && (
          <button
            onClick={() => setLeftOpen(true)}
            aria-label="Expand journey controls"
            className="hidden lg:flex absolute top-4 left-4 z-30 p-2 bg-white rounded-lg border border-subtle-border shadow-floating text-ink hover:text-accent"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* 2. CENTRE — Interactive Map Workspace (Largest available area) */}
        <div className="flex-1 h-full relative overflow-hidden flex flex-col">
          <InteractiveMap
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            className="w-full h-full"
          />
        </div>

        {/* Toggle button when Right Panel is collapsed */}
        {!rightOpen && (
          <button
            onClick={() => setRightOpen(true)}
            aria-label="Expand results panel"
            className="hidden lg:flex absolute top-4 right-4 z-30 p-2 bg-white rounded-lg border border-subtle-border shadow-floating text-ink hover:text-accent"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}

        {/* 3. RIGHT PANEL — Results & Disruptions (360-400px, collapsible) */}
        <aside
          aria-label="Route Results and Inspection"
          className={`bg-white border-l border-subtle-border flex flex-col z-20 transition-all duration-300 ${
            rightOpen ? 'w-full lg:w-[380px]' : 'w-0 hidden lg:flex overflow-hidden'
          }`}
        >
          {/* Top Panel Bar */}
          <div className="p-3.5 border-b border-subtle-border flex items-center justify-between bg-slate-50/50">
            <span className="font-heading font-bold text-sm text-ink">
              Route Alternatives ({routes.length})
            </span>

            <div className="flex items-center gap-1.5">
              {routes.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setComparisonModalOpen(true)}
                  className="h-7 text-xs px-2 gap-1 border-slate-300"
                  title="Compare route tradeoffs"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Compare
                </Button>
              )}

              <button
                onClick={() => setRightOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-ink hover:bg-slate-100 hidden lg:block"
                aria-label="Collapse results panel"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Live Disruption Alert Banner */}
            <DisruptionBanner />

            {/* Dynamic Rerouting Diff Hero */}
            <WhatChangedDiff />

            {/* Loading state */}
            {isLoading && (
              <div className="space-y-3 py-6 text-center">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-2" />
                <div className="text-xs font-semibold text-ink">Evaluating Multimodal Network...</div>
                <div className="text-[11px] text-slate-500">Checking elevator telemetry and step-free constraints</div>
              </div>
            )}

            {/* Error / Infeasible state */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-ink space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-disruption">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>No Feasible Accessible Route</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Route Cards List */}
            {!isLoading && routes.length > 0 && (
              <div className="space-y-3">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={route.id === selectedRouteId}
                    onSelect={() => setSelectedRouteId(route.id)}
                    onOpenInspector={() => setConstraintInspectorOpen(true)}
                    onViewDetails={() => navigate(`/journey/${route.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Selected Route Actions (Save offline / Detailed navigation) */}
            {selectedRoute && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="text-xs font-semibold text-slate-600">
                  Selected Route Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveCurrentJourney}
                    className="w-full text-xs font-medium bg-white"
                  >
                    {savedRouteId === selectedRoute.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-accessible" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 mr-1 text-accent" />
                        Save Offline
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => navigate(`/journey/${selectedRoute.id}`)}
                    className="w-full text-xs font-semibold"
                  >
                    Start Itinerary
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Signature Feature: Constraint Inspector Modal */}
      <ConstraintInspector
        route={selectedRoute}
        isOpen={isConstraintInspectorOpen}
        onClose={() => setConstraintInspectorOpen(false)}
      />

      {/* Route Tradeoff Comparison Modal */}
      <RouteComparison
        routes={routes}
        isOpen={isComparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        onSelectRoute={(id) => setSelectedRouteId(id)}
        selectedRouteId={selectedRouteId}
      />
    </div>
  );
};

