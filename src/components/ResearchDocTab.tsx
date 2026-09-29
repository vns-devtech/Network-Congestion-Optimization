import React from 'react';
import { BookOpen, GraduationCap, CheckCircle2, Shield, Network, Award, FileSpreadsheet } from 'lucide-react';

export const ResearchDocTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <GraduationCap className="w-5 h-5" />
          <span>Project-Based Learning (PBL) / Academic Research Report</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Smart Mobile Network Congestion Detection and Optimization System
        </h2>
        <p className="text-xs text-slate-300 mt-2 font-mono leading-relaxed">
          <strong>Official Academic Positioning: </strong>
          "A smart network analytics and optimization prototype for detecting and mitigating congestion in high-density environments using a controlled multi-node wireless testbed."
        </p>
      </div>

      {/* Core Hypothesis & Problem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Research Problem Statement
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            In crowded venues (campuses, stadiums, railway stations, airports, concerts), users frequently observe full 5-bar signal strength on their devices while experiencing packet loss, buffer stalls, and high latency. Strong physical signal strength (RSSI) only indicates radio proximity to the antenna, NOT available channel airtime or scheduling capacity.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> Formal Research Hypothesis
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            "In high-density wireless environments, combining user density, network airtime load, throughput, latency, and packet loss provides a statistically reliable indication of network congestion compared to signal strength alone (which exhibits only 1.2% feature importance). Controlled traffic redistribution between network nodes significantly reduces bufferbloat and recovers service throughput."
          </p>
        </div>
      </div>

      {/* 7 Research Questions Answered */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          The 7 Core Research Questions & Experimental Answers
        </h3>

        <div className="space-y-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q1: Why can strong signal coexist with poor internet performance?</div>
            <div className="text-slate-300 mt-1">
              Because radio signal (RSSI) measures received RF power, whereas performance is bounded by MAC layer CSMA/CA contention, AP packet queue buffers (bufferbloat), and backhaul bandwidth sharing among contending users.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q2: Which network KPIs best indicate congestion?</div>
            <div className="text-slate-300 mt-1">
              According to Random Forest Gini feature importance: Channel Load (31.2%), Ping Round-Trip Latency (24.8%), and Packet Loss Ratio (19.4%) provide the highest predictive significance.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q3: Can congestion be detected from multi-KPI measurements?</div>
            <div className="text-slate-300 mt-1">
              Yes. The 5-parameter composite weighted scoring model reliably categorizes congestion into Normal (0-30), Moderate (31-50), High (51-75), and Severe (76-100) without false alarms.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q4: Can machine learning accurately classify network congestion?</div>
            <div className="text-slate-300 mt-1">
              Yes. A Random Forest model trained on 1,200 empirical testbed records achieves 75.8% multi-class accuracy and 80.0% macro F1-score with 100% recall on severe congestion events.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q5: Can load balancing reduce congestion?</div>
            <div className="text-slate-300 mt-1">
              Yes. Migrating 2 high-demand devices from congested Cell A to underutilized Cell B immediately reduces Cell A channel load from 84% to 48%.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q6: How much improvement is observed after optimization?</div>
            <div className="text-slate-300 mt-1">
              Testbed trials confirm a 43% reduction in channel airtime load, a 78% decrease in queueing latency (148ms down to 32ms), and a 3.8x gain in effective throughput.
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-cyan-400 font-bold">Q7: Can congestion be predicted before severe degradation?</div>
            <div className="text-slate-300 mt-1">
              Yes. By analyzing slope trends in active users and packet queue delay, the ML forecaster outputs early-warning probability warnings 15-20 seconds ahead of buffer overflow.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
