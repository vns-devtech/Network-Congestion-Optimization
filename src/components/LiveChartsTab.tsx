import React, { useState } from 'react';
import { MetricDataPoint } from '../types/network';
import { BarChart3, Filter, Activity, Gauge, Clock, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface LiveChartsTabProps {
  history: MetricDataPoint[];
}

export const LiveChartsTab: React.FC<LiveChartsTabProps> = ({ history }) => {
  const [cellFilter, setCellFilter] = useState<'both' | 'cell_a' | 'cell_b'>('both');

  // Helper to render responsive clean SVG multi-line charts
  const renderSvgLineChart = (
    title: string,
    unit: string,
    keyA: keyof MetricDataPoint,
    keyB: keyof MetricDataPoint,
    colorA: string,
    colorB: string,
    maxValSuggested: number
  ) => {
    const points = history.slice(-25); // show last 25 samples
    if (points.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500 font-mono">
          Accumulating telemetric streaming data...
        </div>
      );
    }

    const valuesA = points.map((p) => Number(p[keyA]));
    const valuesB = points.map((p) => Number(p[keyB]));

    const computedMax = Math.max(
      maxValSuggested,
      ...valuesA,
      ...valuesB
    );

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 25;

    const getX = (index: number) => paddingX + (index / (points.length - 1)) * (width - 2 * paddingX);
    const getY = (val: number) => height - paddingY - (val / Math.max(1, computedMax)) * (height - 2 * paddingY);

    const pathA = valuesA.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');
    const pathB = valuesB.map((val, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(val)}`).join(' ');

    const currentA = valuesA[valuesA.length - 1];
    const currentB = valuesB[valuesB.length - 1];

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
            <span className="text-[10px] text-slate-400 font-mono">({unit})</span>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            {(cellFilter === 'both' || cellFilter === 'cell_a') && (
              <span className="flex items-center gap-1.5" style={{ color: colorA }}>
                <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: colorA }}></span>
                Cell A: {currentA} {unit}
              </span>
            )}
            {(cellFilter === 'both' || cellFilter === 'cell_b') && (
              <span className="flex items-center gap-1.5" style={{ color: colorB }}>
                <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: colorB }}></span>
                Cell B: {currentB} {unit}
              </span>
            )}
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const y = height - paddingY - ratio * (height - 2 * paddingY);
            const valLabel = Math.round(ratio * computedMax * 10) / 10;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text x={paddingX - 6} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" fontFamily="monospace">
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* Lines */}
          {(cellFilter === 'both' || cellFilter === 'cell_a') && (
            <path d={pathA} fill="none" stroke={colorA} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {(cellFilter === 'both' || cellFilter === 'cell_b') && (
            <path d={pathB} fill="none" stroke={colorB} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Dots on latest point */}
          {(cellFilter === 'both' || cellFilter === 'cell_a') && (
            <circle cx={getX(points.length - 1)} cy={getY(currentA)} r="4" fill={colorA} />
          )}
          {(cellFilter === 'both' || cellFilter === 'cell_b') && (
            <circle cx={getX(points.length - 1)} cy={getY(currentB)} r="4" fill={colorB} />
          )}
        </svg>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 px-2">
          <span>{points[0]?.timestamp || ''}</span>
          <span>Time Series Window (Latest {points.length} samples)</span>
          <span>{points[points.length - 1]?.timestamp || ''}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Live Network Performance Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming multi-KPI measurement charts updated every collection cycle.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <button
            onClick={() => setCellFilter('both')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              cellFilter === 'both' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Both Cells
          </button>
          <button
            onClick={() => setCellFilter('cell_a')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              cellFilter === 'cell_a' ? 'bg-red-500 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cell A (SmartNet_A)
          </button>
          <button
            onClick={() => setCellFilter('cell_b')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              cellFilter === 'cell_b' ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cell B (SmartNet_B)
          </button>
        </div>
      </div>

      {/* Grid of 4 Core Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Load Chart */}
        {renderSvgLineChart(
          'Network Airtime Load vs Time',
          '%',
          'cellALoad',
          'cellBLoad',
          '#ef4444',
          '#10b981',
          100
        )}

        {/* Throughput Chart */}
        {renderSvgLineChart(
          'Effective Throughput vs Time',
          'Mbps',
          'cellAThroughput',
          'cellBThroughput',
          '#f87171',
          '#34d399',
          50
        )}

        {/* Latency Chart */}
        {renderSvgLineChart(
          'ICMP Round-Trip Latency vs Time',
          'ms',
          'cellALatency',
          'cellBLatency',
          '#fb923c',
          '#06b6d4',
          160
        )}

        {/* Packet Loss Chart */}
        {renderSvgLineChart(
          'Packet Loss Ratio vs Time',
          '%',
          'cellAPacketLoss',
          'cellBPacketLoss',
          '#dc2626',
          '#3b82f6',
          8
        )}
      </div>

      {/* Connected Users Bar Representation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Connected User Balance</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Cell A: {history[history.length - 1]?.cellAUsers || 0} • Cell B: {history[history.length - 1]?.cellBUsers || 0}
          </span>
        </div>

        <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
          <div
            className="bg-red-500 h-full flex items-center justify-center text-[11px] font-bold text-white font-mono transition-all duration-500"
            style={{
              width: `${
                ((history[history.length - 1]?.cellAUsers || 1) /
                  Math.max(1, (history[history.length - 1]?.cellAUsers || 1) + (history[history.length - 1]?.cellBUsers || 1))) *
                100
              }%`
            }}
          >
            Cell A: {history[history.length - 1]?.cellAUsers || 0}
          </div>
          <div
            className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-bold text-slate-950 font-mono transition-all duration-500"
            style={{
              width: `${
                ((history[history.length - 1]?.cellBUsers || 1) /
                  Math.max(1, (history[history.length - 1]?.cellAUsers || 1) + (history[history.length - 1]?.cellBUsers || 1))) *
                100
              }%`
            }}
          >
            Cell B: {history[history.length - 1]?.cellBUsers || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
