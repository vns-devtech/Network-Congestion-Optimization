import React, { useState } from 'react';
import {
  Terminal,
  Server,
  Radio,
  Send,
  Code2,
  Copy,
  Check,
  Cpu,
  Smartphone,
  Laptop
} from 'lucide-react';

interface TestbedApiTabProps {
  onInjectMeasurement: (cellId: 'cell_a' | 'cell_b', payload: any) => void;
}

export const TestbedApiTab: React.FC<TestbedApiTabProps> = ({ onInjectMeasurement }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Live test injection state
  const [targetCell, setTargetCell] = useState<'cell_a' | 'cell_b'>('cell_a');
  const [injUsers, setInjUsers] = useState<number>(7);
  const [injLoad, setInjLoad] = useState<number>(88);
  const [injThroughput, setInjThroughput] = useState<number>(3.5);
  const [injLatency, setInjLatency] = useState<number>(165);
  const [injLoss, setInjLoss] = useState<number>(6.2);
  const [injSignal, setInjSignal] = useState<number>(-52);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSendTestPayload = () => {
    onInjectMeasurement(targetCell, {
      users: injUsers,
      load: injLoad,
      throughput: injThroughput,
      latency: injLatency,
      packet_loss: injLoss,
      signal_strength: injSignal
    });
  };

  const codeSnippets = [
    {
      title: 'Python Data Collector (Periodic Telemetry Dispatch)',
      lang: 'python',
      code: `import requests, time

# Target Flask / Express REST API
API_URL = "http://192.168.1.100:5000/api/cells/cell_a/metrics"

payload = {
    "users": 6,
    "load": 84.0,
    "throughput": 4.2,
    "latency": 148.0,
    "packet_loss": 5.4,
    "signal_strength": -53.0
}

response = requests.post(API_URL, json=payload, timeout=3)
print(f"Status: {response.status_code}, Congestion Score: {response.json().get('metrics', {}).get('congestion_score')}")`
    },
    {
      title: 'iperf3 Traffic Stress Generation Commands',
      lang: 'bash',
      code: `# 1. Start iperf3 server on controller laptop
iperf3 -s -p 5201

# 2. Run high-demand client on Phone 1 / Laptop 3 (TCP stress)
iperf3 -c 192.168.1.100 -p 5201 -t 30 -P 4

# 3. ICMP ping latency monitor
ping -c 10 192.168.1.1`
    },
    {
      title: 'cURL Ingestion Endpoint Test',
      lang: 'bash',
      code: `curl -X POST http://localhost:3000/api/cells/cell_a/metrics \\
  -H "Content-Type: application/json" \\
  -d '{"users": 7, "load": 89.5, "throughput": 3.8, "latency": 172.0, "packet_loss": 6.8, "signal_strength": -52.0}'`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          Physical Hardware Testbed & REST API Bridge
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Connect your physical Wi-Fi routers (AP A / AP B), test smartphones, laptops, and Python background collection daemons.
        </p>
      </div>

      {/* Hardware Setup Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold mb-2">
            <Radio className="w-4 h-4" />
            <span>1. ROUTER CONSTRAINTS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            • Router 1 (Cell A): SSID <strong className="text-red-400">SmartNet_A</strong>, 2.4 GHz Ch 6, IP 192.168.1.1<br />
            • Router 2 (Cell B): SSID <strong className="text-emerald-400">SmartNet_B</strong>, 5 GHz Ch 36, IP 192.168.2.1
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
            <Smartphone className="w-4 h-4" />
            <span>2. CLIENT ALLOCATION</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            • Connect 4-5 smartphones + 2-3 laptops.<br />
            • In balanced mode: 3 clients on A, 3 clients on B.<br />
            • In congestion mode: 6-7 clients concentrated on A.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-2">
            <Server className="w-4 h-4" />
            <span>3. CONTROLLER DAEMON</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            • Laptop running Flask/Express on 192.168.1.100.<br />
            • Python collector queries ping, iperf3, Wi-Fi RSSI every 3 seconds and POSTs JSON.
          </p>
        </div>
      </div>

      {/* Interactive Telemetry Payload Injector */}
      <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Send className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Interactive Telemetry Ingestion Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Simulate a real telemetry POST packet arriving from a physical Android phone or Python collector script:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Target Cell</label>
            <select
              value={targetCell}
              onChange={(e) => setTargetCell(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="cell_a">Cell A (SmartNet_A)</option>
              <option value="cell_b">Cell B (SmartNet_B)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Users</label>
            <input
              type="number"
              value={injUsers}
              onChange={(e) => setInjUsers(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Load (%)</label>
            <input
              type="number"
              value={injLoad}
              onChange={(e) => setInjLoad(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Throughput (Mbps)</label>
            <input
              type="number"
              value={injThroughput}
              onChange={(e) => setInjThroughput(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Latency (ms)</label>
            <input
              type="number"
              value={injLatency}
              onChange={(e) => setInjLatency(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">Loss (%)</label>
            <input
              type="number"
              value={injLoss}
              onChange={(e) => setInjLoss(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 text-[10px] block mb-1">RSSI (dBm)</label>
            <input
              type="number"
              value={injSignal}
              onChange={(e) => setInjSignal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSendTestPayload}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Ingestion Payload to /api/cells/{targetCell}/metrics</span>
        </button>
      </div>

      {/* Code Snippets */}
      <div className="space-y-4">
        {codeSnippets.map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-semibold">{item.title}</span>
              <button
                onClick={() => handleCopy(item.code, idx)}
                className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === idx ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-cyan-300 bg-slate-950/60 overflow-x-auto">
              <code>{item.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
