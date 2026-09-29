import React from 'react';
import {
  Radio,
  Smartphone,
  Laptop,
  ArrowRightLeft,
  Flame,
  CheckCircle,
  Network,
  Server,
  Zap,
  Activity,
  Sliders
} from 'lucide-react';
import { CellMetrics, Device } from '../types/network';

interface TopologyTabProps {
  cellA: CellMetrics;
  cellB: CellMetrics;
  devices: Device[];
  onToggleDeviceCell: (deviceId: string) => void;
  onUpdateDeviceTraffic: (deviceId: string, demandMbps: number, profile: string) => void;
}

export const TopologyTab: React.FC<TopologyTabProps> = ({
  cellA,
  cellB,
  devices,
  onToggleDeviceCell,
  onUpdateDeviceTraffic
}) => {
  const devicesInA = devices.filter((d) => d.currentCell === 'cell_a');
  const devicesInB = devices.filter((d) => d.currentCell === 'cell_b');

  return (
    <div className="space-y-6">
      {/* Network Architecture Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              Controlled Wireless Testbed Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Represents multi-node mobile network with 2 independent Wi-Fi Access Points (AP A: <span className="text-red-400 font-mono">SmartNet_A</span> & AP B: <span className="text-emerald-400 font-mono">SmartNet_B</span>) connected via Gigabit Ethernet to the Controller.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-slate-300">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Controller: 192.168.1.100 (Flask / SQLite / ML)</span>
          </div>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node A (Cell A) */}
        <div className="bg-slate-900 border-2 border-red-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">Node A • Cell A</h3>
                  <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                    SSID: SmartNet_A
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  IP: 192.168.1.1 • Ch 6 (2.4 GHz) • Max: 50 Mbps
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Airtime Load</div>
              <div className="text-xl font-bold font-mono text-red-400">{cellA.load}%</div>
            </div>
          </div>

          <div className="mb-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Clients: </span>
              <strong className="text-white">{devicesInA.length} devices</strong>
            </div>
            <div>
              <span className="text-slate-400">Throughput: </span>
              <strong className="text-white">{cellA.throughput} Mbps</strong>
            </div>
            <div>
              <span className="text-slate-400">Latency: </span>
              <strong className="text-amber-400">{cellA.latency} ms</strong>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <strong className="text-red-400">{cellA.congestionStatus}</strong>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Connected Devices ({devicesInA.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">Click toggle to steer to Cell B</span>
            </div>

            {devicesInA.map((device) => {
              const Icon = device.deviceType === 'laptop' ? Laptop : Smartphone;
              const isHeavy = device.bandwidthDemandMbps >= 10;
              return (
                <div
                  key={device.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3 transition shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-700/60 text-slate-300 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{device.name}</span>
                        {isHeavy && (
                          <span className="px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> High Demand
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{device.trafficProfile}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{device.rssiDbm} dBm</span>
                        <span>•</span>
                        <span className="text-cyan-400">{device.bandwidthDemandMbps} Mbps</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleDeviceCell(device.id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-700 hover:bg-cyan-600 hover:text-slate-950 text-slate-300 text-xs rounded-lg transition font-medium cursor-pointer"
                    title="Move device to Cell B"
                  >
                    <span>Steer to B</span>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {devicesInA.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No devices connected to Cell A
              </div>
            )}
          </div>
        </div>

        {/* Node B (Cell B) */}
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-base">Node B • Cell B</h3>
                  <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    SSID: SmartNet_B
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  IP: 192.168.2.1 • Ch 36 (5 GHz) • Max: 50 Mbps
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Airtime Load</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{cellB.load}%</div>
            </div>
          </div>

          <div className="mb-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Clients: </span>
              <strong className="text-white">{devicesInB.length} devices</strong>
            </div>
            <div>
              <span className="text-slate-400">Throughput: </span>
              <strong className="text-white">{cellB.throughput} Mbps</strong>
            </div>
            <div>
              <span className="text-slate-400">Latency: </span>
              <strong className="text-emerald-400">{cellB.latency} ms</strong>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <strong className="text-emerald-400">{cellB.congestionStatus}</strong>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Connected Devices ({devicesInB.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">Click toggle to steer to Cell A</span>
            </div>

            {devicesInB.map((device) => {
              const Icon = device.deviceType === 'laptop' ? Laptop : Smartphone;
              const isHeavy = device.bandwidthDemandMbps >= 10;
              return (
                <div
                  key={device.id}
                  className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between gap-3 transition shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-700/60 text-slate-300 rounded-lg">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{device.name}</span>
                        {isHeavy && (
                          <span className="px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> High Demand
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{device.trafficProfile}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{device.rssiDbm} dBm</span>
                        <span>•</span>
                        <span className="text-cyan-400">{device.bandwidthDemandMbps} Mbps</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleDeviceCell(device.id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 text-xs rounded-lg transition font-medium cursor-pointer"
                    title="Move device to Cell A"
                  >
                    <span>Steer to A</span>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {devicesInB.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No devices connected to Cell B
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Testbed Physical Setup Guide Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-white">Interactive Testbed Demonstration Guide:</span>
          <p className="text-slate-400 mt-0.5">
            Use the "Steer" buttons to simulate manual Wi-Fi handoffs between access points. When 6+ devices are concentrated on Cell A, observe how CSMA/CA contention spikes ping latency and packet loss despite strong -53 dBm signal!
          </p>
        </div>
      </div>
    </div>
  );
};
