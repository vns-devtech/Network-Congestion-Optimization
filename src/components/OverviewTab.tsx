import React from 'react';
import {
  Users,
  Activity,
  Gauge,
  Clock,
  AlertTriangle,
  ArrowRight,
  Wifi,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Signal,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { CellMetrics, CongestionStatus, OptimizationRecommendation } from '../types/network';

interface OverviewTabProps {
  cellA: CellMetrics;
  cellB: CellMetrics;
  recommendation: OptimizationRecommendation;
  onNavigateToTab: (tab: string) => void;
  onOptimize: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  cellA,
  cellB,
  recommendation,
  onNavigateToTab,
  onOptimize
}) => {
  const totalUsers = cellA.users + cellB.users;
  const avgLoad = Math.round(((cellA.load + cellB.load) / 2) * 10) / 10;
  const avgThroughput = Math.round(((cellA.throughput + cellB.throughput) / 2) * 10) / 10;
  const avgLatency = Math.round(((cellA.latency + cellB.latency) / 2) * 10) / 10;
  const avgPacketLoss = Math.round(((cellA.packetLoss + cellB.packetLoss) / 2) * 100) / 100;

  const renderStatusBadge = (status: CongestionStatus) => {
    switch (status) {
      case 'Severe':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertOctagon className="w-3.5 h-3.5" /> 🔴 Severe
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> 🟠 High
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <Activity className="w-3.5 h-3.5" /> 🟡 Moderate
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> 🟢 Normal
          </span>
        );
    }
  };

  const getLoadBarColor = (val: number) => {
    if (val >= 80) return 'bg-red-500';
    if (val >= 60) return 'bg-amber-500';
    if (val >= 35) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Alert / Critical Finding Banner */}
      {recommendation.needsOptimization && (
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 border border-red-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  CRITICAL RESEARCH PHENOMENON DETECTED
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 rounded">
                  Capacity Overload != Poor Signal
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Cell A exhibits <strong className="text-emerald-400">strong signal (-53 dBm)</strong> but suffers from{' '}
                <strong className="text-red-400">severe congestion (84% load, 148 ms latency)</strong> caused by 6 competing users.
                Cell B has <strong className="text-cyan-400">79% idle capacity</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onOptimize}
            className="shrink-0 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-semibold text-xs rounded-lg shadow-md transition"
          >
            <span>Auto-Steer 2 Users</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Total Active Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalUsers}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex justify-between font-mono">
            <span>Cell A: {cellA.users}</span>
            <span className="text-slate-600">|</span>
            <span>Cell B: {cellB.users}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Mean Network Load</span>
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{avgLoad}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${getLoadBarColor(avgLoad)}`}
              style={{ width: `${Math.min(100, avgLoad)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Avg Throughput</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {avgThroughput} <span className="text-xs font-normal text-slate-400">Mbps</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Aggregate: {(cellA.throughput + cellB.throughput).toFixed(1)} Mbps
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Avg Round-Trip RTT</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {avgLatency} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Min: 22ms • Max: 155ms
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Packet Loss Ratio</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{avgPacketLoss}%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {avgPacketLoss > 2.5 ? (
              <span className="text-red-400">Elevated Retry Drops</span>
            ) : (
              <span className="text-emerald-400">Acceptable Retries</span>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Cell Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cell A Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">{cellA.name}</h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    SSID: {cellA.ssid}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Role: Potentially congested node • Ch {cellA.channel} (2.4 GHz)
                </p>
              </div>
            </div>
            {renderStatusBadge(cellA.congestionStatus)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Connected Users</span>
              <div className="text-lg font-bold text-white font-mono">{cellA.users} devices</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Channel Load</span>
              <div className="text-lg font-bold text-red-400 font-mono">{cellA.load}%</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Throughput</span>
              <div className="text-lg font-bold text-white font-mono">{cellA.throughput} Mbps</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Ping RTT</span>
              <div className="text-lg font-bold text-amber-400 font-mono">{cellA.latency} ms</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Packet Loss</span>
              <div className="text-lg font-bold text-red-400 font-mono">{cellA.packetLoss}%</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Signal (RSSI)</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellA.signalStrength} dBm</div>
            </div>
          </div>

          {/* Diagnosis Preview */}
          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-red-300">Congestion Score: {cellA.congestionScore}/100</span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Signal className="w-3 h-3" /> Signal Quality: GOOD (-53 dBm)
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {cellA.diagnosis.explanation}
            </p>
          </div>
        </div>

        {/* Cell B Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">{cellB.name}</h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    SSID: {cellB.ssid}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Role: Underutilized / available node • Ch {cellB.channel} (5 GHz)
                </p>
              </div>
            </div>
            {renderStatusBadge(cellB.congestionStatus)}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Connected Users</span>
              <div className="text-lg font-bold text-white font-mono">{cellB.users} devices</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Channel Load</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellB.load}%</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Throughput</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellB.throughput} Mbps</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Ping RTT</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellB.latency} ms</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Packet Loss</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellB.packetLoss}%</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-400">Signal (RSSI)</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{cellB.signalStrength} dBm</div>
            </div>
          </div>

          {/* Diagnosis Preview */}
          <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-emerald-300">Congestion Score: {cellB.congestionScore}/100</span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Spare Capacity: {(100 - cellB.load).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">
              {cellB.diagnosis.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigateToTab('diagnosis')}
          className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 cursor-pointer transition shadow-sm"
        >
          <div className="text-cyan-400 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>RESEARCH PROBLEM</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Coverage vs Capacity Matrix</h4>
          <p className="text-xs text-slate-400">
            Inspect why RSSI cannot be trusted alone and evaluate the mathematical 5-parameter scoring model.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('ml')}
          className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 cursor-pointer transition shadow-sm"
        >
          <div className="text-cyan-400 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>MACHINE LEARNING</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Random Forest Prediction</h4>
          <p className="text-xs text-slate-400">
            View actual trained classification matrix, feature importances, and upcoming congestion risk forecasting.
          </p>
        </div>

        <div
          onClick={() => onNavigateToTab('experiments')}
          className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 cursor-pointer transition shadow-sm"
        >
          <div className="text-cyan-400 text-xs font-semibold mb-1 flex items-center justify-between">
            <span>PBL EVALUATION</span>
            <ArrowRight className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Run 6 Controlled Experiments</h4>
          <p className="text-xs text-slate-400">
            Execute standard testbed scenarios from Baseline to Load Balancing with real Before vs After metrics.
          </p>
        </div>
      </div>
    </div>
  );
};
