import { CellMetrics, Device, NetworkEvent, ExperimentRun } from '../types/network';
import { calculateCongestionScore, getCongestionStatus, diagnoseCoverageVsCapacity } from '../utils/congestionEngine';

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-1',
    name: 'Phone 1 (Pixel 8 Pro)',
    deviceType: 'phone',
    currentCell: 'cell_a',
    rssiDbm: -52.0,
    trafficProfile: '4K UltraHD Video Stream',
    bandwidthDemandMbps: 15.0,
    macAddress: 'DC:A6:32:11:42:01',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'dev-2',
    name: 'Phone 2 (Samsung Galaxy S24)',
    deviceType: 'phone',
    currentCell: 'cell_a',
    rssiDbm: -54.0,
    trafficProfile: 'Continuous iperf3 TCP Stress',
    bandwidthDemandMbps: 22.0,
    macAddress: 'BC:D0:74:89:12:33',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'dev-3',
    name: 'Phone 3 (Apple iPhone 15)',
    deviceType: 'phone',
    currentCell: 'cell_a',
    rssiDbm: -56.0,
    trafficProfile: 'Real-Time Multiplayer Gaming',
    bandwidthDemandMbps: 5.5,
    macAddress: 'F0:18:98:23:44:91',
    ipAddress: '192.168.1.103'
  },
  {
    id: 'dev-4',
    name: 'Phone 4 (OnePlus 12)',
    deviceType: 'phone',
    currentCell: 'cell_a',
    rssiDbm: -55.0,
    trafficProfile: 'Cloud Photo Sync (Burst)',
    bandwidthDemandMbps: 9.0,
    macAddress: 'E4:5F:01:77:88:AA',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'dev-5',
    name: 'Laptop 3 (MacBook Air M2)',
    deviceType: 'laptop',
    currentCell: 'cell_a',
    rssiDbm: -53.0,
    trafficProfile: 'Multi-part Torrent / ISO DL',
    bandwidthDemandMbps: 18.5,
    macAddress: '3C:06:30:45:90:EE',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'dev-6',
    name: 'Phone 5 (Motorola Edge 40)',
    deviceType: 'phone',
    currentCell: 'cell_a',
    rssiDbm: -58.0,
    trafficProfile: 'Social Media Feed / Video',
    bandwidthDemandMbps: 4.0,
    macAddress: '48:2C:6A:11:02:18',
    ipAddress: '192.168.1.106'
  },
  {
    id: 'dev-7',
    name: 'Laptop 2 (Dell XPS 15)',
    deviceType: 'laptop',
    currentCell: 'cell_b',
    rssiDbm: -57.0,
    trafficProfile: 'Video Conference Call',
    bandwidthDemandMbps: 4.5,
    macAddress: 'A4:BB:6D:99:31:07',
    ipAddress: '192.168.2.101'
  },
  {
    id: 'dev-8',
    name: 'Laptop 1 (ThinkPad X1 Carbon)',
    deviceType: 'laptop',
    currentCell: 'cell_b',
    rssiDbm: -59.0,
    trafficProfile: 'Git Repository Sync / Web',
    bandwidthDemandMbps: 1.8,
    macAddress: '54:E1:AD:66:82:F4',
    ipAddress: '192.168.2.102'
  }
];

export const INITIAL_CELL_A: CellMetrics = {
  cellId: 'cell_a',
  name: 'Cell A (Node A)',
  ssid: 'SmartNet_A',
  channel: 6,
  frequencyGhz: 2.4,
  users: 6,
  load: 84.0,
  throughput: 4.2,
  latency: 148.0,
  packetLoss: 5.4,
  signalStrength: -53.0,
  trafficVolume: 48.5,
  congestionScore: 86.2,
  congestionStatus: 'Severe',
  diagnosis: diagnoseCoverageVsCapacity(-53.0, 84.0, 6, 148.0, 5.4)
};

export const INITIAL_CELL_B: CellMetrics = {
  cellId: 'cell_b',
  name: 'Cell B (Node B)',
  ssid: 'SmartNet_B',
  channel: 36,
  frequencyGhz: 5.0,
  users: 2,
  load: 21.0,
  throughput: 38.6,
  latency: 22.0,
  packetLoss: 0.1,
  signalStrength: -58.0,
  trafficVolume: 12.0,
  congestionScore: 16.5,
  congestionStatus: 'Normal',
  diagnosis: diagnoseCoverageVsCapacity(-58.0, 21.0, 2, 22.0, 0.1)
};

export const INITIAL_EVENTS: NetworkEvent[] = [
  {
    id: 'ev-1',
    timestamp: '11:42:05',
    type: 'ALERT',
    cell: 'cell_a',
    message: 'High wireless channel airtime contention detected on Cell A (SmartNet_A)'
  },
  {
    id: 'ev-2',
    timestamp: '11:42:08',
    type: 'CONGESTION',
    cell: 'cell_a',
    message: 'Cell A Congestion Score reached 86.2/100 (Status: SEVERE)'
  },
  {
    id: 'ev-3',
    timestamp: '11:42:11',
    type: 'INFO',
    cell: 'cell_b',
    message: 'Cell B (SmartNet_B) identified as underutilized node with 79% spare capacity'
  },
  {
    id: 'ev-4',
    timestamp: '11:42:13',
    type: 'OPTIMIZATION',
    cell: 'cell_a',
    message: 'Recommendation generated: Steer 2 high-bandwidth users from Cell A to Cell B'
  }
];

export const ACADEMIC_EXPERIMENTS: ExperimentRun[] = [
  {
    id: 'exp-1',
    name: 'Experiment 1: Normal Network Baseline',
    description: 'Equally distribute users across Cell A (3 users) and Cell B (3 users) with moderate traffic. Measure baseline latency, throughput, and jitter under equilibrium.',
    status: 'idle',
    scenario: 'normal',
    findings: 'Both cells operate below 35% channel load with round-trip latency under 30ms and zero packet drops. Validates nominal SLA.'
  },
  {
    id: 'exp-2',
    name: 'Experiment 2: Crowded Network Contention',
    description: 'Concentrate 6-7 devices on Cell A while generating simultaneous 4K streaming and iperf3 traffic. Observe wireless MAC backoff and buffer saturation.',
    status: 'idle',
    scenario: 'crowded',
    findings: 'Channel load surges to 85%+, latency jumps to 150ms+ (bufferbloat), and packet drops climb above 5% due to 802.11 collision retries.'
  },
  {
    id: 'exp-3',
    name: 'Experiment 3: Strong Signal + Severe Congestion',
    description: 'Place mobile devices right beside Cell A AP to ensure -50 dBm signal strength, then saturate capacity. Proves strong RSSI != good network quality.',
    status: 'idle',
    scenario: 'strong_signal_congestion',
    findings: 'Critical academic proof: Despite excellent -52 dBm RSSI, throughput plummets to 4 Mbps and streaming buffers stall. Confirms capacity bottleneck.'
  },
  {
    id: 'exp-4',
    name: 'Experiment 4: Load Balancing & Re-measurement',
    description: 'Execute traffic steering: Migrate 2-3 heavy devices from overloaded Cell A to underutilized Cell B. Measure Before vs After improvement percentage.',
    status: 'idle',
    scenario: 'load_balancing',
    findings: 'Cell A load drops from 84% to 48%, latency recovers from 148ms to 32ms (78% improvement), and aggregate throughput triples.'
  },
  {
    id: 'exp-5',
    name: 'Experiment 5: Machine Learning Classification',
    description: 'Feed multi-KPI testbed vector into trained Random Forest model. Compare classifier accuracy against ground-truth rule thresholds.',
    status: 'idle',
    scenario: 'ml_validation',
    findings: 'Model achieves 75.8% accuracy and 80.0% F1-score across 4 classes. Feature importance proves Load, Latency, and Loss dominate over Signal Strength.'
  },
  {
    id: 'exp-6',
    name: 'Experiment 6: Early Congestion Prediction',
    description: 'Gradually ramp up user demand on Cell A and monitor ML Congestion Risk forecasting ahead of actual buffer drop events.',
    status: 'idle',
    scenario: 'prediction',
    findings: 'Continuous risk score reaches 84% early risk warning 15-20 seconds before severe packet drop threshold is crossed, enabling proactive steering.'
  }
];
