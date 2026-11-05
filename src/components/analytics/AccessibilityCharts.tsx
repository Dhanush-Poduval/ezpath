import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Card, CardHeader, CardContent } from '../ui/Card';

interface AccessibilityChartsProps {
  operationalLifts: number;
  disruptedLifts: number;
  stepFreeEdges: number;
  stairsEdges: number;
}

export const AccessibilityCharts: React.FC<AccessibilityChartsProps> = ({
  operationalLifts,
  disruptedLifts,
  stepFreeEdges,
  stairsEdges,
}) => {
  const liftData = [
    { name: 'Operational', value: operationalLifts, color: '#087F6D' },
    { name: 'Unavailable', value: disruptedLifts, color: '#C43D43' },
  ];

  const edgeData = [
    { category: 'Step-Free Ramps & Corridors', count: stepFreeEdges, fill: '#087F6D' },
    { category: 'Stairs & Steep Levels', count: stairsEdges, fill: '#C43D43' },
    { category: 'Low-Floor Transit Legs', count: 6, fill: '#2563EB' },
  ];

  const evidenceData = [
    { name: 'IoT Telemetry', count: 65 },
    { name: 'Municipal Audits', count: 25 },
    { name: 'Station Surveys', count: 10 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Lift Operational Health */}
      <Card>
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Station Hardware
          </div>
          <h3 className="font-heading font-bold text-base text-ink">
            Elevator Operational Health
          </h3>
        </CardHeader>
        <CardContent className="h-64 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={liftData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {liftData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Network Segment Accessibility */}
      <Card>
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Physical Infrastructure
          </div>
          <h3 className="font-heading font-bold text-base text-ink">
            Pathway Accessibility Distribution
          </h3>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={edgeData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {edgeData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Telemetry Evidence Freshness */}
      <Card>
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Data Integrity
          </div>
          <h3 className="font-heading font-bold text-base text-ink">
            Audit & Sensor Coverage (%)
          </h3>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evidenceData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

