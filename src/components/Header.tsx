import React from 'react';
import {
  Activity,
  Radio,
  Sliders,
  Play,
  Pause,
  Download,
  RotateCcw,
  Zap,
  BarChart3,
  BrainCircuit,
  Layers,
  FlaskConical,
  Bell,
  Terminal,
  BookOpen
} from 'lucide-react';
import { CongestionStatus } from '../types/network';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  overallStatus: CongestionStatus;
  overallScore: number;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  streamInterval: number;
  setStreamInterval: (val: number) => void;
  onOptimize: () => void;
  onReset: () => void;
  onExport: (format: 'csv' | 'json') => void;
  canOptimize: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  overallStatus,
  overallScore,
  isStreaming,
  setIsStreaming,
  streamInterval,
  setStreamInterval,
  onOptimize,
  onReset,
  onExport,
  canOptimize
}) => {
  const getStatusColor = (status: CongestionStatus) => {
    switch (status) {
      case 'Severe':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Moderate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'Normal':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'topology', label: 'Topology & Testbed', icon: Radio },
    { id: 'charts', label: 'Live Charts', icon: BarChart3 },
    { id: 'diagnosis', label: 'Coverage vs Capacity', icon: Sliders },
    { id: 'ml', label: 'AI Prediction', icon: BrainCircuit },
    { id: 'optimization', label: 'Optimization', icon: Zap },
    { id: 'experiments', label: 'Experiments (6)', icon: FlaskConical },
    { id: 'events', label: 'Event Log', icon: Bell },
    { id: 'api_bridge', label: 'Hardware / API', icon: Terminal },
    { id: 'research', label: 'Research Notes', icon: BookOpen }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-sm">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                SmartNet Monitor & Optimizer
                <span className="text-xs font-semibold px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/50 rounded-md">
                  PBL Testbed
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Academic Multi-Cell Wireless Congestion Lab • Cell A (SmartNet_A) & Cell B (SmartNet_B)
            </p>
          </div>
        </div>

        {/* Global Status Pill & Quick Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Status Badge */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono ${getStatusColor(
              overallStatus
            )}`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            <span>STATUS: {overallStatus.toUpperCase()}</span>
            <span className="opacity-60">|</span>
            <span>SCORE: {overallScore}/100</span>
          </div>

          {/* Live Stream Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                isStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
              title={isStreaming ? 'Pause live stream' : 'Resume live stream'}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Streaming</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Paused</span>
                </>
              )}
            </button>

            <select
              value={streamInterval}
              onChange={(e) => setStreamInterval(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none"
              title="Sampling Interval"
            >
              <option value={1000}>1s poll</option>
              <option value={3000}>3s poll (Standard)</option>
              <option value={5000}>5s poll</option>
            </select>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onOptimize}
            disabled={!canOptimize}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
              canOptimize
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer animate-pulse'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
            title="Execute load balancer traffic steering"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Optimize Network</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition"
            title="Reset testbed state to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="relative group">
            <button
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition"
              title="Export testbed data"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
              <button
                onClick={() => onExport('csv')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => onExport('json')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-thin">
        <nav className="flex space-x-1 border-t border-slate-800/80 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
