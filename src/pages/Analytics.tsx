import React from 'react';
import { Link } from 'react-router-dom';
import { useOperatorStore } from '../stores/operatorStore';
import { AccessibilityCharts } from '../components/analytics/AccessibilityCharts';
import { ArrowLeft, BarChart2, ShieldCheck, Database } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { facilities, edges, disruptions } = useOperatorStore();

  const operationalLifts = facilities.filter(f => f.type === 'elevator' && f.operational).length;
  const disruptedLifts = facilities.filter(f => f.type === 'elevator' && !f.operational).length;
  const stepFreeEdges = edges.filter(e => e.stepFree).length;
  const stairsEdges = edges.filter(e => e.hasStairs).length;

  return (
    <div className="product-page space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/operator" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-ink">
          <ArrowLeft className="w-4 h-4" />
          Back to overview
        </Link>
      </div>

      <div data-reveal>
        <div className="text-xs font-semibold text-accent uppercase tracking-wider">
          Network analytics
        </div>
        <h1 className="product-title">
          Accessibility insights
        </h1>
        <p className="product-description">
          Grounded data metrics derived directly from physical municipal station audits, IoT sensor health, and route constraints.
        </p>
      </div>

      <AccessibilityCharts
        operationalLifts={operationalLifts}
        disruptedLifts={disruptedLifts}
        stepFreeEdges={stepFreeEdges}
        stairsEdges={stairsEdges}
      />
    </div>
  );
};

