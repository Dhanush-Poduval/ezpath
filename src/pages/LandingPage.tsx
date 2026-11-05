import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Accessibility, 
  ShieldCheck, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Clock, 
  IndianRupee, 
  Footprints,
  Sparkles,
  RefreshCw,
  Navigation
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shortest' | 'accessible'>('shortest');

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-blue-50/50 via-white to-background border-b border-subtle-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-blue-200 text-xs font-semibold text-accent">
                <Compass className="w-3.5 h-3.5" />
                <span>The shortest route isn&apos;t always the right route.</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.1]">
                Every journey <br />
                <span className="text-accent underline decoration-blue-200 decoration-wavy decoration-2">
                  should be possible.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-xl">
                Find routes designed around your mobility needs, not just the shortest distance. AccessPath verifies elevators, step-free boarding, walking thresholds, and live disruptions so you never get trapped at a flight of stairs.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link to="/plan">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto font-semibold shadow-floating">
                    Plan your journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium">
                    Explore how it works
                  </Button>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accessible" /> Zero Hallucinations
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accessible" /> Live IoT Telemetry
                </span>
                <span className="flex items-center gap-1.5">
                  <Accessibility className="w-4 h-4 text-accessible" /> WCAG 2.2 AA
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual Demonstration (Shortest vs Accessible) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl p-5 border border-subtle-border shadow-floating relative">
                {/* Mode toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-subtle-border">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Live Route Inspection Preview
                  </div>
                  <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
                    <button
                      onClick={() => setActiveTab('shortest')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeTab === 'shortest'
                          ? 'bg-disruption text-white font-semibold'
                          : 'text-slate-600 hover:text-ink'
                      }`}
                    >
                      Naive Shortest Route
                    </button>
                    <button
                      onClick={() => setActiveTab('accessible')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        activeTab === 'accessible'
                          ? 'bg-accessible text-white font-semibold'
                          : 'text-slate-600 hover:text-ink'
                      }`}
                    >
                      AccessPath Verified
                    </button>
                  </div>
                </div>

                {/* Simulated Map Visual */}
                <div className="my-4 h-64 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden flex items-center justify-center p-4">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Background Grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="400" height="200" fill="url(#grid)" />

                    {/* Naive shortest path with stairs */}
                    {activeTab === 'shortest' && (
                      <g>
                        <path
                          d="M 50 140 L 150 100 L 250 80 L 350 40"
                          fill="none"
                          stroke="#C43D43"
                          strokeWidth="4"
                          strokeDasharray="6,4"
                          className="animate-pulse"
                        />
                        {/* Stairs Warning Callout */}
                        <circle cx="150" cy="100" r="10" fill="#FEE2E2" stroke="#C43D43" strokeWidth="2" />
                        <text x="150" y="103" fontSize="10" textAnchor="middle" fill="#C43D43" fontWeight="bold">✕</text>
                        <rect x="90" y="55" width="120" height="28" rx="4" fill="#FFFFFF" stroke="#C43D43" strokeWidth="1" />
                        <text x="150" y="72" fontSize="9" textAnchor="middle" fill="#C43D43" fontWeight="bold">
                          Stairs C1: 24 Steps (Blocked)
                        </text>
                      </g>
                    )}

                    {/* Accessible route via Elevator A1 */}
                    {activeTab === 'accessible' && (
                      <g>
                        <path
                          d="M 50 140 L 70 160 L 220 160 L 320 80 L 350 40"
                          fill="none"
                          stroke="#087F6D"
                          strokeWidth="4"
                        />
                        {/* Elevator A1 Callout */}
                        <circle cx="70" cy="160" r="10" fill="#E6F4F1" stroke="#087F6D" strokeWidth="2" />
                        <text x="70" y="163" fontSize="9" textAnchor="middle" fill="#087F6D" fontWeight="bold">✓</text>
                        <rect x="25" y="115" width="130" height="28" rx="4" fill="#FFFFFF" stroke="#087F6D" strokeWidth="1" />
                        <text x="90" y="132" fontSize="9" textAnchor="middle" fill="#087F6D" fontWeight="bold">
                          Elevator A1: Operational
                        </text>
                      </g>
                    )}

                    {/* Origin Marker */}
                    <circle cx="50" cy="140" r="8" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="50" y="125" fontSize="10" textAnchor="middle" fill="#14243A" fontWeight="bold">Central Station</text>

                    {/* Destination Marker */}
                    <circle cx="350" cy="40" r="8" fill="#087F6D" stroke="#FFFFFF" strokeWidth="2" />
                    <text x="350" y="25" fontSize="10" textAnchor="middle" fill="#14243A" fontWeight="bold">Riverside Campus</text>
                  </svg>
                </div>

                {/* Outcome card */}
                {activeTab === 'shortest' ? (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-ink space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-disruption">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Standard Shortest Engine: FAILS Accessibility</span>
                    </div>
                    <p className="text-slate-600">
                      Standard GPS engines route via East concourse stairs because it is 120m shorter. A wheelchair traveller arrives only to encounter an impossible 24-step staircase with no lift.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-ink space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-accessible">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>AccessPath: 100% Step-free & Feasible</span>
                    </div>
                    <p className="text-slate-600">
                      Routes via Elevator A1 and low-floor Metro Blue Line. Fully compliant with &lt; 600m walking and ₹50 budget constraints.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section: "Why shortest isn't always best" */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="accent">Transparent Decision Engine</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink">
            How AccessPath Evaluates Route Feasibility
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Other apps treat accessibility as a tag or a colour. AccessPath treats accessibility as hard mathematical constraints across a multimodal graph.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Hard Physical Constraints
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a wheelchair user requires step-free transit, paths with stairs are physically pruned from graph traversal. We never silently relax requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-accessible flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Live Hardware Telemetry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every elevator and ramp status is backed by sensor timestamps and municipal audits. When a lift fails, affected journeys are flagged immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-heading font-bold text-lg text-ink">
                Instant Dynamic Replanning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An outage triggers an automated re-route under the exact same constraints. You see the transparent tradeoff diff in time, fare, and walking.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Big CTA Card */}
        <div className="bg-gradient-to-r from-ink to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-floating">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
              Ready to experience confident navigation?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Try our interactive journey planner and see how live disruptions dynamically replan your route without compromise.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link to="/plan">
              <Button size="lg" variant="primary" className="font-bold">
                Launch Journey Planner
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

