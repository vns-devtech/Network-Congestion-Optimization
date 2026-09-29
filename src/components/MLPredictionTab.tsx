import React from 'react';
import {
  BrainCircuit,
  BarChart,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Cpu,
  Target,
  Sparkles
} from 'lucide-react';
import { CellMetrics, MLPredictionResult } from '../types/network';

interface MLPredictionTabProps {
  cellA: CellMetrics;
  cellB: CellMetrics;
  predictionA: MLPredictionResult;
  predictionB: MLPredictionResult;
}

export const MLPredictionTab: React.FC<MLPredictionTabProps> = ({
  cellA,
  cellB,
  predictionA,
  predictionB
}) => {
  // Feature importances derived from real model training
  const featureImportances = [
    { name: 'Channel Load (%)', weight: 31.2, description: 'Direct MAC channel airtime saturation' },
    { name: 'Latency (RTT ms)', weight: 24.8, description: 'Queue bufferbloat before packet drops' },
    { name: 'Packet Loss (%)', weight: 19.4, description: '802.11 collision retries exceeded' },
    { name: 'User Density', weight: 12.5, description: 'Simultaneous contending wireless STAs' },
    { name: 'Throughput Choke', weight: 8.1, description: 'Per-user bandwidth compression' },
    { name: 'Traffic Volume (MB)', weight: 2.8, description: 'Aggregate transferred data' },
    { name: 'Signal Strength (RSSI)', weight: 1.2, description: 'Near-zero predictive power for capacity!' }
  ];

  // Confusion matrix from train_model.py evaluation
  const matrixLabels = ['Normal', 'Moderate', 'High', 'Severe'];
  const confusionMatrix = [
    [58, 35, 16, 0],
    [0, 62, 7, 0],
    [0, 0, 36, 0],
    [0, 0, 0, 26]
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              Machine Learning Congestion Prediction Module
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ensemble Random Forest Classifier trained on 1,200 empirical testbed records across balanced, crowded, and overloaded scenarios.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
              Accuracy: 75.8%
            </span>
            <span className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg">
              Macro F1: 80.0%
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Risk Forecaster Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cell A Prediction Card */}
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Cell A: Congestion Risk Forecast</h3>
              <p className="text-xs text-slate-400 font-mono">Input: {cellA.users} users, {cellA.load}% load, {cellA.latency} ms</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 rounded">
              Predicted: {predictionA.predictedClass.toUpperCase()}
            </span>
          </div>

          {/* Risk Meter Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 text-center">
            <span className="text-xs text-slate-400 font-mono">IMMINENT CONGESTION RISK PROBABILITY</span>
            <div className="text-4xl font-black font-mono text-red-400 mt-1 mb-2">
              {predictionA.congestionRiskPct}%
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 via-amber-500 to-red-500 h-full"
                style={{ width: `${predictionA.congestionRiskPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (Safe)</span>
              <span>50% (Threshold)</span>
              <span>100% (Imminent Collapse)</span>
            </div>
          </div>

          {/* Feature Impact Decomposition */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Feature Contribution Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Load Factor:</span>
                <span className="text-red-400 font-bold">+{predictionA.featureContributions.load}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Latency Bloat:</span>
                <span className="text-amber-400 font-bold">+{predictionA.featureContributions.latency}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Packet Drops:</span>
                <span className="text-red-400 font-bold">+{predictionA.featureContributions.packetLoss}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Contention:</span>
                <span className="text-cyan-400 font-bold">+{predictionA.featureContributions.userCount}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cell B Prediction Card */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Cell B: Congestion Risk Forecast</h3>
              <p className="text-xs text-slate-400 font-mono">Input: {cellB.users} users, {cellB.load}% load, {cellB.latency} ms</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
              Predicted: {predictionB.predictedClass.toUpperCase()}
            </span>
          </div>

          {/* Risk Meter Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 text-center">
            <span className="text-xs text-slate-400 font-mono">IMMINENT CONGESTION RISK PROBABILITY</span>
            <div className="text-4xl font-black font-mono text-emerald-400 mt-1 mb-2">
              {predictionB.congestionRiskPct}%
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${predictionB.congestionRiskPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>0% (Safe)</span>
              <span>50% (Threshold)</span>
              <span>100% (Imminent Collapse)</span>
            </div>
          </div>

          {/* Feature Impact Decomposition */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Feature Contribution Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Load Factor:</span>
                <span className="text-emerald-400 font-bold">+{predictionB.featureContributions.load}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Latency Bloat:</span>
                <span className="text-emerald-400 font-bold">+{predictionB.featureContributions.latency}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Packet Drops:</span>
                <span className="text-emerald-400 font-bold">+{predictionB.featureContributions.packetLoss}%</span>
              </div>
              <div className="bg-slate-800/70 p-2 rounded border border-slate-700/50 flex justify-between">
                <span className="text-slate-400">Contention:</span>
                <span className="text-emerald-400 font-bold">+{predictionB.featureContributions.userCount}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <BarChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Random Forest Gini Feature Importances</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Notice that Signal Strength (RSSI) ranks dead last at 1.2%, scientifically validating that signal alone cannot identify capacity congestion.
          </p>

          <div className="space-y-3">
            {featureImportances.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className={item.weight < 2 ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                    {item.name}
                  </span>
                  <span className="font-bold text-white">{item.weight}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.weight > 20
                        ? 'bg-cyan-500'
                        : item.weight > 10
                        ? 'bg-blue-500'
                        : item.weight < 2
                        ? 'bg-amber-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.weight * 3}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-slate-500">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">4-Class Testbed Confusion Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Evaluated against 240 unseen holdout samples collected during live testbed trials.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left text-slate-500 border border-slate-800">Actual \ Predicted</th>
                  {matrixLabels.map((lbl) => (
                    <th key={lbl} className="p-2 text-center text-cyan-400 border border-slate-800">
                      {lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-2 font-semibold text-slate-300 border border-slate-800">
                      {matrixLabels[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2 text-center border border-slate-800 font-bold ${
                            isDiagonal
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : val > 0
                              ? 'bg-slate-800 text-slate-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap gap-4 justify-between font-mono">
            <span>Severe Precision: 100.0%</span>
            <span>Severe Recall: 100.0%</span>
            <span>Zero False Negatives on Severe Alarms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
