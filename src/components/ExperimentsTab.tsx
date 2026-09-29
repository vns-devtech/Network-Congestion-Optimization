import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  FileText,
  Download,
  AlertTriangle,
  Radio,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ExperimentRun } from '../types/network';

interface ExperimentsTabProps {
  experiments: ExperimentRun[];
  onRunExperiment: (experimentId: string) => void;
  onExportReport: () => void;
}

export const ExperimentsTab: React.FC<ExperimentsTabProps> = ({
  experiments,
  onRunExperiment,
  onExportReport
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(experiments[0].id);
  const selectedExp = experiments.find((e) => e.id === selectedExpId) || experiments[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              Academic Laboratory Experiment Suite
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Section 41 required experiments demonstrating network equilibrium, capacity saturation, RSSI decoupling, and ML forecasting.
            </p>
          </div>
          <button
            onClick={onExportReport}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Evaluation Report</span>
          </button>
        </div>
      </div>

      {/* Experiment Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experiments.map((exp, idx) => {
          const isSelected = exp.id === selectedExpId;
          const isCompleted = exp.status === 'completed';
          return (
            <div
              key={exp.id}
              onClick={() => setSelectedExpId(exp.id)}
              className={`p-4 rounded-xl border cursor-pointer transition relative ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                  EXP #{idx + 1}
                </span>
                {isCompleted ? (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">Ready</span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">{exp.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {exp.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Experiment Workbench */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">
              ACTIVE EXPERIMENT WORKBENCH
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedExp.name}</h3>
          </div>

          <button
            onClick={() => onRunExperiment(selectedExp.id)}
            disabled={selectedExp.status === 'running'}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{selectedExp.status === 'running' ? 'EXECUTING TESTBED...' : 'INJECT & RUN SCENARIO'}</span>
          </button>
        </div>

        {/* Experiment Detail & Scientific Methodology */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Methodology & Setup Protocol
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                {selectedExp.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Hypothesis & Expected Dynamics
              </h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    When client count exceeds 5 on single 802.11 AP, CSMA/CA backoff exponential window saturates airtime.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>
                    Bufferbloat in AP driver queues causes ping RTT to soar from 20ms to 150ms+ while RSSI remains constant.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results & Findings Panel */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Empirical Findings & Evaluation
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Live Telemetric Log</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800">
              {selectedExp.findings}
            </p>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <div>• Status: <strong className="text-white">{selectedExp.status.toUpperCase()}</strong></div>
              <div>• Target Access Point: <strong className="text-cyan-400">Cell A (SmartNet_A) & Cell B (SmartNet_B)</strong></div>
              <div>• Data Acquisition: <strong className="text-white">ICMP Ping + iperf3 TCP/UDP Sockets</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
