import React, { useState } from 'react';
import { Bell, Filter, AlertTriangle, AlertOctagon, Zap, Info, Clock, CheckCircle } from 'lucide-react';
import { NetworkEvent } from '../types/network';

interface EventsTabProps {
  events: NetworkEvent[];
}

export const EventsTab: React.FC<EventsTabProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter((e) => e.type.toLowerCase() === filterType.toLowerCase());

  const renderBadge = (type: string) => {
    switch (type) {
      case 'ALERT':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> ALERT
          </span>
        );
      case 'CONGESTION':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 rounded flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> CONGESTION
          </span>
        );
      case 'OPTIMIZATION':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded flex items-center gap-1">
            <Zap className="w-3 h-3" /> OPTIMIZATION
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded flex items-center gap-1">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-cyan-400" />
              NOC Event & Incident Audit Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Section 32 chronological trace of congestion alarms, threshold breaches, and steering decisions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilterType('congestion')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'congestion' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Congestion
            </button>
            <button
              onClick={() => setFilterType('optimization')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'optimization' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Optimization
            </button>
            <button
              onClick={() => setFilterType('alert')}
              className={`px-2.5 py-1 rounded transition ${
                filterType === 'alert' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Event Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="space-y-3">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex items-start justify-between gap-4 transition font-mono"
            >
              <div className="flex items-start space-x-3">
                <div className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5 shrink-0">
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>{ev.timestamp}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {renderBadge(ev.type)}
                    {ev.cell && (
                      <span className="text-[11px] text-slate-400 uppercase font-bold">
                        [{ev.cell.replace('_', ' ')}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                    {ev.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500 font-mono">
              No events match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
