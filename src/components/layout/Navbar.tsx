import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Bookmark, ShieldAlert, RotateCcw, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useOperatorStore } from '../../stores/operatorStore';
import { useJourneyStore } from '../../stores/journeyStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { disruptions, resetDemo, triggerElevatorFailure, isSimulating } = useOperatorStore();
  const { searchJourneys } = useJourneyStore();

  const isOperatorRoute = location.pathname.startsWith('/operator');
  const hasActiveDisruption = disruptions.some(d => d.isActive);

  const handleReset = async () => {
    await resetDemo();
    await searchJourneys();
  };

  const handleTriggerDemo = async () => {
    await triggerElevatorFailure();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-subtle-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-ink">
                Access<span className="text-accent">Path</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] text-ink-muted ml-2 font-medium border-l border-slate-200 pl-2">
                Accessibility-First Multimodal Transit
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-ink-secondary">
          <Link
            to="/plan"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/plan' ? 'text-accent bg-accent-subtle font-semibold' : 'hover:text-ink hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            Journey Planner
          </Link>
          <Link
            to="/saved"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              location.pathname === '/saved' ? 'text-accent bg-accent-subtle font-semibold' : 'hover:text-ink hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Journeys
          </Link>
          <Link
            to="/operator"
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              isOperatorRoute ? 'text-blue-600 bg-blue-50 font-semibold' : 'hover:text-ink hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Operator Console
          </Link>
        </nav>

        {/* Demo Controls Bar */}
        <div className="flex items-center gap-2">
          {hasActiveDisruption ? (
            <Badge variant="disruption" className="hidden lg:flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              Elevator A1 Outage Active
            </Badge>
          ) : (
            <Badge variant="accessible" className="hidden lg:flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Network 100% Operational
            </Badge>
          )}

          {/* Hackathon Quick Action Button */}
          {!hasActiveDisruption ? (
            <Button
              size="sm"
              variant="danger"
              onClick={handleTriggerDemo}
              isLoading={isSimulating}
              title="Simulates an elevator failure at Central Station to test dynamic rerouting"
              className="text-xs font-semibold"
            >
              Simulate Outage
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              isLoading={isSimulating}
              className="text-xs gap-1 border-slate-300 text-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

