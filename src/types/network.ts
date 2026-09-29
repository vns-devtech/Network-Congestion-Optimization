export type CongestionStatus = 'Normal' | 'Moderate' | 'High' | 'Severe';

export type DiagnosisType =
  | 'CAPACITY_CONGESTION'
  | 'POOR_COVERAGE'
  | 'MODERATE_CONTENTION'
  | 'NORMAL_OPERATION';

export interface Device {
  id: string;
  name: string;
  deviceType: 'phone' | 'laptop';
  currentCell: 'cell_a' | 'cell_b';
  rssiDbm: number;
  trafficProfile: string;
  bandwidthDemandMbps: number;
  macAddress?: string;
  ipAddress?: string;
}

export interface CellMetrics {
  cellId: 'cell_a' | 'cell_b';
  name: string;
  ssid: string;
  channel: number;
  frequencyGhz: number;
  users: number;
  load: number; // percentage 0 - 100
  throughput: number; // Mbps
  latency: number; // ms
  packetLoss: number; // percentage
  signalStrength: number; // dBm (-30 to -95)
  trafficVolume: number; // MB
  congestionScore: number; // 0 - 100
  congestionStatus: CongestionStatus;
  diagnosis: {
    diagnosisType: DiagnosisType;
    signalQuality: string;
    capacityStatus: string;
    probableCause: string;
    explanation: string;
  };
}

export interface MetricDataPoint {
  timestamp: string;
  cellALoad: number;
  cellBLoad: number;
  cellAThroughput: number;
  cellBThroughput: number;
  cellALatency: number;
  cellBLatency: number;
  cellAPacketLoss: number;
  cellBPacketLoss: number;
  cellAUsers: number;
  cellBUsers: number;
}

export interface MLPredictionResult {
  predictedClass: CongestionStatus;
  congestionRiskPct: number;
  confidencePct: number;
  featureContributions: {
    load: number;
    latency: number;
    packetLoss: number;
    userCount: number;
    throughputChoke: number;
  };
  modelMetadata: {
    accuracy: number;
    f1Score: number;
    modelType: string;
  };
}

export interface OptimizationRecommendation {
  needsOptimization: boolean;
  sourceCell: 'cell_a' | 'cell_b' | null;
  targetCell: 'cell_a' | 'cell_b' | null;
  suggestedMigrationCount: number;
  recommendedDevices: Device[];
  recommendationText: string;
  projectedMetrics?: {
    sourceLoad: number;
    targetLoad: number;
    latencyImprovementPct: number;
    throughputGainPct: number;
  };
}

export interface BeforeAfterComparison {
  timestamp: string;
  sourceCell: string;
  targetCell: string;
  migratedDevices: string[];
  metrics: {
    users: { before: number; after: number; change: string };
    load: { before: number; after: number; improvementPct: number };
    throughput: { before: number; after: number; improvementPct: number };
    latency: { before: number; after: number; improvementPct: number };
    packetLoss: { before: number; after: number; improvementPct: number };
  };
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  type: 'ALERT' | 'CONGESTION' | 'OPTIMIZATION' | 'EXPERIMENT' | 'INFO';
  cell?: 'cell_a' | 'cell_b' | 'global';
  message: string;
}

export interface ExperimentRun {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed';
  startTime?: string;
  endTime?: string;
  scenario: 'normal' | 'crowded' | 'strong_signal_congestion' | 'load_balancing' | 'ml_validation' | 'prediction';
  beforeMetrics?: Partial<CellMetrics>;
  afterMetrics?: Partial<CellMetrics>;
  findings: string;
}
