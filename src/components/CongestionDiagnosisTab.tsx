import React from 'react';
import {
  Sliders,
  AlertTriangle,
  Radio,
  Signal,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';
import { CellMetrics } from '../types/network';
import { WEIGHTS, THRESHOLDS } from '../utils/congestionEngine';

interface CongestionDiagnosisTabProps {
  cellA: CellMetrics;
  cellB: CellMetrics;
}

export const CongestionDiagnosisTab: React.FC<CongestionDiagnosisTabProps> = ({ cellA, cellB }) => {
  return (
    <div className="space-y-6">
      {/* Hero: Coverage vs Capacity Research Question */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Radio className="w-4 h-4" />
          <span>Core Academic Investigation • Research Problem</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Coverage vs. Capacity Congestion Diagnosis
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-4xl">
          In crowded environments (stadiums, auditoriums, railway stations, airports, college events), users frequently see full Wi-Fi or 5G signal bars yet experience buffer stalls and failed TCP requests. Our system proves that{' '}
          <strong className="text-emerald-400">strong signal strength (RSSI)</strong> does not guarantee{' '}
          <strong className="text-amber-400">sufficient channel capacity</strong>.
        </p>
      </div>

      {/* Side-by-Side Diagnosis Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cell A Diagnosis */}
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>{cellA.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                  SSID: {cellA.ssid}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Live Contention Analysis</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Congestion Score</span>
              <div className="text-2xl font-black font-mono text-red-400">{cellA.congestionScore}/100</div>
            </div>
          </div>

          {/* Three Key Status Gauges */}
          <div className="space-y-3 mb-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Signal className="w-4 h-4 text-emerald-400" /> Radio Signal Quality:
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                GOOD ({cellA.signalStrength} dBm)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Channel Capacity:
              </span>
              <span className="text-xs font-bold text-red-400 font-mono">
                CONGESTED / BUFFERBLAT ({cellA.load}%)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Probable Cause:
              </span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                {cellA.diagnosis.probableCause}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-red-950/30 border border-red-500/30 rounded-lg text-xs text-slate-200 leading-relaxed font-mono">
            <strong>Diagnosis Interpretation: </strong>
            {cellA.diagnosis.explanation}
          </div>
        </div>

        {/* Cell B Diagnosis */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>{cellB.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                  SSID: {cellB.ssid}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Live Contention Analysis</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Congestion Score</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{cellB.congestionScore}/100</div>
            </div>
          </div>

          {/* Three Key Status Gauges */}
          <div className="space-y-3 mb-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Signal className="w-4 h-4 text-emerald-400" /> Radio Signal Quality:
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                GOOD ({cellB.signalStrength} dBm)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Channel Capacity:
              </span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                HEALTHY / AVAILABLE ({cellB.load}%)
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Probable Cause:
              </span>
              <span className="text-xs font-bold text-cyan-300 font-mono">
                NOMINAL / READY FOR OFFLOAD
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-slate-200 leading-relaxed font-mono">
            <strong>Diagnosis Interpretation: </strong>
            {cellB.diagnosis.explanation}
          </div>
        </div>
      </div>

      {/* Mathematical Scoring Formula Specification */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Percent className="w-4 h-4 text-cyan-400" />
          Multi-KPI Weighted Congestion Scoring Model (0 - 100)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Rather than relying solely on load or RSSI, the algorithm computes a normalized composite score based on 5 physical layer & transport metrics:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Load Weight</div>
            <div className="text-lg font-bold text-white font-mono">{WEIGHTS.load * 100}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Airtime utilization</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Latency Weight</div>
            <div className="text-lg font-bold text-white font-mono">{WEIGHTS.latency * 100}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Queueing bufferbloat</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Packet Loss Weight</div>
            <div className="text-lg font-bold text-white font-mono">{WEIGHTS.packetLoss * 100}%</div>
            <p className="text-[10px] text-slate-500 mt-1">MAC retry exhaustion</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">Throughput Choke</div>
            <div className="text-lg font-bold text-white font-mono">{WEIGHTS.throughput * 100}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Throttling per client</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400">User Density</div>
            <div className="text-lg font-bold text-white font-mono">{WEIGHTS.userDensity * 100}%</div>
            <p className="text-[10px] text-slate-500 mt-1">Contending stations</p>
          </div>
        </div>

        {/* Severity Scale Legend */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">Severity Thresholds:</span>
          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            0 - 30: Normal
          </span>
          <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            31 - 50: Moderate
          </span>
          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
            51 - 75: High
          </span>
          <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
            76 - 100: Severe
          </span>
        </div>
      </div>
    </div>
  );
};
