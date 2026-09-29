import React from 'react';
import {
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  History,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CellMetrics, OptimizationRecommendation, BeforeAfterComparison } from '../types/network';

interface OptimizationTabProps {
  cellA: CellMetrics;
  cellB: CellMetrics;
  recommendation: OptimizationRecommendation;
  beforeAfterList: BeforeAfterComparison[];
  onOptimize: () => void;
  onReset: () => void;
}

export const OptimizationTab: React.FC<OptimizationTabProps> = ({
  cellA,
  cellB,
  recommendation,
  beforeAfterList,
  onOptimize,
  onReset
}) => {
  const latestBeforeAfter = beforeAfterList[0];

  return (
    <div className="space-y-6">
      {/* Optimization Recommendation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4 fill-current" />
              <span>Closed-Loop Traffic Steering Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Network Optimization & Load Balancing Decision
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {recommendation.recommendationText}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOptimize}
              disabled={!recommendation.needsOptimization}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition ${
                recommendation.needsOptimization
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>APPLY TRAFFIC STEERING</span>
            </button>
            <button
              onClick={onReset}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition"
              title="Reset Testbed State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4-Step Decision Flow Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-mono font-bold">STEP 1: STATE</span>
            <div className="text-xs font-bold text-white mt-1">Imbalance Detected</div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Cell A: {cellA.load}% ({cellA.users} STAs)
              <br />
              Cell B: {cellB.load}% ({cellB.users} STAs)
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 font-mono font-bold">STEP 2: BOTTLENECK</span>
            <div className="text-xs font-bold text-white mt-1">Airtime Contention</div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Cell A ping latency {cellA.latency} ms with {cellA.packetLoss}% packet loss.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 font-mono font-bold">STEP 3: RECOMMEND</span>
            <div className="text-xs font-bold text-white mt-1">Dynamic Rebalance</div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Migrate {recommendation.suggestedMigrationCount} heavy device(s) to Cell B.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-violet-400 font-mono font-bold">STEP 4: PROJECTION</span>
            <div className="text-xs font-bold text-white mt-1">Expected Recovery</div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              ~55% latency drop, 3x throughput gain, 0% drop rate.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 30: BEFORE VS AFTER ANALYSIS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Section 30: Before vs. After Optimization Evaluation
            </h3>
          </div>
          {latestBeforeAfter && (
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Executed at {latestBeforeAfter.timestamp}
            </span>
          )}
        </div>

        {latestBeforeAfter ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs font-mono text-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>Action Executed: </strong>
                Migrated {latestBeforeAfter.migratedDevices.join(', ')} from{' '}
                <span className="text-red-400 font-bold uppercase">{latestBeforeAfter.sourceCell}</span> to{' '}
                <span className="text-emerald-400 font-bold uppercase">{latestBeforeAfter.targetCell}</span>
              </span>
              <span className="text-emerald-400 font-bold">STATUS: COMPLETED & VERIFIED</span>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3 text-left">Network KPI Metric</th>
                    <th className="p-3 text-right">Before Optimization</th>
                    <th className="p-3 text-right">After Optimization</th>
                    <th className="p-3 text-right">Empirical Improvement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="p-3 text-slate-200 font-medium">Serving Cell Users</td>
                    <td className="p-3 text-right text-slate-300">{latestBeforeAfter.metrics.users.before} STAs</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{latestBeforeAfter.metrics.users.after} STAs</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      {latestBeforeAfter.metrics.users.change} (Balanced)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-200 font-medium">Channel Airtime Load</td>
                    <td className="p-3 text-right text-red-400">{latestBeforeAfter.metrics.load.before}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{latestBeforeAfter.metrics.load.after}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{latestBeforeAfter.metrics.load.improvementPct}% reduction
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-200 font-medium">Effective Throughput</td>
                    <td className="p-3 text-right text-slate-300">{latestBeforeAfter.metrics.throughput.before} Mbps</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{latestBeforeAfter.metrics.throughput.after} Mbps</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{latestBeforeAfter.metrics.throughput.improvementPct}% throughput gain
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-200 font-medium">ICMP Round-Trip Latency</td>
                    <td className="p-3 text-right text-amber-400">{latestBeforeAfter.metrics.latency.before} ms</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{latestBeforeAfter.metrics.latency.after} ms</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{latestBeforeAfter.metrics.latency.improvementPct}% latency recovery
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-200 font-medium">Packet Loss Ratio</td>
                    <td className="p-3 text-right text-red-400">{latestBeforeAfter.metrics.packetLoss.before}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">{latestBeforeAfter.metrics.packetLoss.after}%</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      +{latestBeforeAfter.metrics.packetLoss.improvementPct}% loss elimination
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-600" />
            <div>No optimization event has been executed yet.</div>
            <p className="text-[11px] text-slate-500">
              Click the "APPLY TRAFFIC STEERING" button above to redistribute users and measure the real Before vs After delta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
