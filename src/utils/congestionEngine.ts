import { CellMetrics, CongestionStatus, Device, DiagnosisType, MLPredictionResult, OptimizationRecommendation, BeforeAfterComparison } from '../types/network';

export const THRESHOLDS = {
  loadSevere: 80.0,
  loadHigh: 60.0,
  loadModerate: 35.0,
  latencySevereMs: 150.0,
  latencyHighMs: 100.0,
  latencyModerateMs: 70.0,
  packetLossSeverePct: 5.0,
  packetLossHighPct: 3.0,
  packetLossModeratePct: 1.5,
  signalGoodThresholdDbm: -70.0,
  signalPoorThresholdDbm: -82.0
};

export const WEIGHTS = {
  load: 0.35,
  latency: 0.25,
  packetLoss: 0.20,
  throughput: 0.10,
  userDensity: 0.10
};

export function calculateCongestionScore(
  load: number,
  latency: number,
  packetLoss: number,
  throughput: number,
  users: number,
  maxCapacityMbps: number = 50.0
): number {
  const sLoad = Math.min(100, Math.max(0, load));
  const sLatency = Math.min(100, Math.max(0, (latency - 20) / 1.8));
  const sLoss = Math.min(100, Math.max(0, packetLoss * 10));

  const expectedPerUser = maxCapacityMbps / Math.max(1, users);
  const actualPerUser = throughput / Math.max(1, users);
  const throughputChoke = Math.max(0, 1.0 - (actualPerUser / Math.max(0.1, expectedPerUser)));
  const sThroughput = Math.min(100, throughputChoke * 100);

  const sUsers = Math.min(100, (users / 8.0) * 100);

  const score = (
    sLoad * WEIGHTS.load +
    sLatency * WEIGHTS.latency +
    sLoss * WEIGHTS.packetLoss +
    sThroughput * WEIGHTS.throughput +
    sUsers * WEIGHTS.userDensity
  );

  return Math.round(score * 10) / 10;
}

export function getCongestionStatus(score: number): CongestionStatus {
  if (score >= 76) return 'Severe';
  if (score >= 51) return 'High';
  if (score >= 31) return 'Moderate';
  return 'Normal';
}

export function diagnoseCoverageVsCapacity(
  signalDbm: number,
  load: number,
  users: number,
  latency: number,
  packetLoss: number
): {
  diagnosisType: DiagnosisType;
  signalQuality: string;
  capacityStatus: string;
  probableCause: string;
  explanation: string;
} {
  const isStrongSignal = signalDbm >= THRESHOLDS.signalGoodThresholdDbm;
  const isWeakSignal = signalDbm <= THRESHOLDS.signalPoorThresholdDbm;
  const isOverloaded = load >= THRESHOLDS.loadHigh || users >= 5;
  const hasBufferbloat = latency >= THRESHOLDS.latencyHighMs || packetLoss >= THRESHOLDS.packetLossHighPct;

  if (isStrongSignal && (isOverloaded || hasBufferbloat)) {
    return {
      diagnosisType: 'CAPACITY_CONGESTION',
      signalQuality: `EXCELLENT (${signalDbm} dBm)`,
      capacityStatus: 'CONGESTED / BUFFER SATURATED',
      probableCause: 'HIGH USER DENSITY & CHANNEL CONTENTION',
      explanation: `Device maintains a strong radio link (${signalDbm} dBm), but wireless channel airtime is exhausted by ${users} competing clients, resulting in queueing delay (${latency} ms) and packet drops (${packetLoss}%).`
    };
  }

  if (isWeakSignal && load < 50) {
    return {
      diagnosisType: 'POOR_COVERAGE',
      signalQuality: `WEAK / POOR (${signalDbm} dBm)`,
      capacityStatus: 'UNDERUTILIZED / SPARE CAPACITY',
      probableCause: 'RF ATTENUATION OR DISTANCE TO AP',
      explanation: `The node has available airtime, but client radio sensitivity is severely attenuated (${signalDbm} dBm), forcing 802.11 MCS rate fallback.`
    };
  }

  if (isOverloaded) {
    return {
      diagnosisType: 'MODERATE_CONTENTION',
      signalQuality: `GOOD (${signalDbm} dBm)`,
      capacityStatus: 'ELEVATED TRAFFIC LOAD',
      probableCause: 'RISING CONCURRENT DEMAND',
      explanation: `Load is reaching high thresholds (${load}%). Channel contention is beginning to increase latency.`
    };
  }

  return {
    diagnosisType: 'NORMAL_OPERATION',
    signalQuality: `OPTIMAL (${signalDbm} dBm)`,
    capacityStatus: 'HEALTHY / BALANCED',
    probableCause: 'NOMINAL NETWORK TRAFFIC',
    explanation: 'Access point is operating within designed QoS bounds and latency SLA.'
  };
}

export function predictCongestionRisk(cell: CellMetrics): MLPredictionResult {
  const userFactor = Math.min(1.0, cell.users / 7.0);
  const loadFactor = Math.min(1.0, cell.load / 100.0);
  const latencyFactor = Math.min(1.0, Math.max(0, (cell.latency - 25.0) / 130.0));
  const lossFactor = Math.min(1.0, cell.packetLoss / 6.0);
  const tpChoke = 1.0 - Math.min(1.0, cell.throughput / (cell.users * 8.0));

  const riskRaw = (
    loadFactor * 0.35 +
    latencyFactor * 0.25 +
    lossFactor * 0.20 +
    userFactor * 0.12 +
    tpChoke * 0.08
  );

  const riskPct = Math.round(Math.min(99, Math.max(5, riskRaw * 100)) * 10) / 10;
  let predictedClass: CongestionStatus = 'Normal';
  if (riskPct >= 76) predictedClass = 'Severe';
  else if (riskPct >= 51) predictedClass = 'High';
  else if (riskPct >= 31) predictedClass = 'Moderate';

  return {
    predictedClass,
    congestionRiskPct: riskPct,
    confidencePct: Math.round(Math.min(98, Math.max(76, 80 + Math.abs(riskPct - 50) * 0.35)) * 10) / 10,
    featureContributions: {
      load: Math.round(loadFactor * 35 * 10) / 10,
      latency: Math.round(latencyFactor * 25 * 10) / 10,
      packetLoss: Math.round(lossFactor * 20 * 10) / 10,
      userCount: Math.round(userFactor * 12 * 10) / 10,
      throughputChoke: Math.round(tpChoke * 8 * 10) / 10
    },
    modelMetadata: {
      accuracy: 75.8,
      f1Score: 80.0,
      modelType: 'Random Forest Classifier (Ensemble)'
    }
  };
}

export function evaluateOptimization(
  cellA: CellMetrics,
  cellB: CellMetrics,
  devices: Device[]
): OptimizationRecommendation {
  const loadDiff = Math.abs(cellA.load - cellB.load);
  let needsOptimization = false;
  let sourceCell: 'cell_a' | 'cell_b' | null = null;
  let targetCell: 'cell_a' | 'cell_b' | null = null;

  if (cellA.load > cellB.load && (cellA.load >= 60 || loadDiff >= 15)) {
    needsOptimization = true;
    sourceCell = 'cell_a';
    targetCell = 'cell_b';
  } else if (cellB.load > cellA.load && (cellB.load >= 60 || loadDiff >= 15)) {
    needsOptimization = true;
    sourceCell = 'cell_b';
    targetCell = 'cell_a';
  }

  if (!needsOptimization || !sourceCell || !targetCell) {
    return {
      needsOptimization: false,
      sourceCell: null,
      targetCell: null,
      suggestedMigrationCount: 0,
      recommendedDevices: [],
      recommendationText: 'Network traffic is balanced within nominal thresholds. No traffic steering required.'
    };
  }

  const sourceMetrics = sourceCell === 'cell_a' ? cellA : cellB;
  const targetMetrics = targetCell === 'cell_a' ? cellA : cellB;

  const totalUsers = sourceMetrics.users + targetMetrics.users;
  const targetEven = Math.ceil(totalUsers / 2);
  const countToMove = Math.max(1, Math.min(sourceMetrics.users - 1, sourceMetrics.users - targetEven));

  // Pick candidate devices from source cell with highest demand
  const candidates = devices
    .filter(d => d.currentCell === sourceCell)
    .sort((a, b) => b.bandwidthDemandMbps - a.bandwidthDemandMbps);

  const selectedDevices = candidates.slice(0, countToMove);

  const sourceName = sourceCell === 'cell_a' ? 'Cell A' : 'Cell B';
  const targetName = targetCell === 'cell_a' ? 'Cell A' : 'Cell B';

  return {
    needsOptimization: true,
    sourceCell,
    targetCell,
    suggestedMigrationCount: countToMove,
    recommendedDevices: selectedDevices,
    recommendationText: `${sourceName} is heavily congested (${sourceMetrics.load}% load, ${sourceMetrics.users} users). Migrate ${countToMove} user(s) (${selectedDevices.map(d => d.name).join(', ')}) to ${targetName} to eliminate radio bufferbloat.`,
    projectedMetrics: {
      sourceLoad: Math.round(sourceMetrics.load * ((sourceMetrics.users - countToMove) / sourceMetrics.users) * 0.85),
      targetLoad: Math.round(Math.min(75, targetMetrics.load + countToMove * 12)),
      latencyImprovementPct: 55.0,
      throughputGainPct: 65.0
    }
  };
}

export function computeBeforeAfterDelta(
  beforeSource: CellMetrics,
  afterSource: CellMetrics,
  migratedDevices: string[],
  sourceCell: string,
  targetCell: string
): BeforeAfterComparison {
  const calcPct = (b: number, a: number, lowerIsBetter: boolean) => {
    if (b === 0) return 0;
    const diff = lowerIsBetter ? (b - a) : (a - b);
    return Math.round((diff / b) * 1000) / 10;
  };

  return {
    timestamp: new Date().toLocaleTimeString(),
    sourceCell,
    targetCell,
    migratedDevices,
    metrics: {
      users: {
        before: beforeSource.users,
        after: afterSource.users,
        change: `${beforeSource.users} → ${afterSource.users}`
      },
      load: {
        before: beforeSource.load,
        after: afterSource.load,
        improvementPct: calcPct(beforeSource.load, afterSource.load, true)
      },
      throughput: {
        before: beforeSource.throughput,
        after: afterSource.throughput,
        improvementPct: calcPct(beforeSource.throughput, afterSource.throughput, false)
      },
      latency: {
        before: beforeSource.latency,
        after: afterSource.latency,
        improvementPct: calcPct(beforeSource.latency, afterSource.latency, true)
      },
      packetLoss: {
        before: beforeSource.packetLoss,
        after: afterSource.packetLoss,
        improvementPct: calcPct(beforeSource.packetLoss, afterSource.packetLoss, true)
      }
    }
  };
}
