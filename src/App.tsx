/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CellMetrics,
  Device,
  MetricDataPoint,
  NetworkEvent,
  ExperimentRun,
  BeforeAfterComparison
} from './types/network';
import {
  INITIAL_CELL_A,
  INITIAL_CELL_B,
  INITIAL_DEVICES,
  INITIAL_EVENTS,
  ACADEMIC_EXPERIMENTS
} from './data/initialState';
import {
  calculateCongestionScore,
  getCongestionStatus,
  diagnoseCoverageVsCapacity,
  predictCongestionRisk,
  evaluateOptimization,
  computeBeforeAfterDelta
} from './utils/congestionEngine';

import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { TopologyTab } from './components/TopologyTab';
import { LiveChartsTab } from './components/LiveChartsTab';
import { CongestionDiagnosisTab } from './components/CongestionDiagnosisTab';
import { MLPredictionTab } from './components/MLPredictionTab';
import { OptimizationTab } from './components/OptimizationTab';
import { ExperimentsTab } from './components/ExperimentsTab';
import { EventsTab } from './components/EventsTab';
import { TestbedApiTab } from './components/TestbedApiTab';
import { ResearchDocTab } from './components/ResearchDocTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [cellA, setCellA] = useState<CellMetrics>(INITIAL_CELL_A);
  const [cellB, setCellB] = useState<CellMetrics>(INITIAL_CELL_B);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [events, setEvents] = useState<NetworkEvent[]>(INITIAL_EVENTS);
  const [experiments, setExperiments] = useState<ExperimentRun[]>(ACADEMIC_EXPERIMENTS);
  const [beforeAfterList, setBeforeAfterList] = useState<BeforeAfterComparison[]>([]);

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamInterval, setStreamInterval] = useState<number>(3000);

  // Time-series history
  const [history, setHistory] = useState<MetricDataPoint[]>([
    {
      timestamp: '11:40:00',
      cellALoad: 81.2,
      cellBLoad: 20.5,
      cellAThroughput: 4.5,
      cellBThroughput: 38.0,
      cellALatency: 142.0,
      cellBLatency: 22.0,
      cellAPacketLoss: 4.8,
      cellBPacketLoss: 0.1,
      cellAUsers: 6,
      cellBUsers: 2
    },
    {
      timestamp: '11:40:30',
      cellALoad: 83.5,
      cellBLoad: 21.0,
      cellAThroughput: 4.3,
      cellBThroughput: 38.5,
      cellALatency: 145.0,
      cellBLatency: 23.0,
      cellAPacketLoss: 5.1,
      cellBPacketLoss: 0.2,
      cellAUsers: 6,
      cellBUsers: 2
    },
    {
      timestamp: '11:41:00',
      cellALoad: 84.0,
      cellBLoad: 21.0,
      cellAThroughput: 4.2,
      cellBThroughput: 38.6,
      cellALatency: 148.0,
      cellBLatency: 22.0,
      cellAPacketLoss: 5.4,
      cellBPacketLoss: 0.1,
      cellAUsers: 6,
      cellBUsers: 2
    }
  ]);

  // Derived Optimization Recommendation & ML Predictions
  const recommendation = evaluateOptimization(cellA, cellB, devices);
  const predictionA = predictCongestionRisk(cellA);
  const predictionB = predictCongestionRisk(cellB);

  const overallScore = Math.max(cellA.congestionScore, cellB.congestionScore);
  const overallStatus = cellA.congestionStatus === 'Severe' || cellB.congestionStatus === 'Severe'
    ? 'Severe'
    : cellA.congestionStatus === 'High' || cellB.congestionStatus === 'High'
    ? 'High'
    : cellA.congestionStatus === 'Moderate' || cellB.congestionStatus === 'Moderate'
    ? 'Moderate'
    : 'Normal';

  // Live streaming ticker
  useEffect(() => {
    if (!isStreaming) return;

    const timer = setInterval(() => {
      // Gentle physical jitter
      const jitter = (val: number, range: number) => {
        const delta = (Math.random() - 0.5) * range;
        return Math.round((val + delta) * 10) / 10;
      };

      setCellA((prev) => {
        const uA = devices.filter((d) => d.currentCell === 'cell_a').length;
        const newLoad = Math.min(99, Math.max(10, jitter(prev.load, 1.5)));
        const newLat = Math.max(15, jitter(prev.latency, 4.0));
        const newLoss = Math.min(20, Math.max(0, jitter(prev.packetLoss, 0.4)));
        const newTp = Math.min(50, Math.max(1, jitter(prev.throughput, 0.6)));
        const newScore = calculateCongestionScore(newLoad, newLat, newLoss, newTp, uA);
        const newStatus = getCongestionStatus(newScore);
        const newDiag = diagnoseCoverageVsCapacity(prev.signalStrength, newLoad, uA, newLat, newLoss);

        return {
          ...prev,
          users: uA,
          load: newLoad,
          latency: newLat,
          packetLoss: newLoss,
          throughput: newTp,
          congestionScore: newScore,
          congestionStatus: newStatus,
          diagnosis: newDiag
        };
      });

      setCellB((prev) => {
        const uB = devices.filter((d) => d.currentCell === 'cell_b').length;
        const newLoad = Math.min(99, Math.max(10, jitter(prev.load, 1.0)));
        const newLat = Math.max(15, jitter(prev.latency, 2.0));
        const newLoss = Math.min(20, Math.max(0, jitter(prev.packetLoss, 0.1)));
        const newTp = Math.min(50, Math.max(1, jitter(prev.throughput, 1.2)));
        const newScore = calculateCongestionScore(newLoad, newLat, newLoss, newTp, uB);
        const newStatus = getCongestionStatus(newScore);
        const newDiag = diagnoseCoverageVsCapacity(prev.signalStrength, newLoad, uB, newLat, newLoss);

        return {
          ...prev,
          users: uB,
          load: newLoad,
          latency: newLat,
          packetLoss: newLoss,
          throughput: newTp,
          congestionScore: newScore,
          congestionStatus: newStatus,
          diagnosis: newDiag
        };
      });

      // Append point to history
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        const newPt: MetricDataPoint = {
          timestamp: timeStr,
          cellALoad: cellA.load,
          cellBLoad: cellB.load,
          cellAThroughput: cellA.throughput,
          cellBThroughput: cellB.throughput,
          cellALatency: cellA.latency,
          cellBLatency: cellB.latency,
          cellAPacketLoss: cellA.packetLoss,
          cellBPacketLoss: cellB.packetLoss,
          cellAUsers: cellA.users,
          cellBUsers: cellB.users
        };
        const updated = [...prev, newPt];
        return updated.slice(-30);
      });
    }, streamInterval);

    return () => clearInterval(timer);
  }, [isStreaming, streamInterval, devices, cellA.load, cellB.load]);

  // Traffic Steering Execution
  const handleApplyOptimization = () => {
    if (!recommendation.needsOptimization || !recommendation.sourceCell || !recommendation.targetCell) {
      return;
    }

    const source = recommendation.sourceCell;
    const target = recommendation.targetCell;
    const toMigrateIds = new Set(recommendation.recommendedDevices.map((d) => d.id));

    // Update devices
    const updatedDevices = devices.map((d) => {
      if (toMigrateIds.has(d.id)) {
        return { ...d, currentCell: target };
      }
      return d;
    });
    setDevices(updatedDevices);

    const countMoved = recommendation.suggestedMigrationCount;
    const migratedNames = recommendation.recommendedDevices.map((d) => d.name);

    const beforeA = { ...cellA };
    const beforeB = { ...cellB };

    let afterA: CellMetrics;
    let afterB: CellMetrics;

    if (source === 'cell_a') {
      const newU_A = Math.max(1, cellA.users - countMoved);
      const newU_B = cellB.users + countMoved;
      const newLoadA = Math.max(25, Math.round(cellA.load - countMoved * 18.0));
      const newLoadB = Math.min(75, Math.round(cellB.load + countMoved * 14.0));
      const newLatA = Math.max(28, Math.round(cellA.latency * 0.28));
      const newLossA = Math.max(0.2, Math.round(cellA.packetLoss * 0.15 * 10) / 10);
      const newTpA = Math.round(cellA.throughput * 5.8 * 10) / 10;
      const scoreA = calculateCongestionScore(newLoadA, newLatA, newLossA, newTpA, newU_A);

      afterA = {
        ...cellA,
        users: newU_A,
        load: newLoadA,
        latency: newLatA,
        packetLoss: newLossA,
        throughput: newTpA,
        congestionScore: scoreA,
        congestionStatus: getCongestionStatus(scoreA),
        diagnosis: diagnoseCoverageVsCapacity(cellA.signalStrength, newLoadA, newU_A, newLatA, newLossA)
      };

      const scoreB = calculateCongestionScore(newLoadB, cellB.latency, cellB.packetLoss, cellB.throughput, newU_B);
      afterB = {
        ...cellB,
        users: newU_B,
        load: newLoadB,
        congestionScore: scoreB,
        congestionStatus: getCongestionStatus(scoreB),
        diagnosis: diagnoseCoverageVsCapacity(cellB.signalStrength, newLoadB, newU_B, cellB.latency, cellB.packetLoss)
      };

      const delta = computeBeforeAfterDelta(beforeA, afterA, migratedNames, 'cell_a', 'cell_b');
      setBeforeAfterList((prev) => [delta, ...prev]);
    } else {
      const newU_B = Math.max(1, cellB.users - countMoved);
      const newU_A = cellA.users + countMoved;
      const newLoadB = Math.max(25, Math.round(cellB.load - countMoved * 18.0));
      const newLoadA = Math.min(75, Math.round(cellA.load + countMoved * 14.0));
      const newLatB = Math.max(28, Math.round(cellB.latency * 0.28));
      const newLossB = Math.max(0.2, Math.round(cellB.packetLoss * 0.15 * 10) / 10);
      const newTpB = Math.round(cellB.throughput * 5.8 * 10) / 10;
      const scoreB = calculateCongestionScore(newLoadB, newLatB, newLossB, newTpB, newU_B);

      afterB = {
        ...cellB,
        users: newU_B,
        load: newLoadB,
        latency: newLatB,
        packetLoss: newLossB,
        throughput: newTpB,
        congestionScore: scoreB,
        congestionStatus: getCongestionStatus(scoreB),
        diagnosis: diagnoseCoverageVsCapacity(cellB.signalStrength, newLoadB, newU_B, newLatB, newLossB)
      };

      const scoreA = calculateCongestionScore(newLoadA, cellA.latency, cellA.packetLoss, cellA.throughput, newU_A);
      afterA = {
        ...cellA,
        users: newU_A,
        load: newLoadA,
        congestionScore: scoreA,
        congestionStatus: getCongestionStatus(scoreA),
        diagnosis: diagnoseCoverageVsCapacity(cellA.signalStrength, newLoadA, newU_A, cellA.latency, cellA.packetLoss)
      };

      const delta = computeBeforeAfterDelta(beforeB, afterB, migratedNames, 'cell_b', 'cell_a');
      setBeforeAfterList((prev) => [delta, ...prev]);
    }

    setCellA(afterA);
    setCellB(afterB);

    // Add events
    const timeStr = new Date().toTimeString().split(' ')[0];
    setEvents((prev) => [
      {
        id: `ev-${Date.now()}-1`,
        timestamp: timeStr,
        type: 'OPTIMIZATION',
        cell: source,
        message: `Traffic steering applied: Migrated ${migratedNames.join(', ')} from ${source.toUpperCase()} to ${target.toUpperCase()}`
      },
      {
        id: `ev-${Date.now()}-2`,
        timestamp: timeStr,
        type: 'INFO',
        cell: source,
        message: `Performance recovered on ${source.toUpperCase()}: Latency dropped to ${afterA.latency} ms, airtime load reduced to ${afterA.load}%`
      },
      ...prev
    ]);

    setActiveTab('optimization');
  };

  // Device Manual Steering Toggle
  const handleToggleDeviceCell = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          const nextCell = d.currentCell === 'cell_a' ? 'cell_b' : 'cell_a';
          return { ...d, currentCell: nextCell };
        }
        return d;
      })
    );

    const dev = devices.find((d) => d.id === deviceId);
    if (dev) {
      const nextCell = dev.currentCell === 'cell_a' ? 'cell_b' : 'cell_a';
      const timeStr = new Date().toTimeString().split(' ')[0];
      setEvents((prev) => [
        {
          id: `ev-${Date.now()}`,
          timestamp: timeStr,
          type: 'OPTIMIZATION',
          cell: nextCell,
          message: `Manual handoff: ${dev.name} reassigned to ${nextCell.toUpperCase()}`
        },
        ...prev
      ]);
    }
  };

  // Reset Testbed State
  const handleReset = () => {
    setCellA(INITIAL_CELL_A);
    setCellB(INITIAL_CELL_B);
    setDevices(INITIAL_DEVICES);
    setEvents((prev) => [
      {
        id: `ev-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'INFO',
        cell: 'global',
        message: 'Testbed state restored to default academic congestion demonstration baseline.'
      },
      ...prev
    ]);
  };

  // Ingestion from Testbed / API Bridge
  const handleInjectMeasurement = (targetCell: 'cell_a' | 'cell_b', payload: any) => {
    const score = calculateCongestionScore(
      payload.load,
      payload.latency,
      payload.packet_loss,
      payload.throughput,
      payload.users
    );
    const status = getCongestionStatus(score);
    const diag = diagnoseCoverageVsCapacity(
      payload.signal_strength,
      payload.load,
      payload.users,
      payload.latency,
      payload.packet_loss
    );

    if (targetCell === 'cell_a') {
      setCellA((prev) => ({
        ...prev,
        users: payload.users,
        load: payload.load,
        throughput: payload.throughput,
        latency: payload.latency,
        packetLoss: payload.packet_loss,
        signalStrength: payload.signal_strength,
        congestionScore: score,
        congestionStatus: status,
        diagnosis: diag
      }));
    } else {
      setCellB((prev) => ({
        ...prev,
        users: payload.users,
        load: payload.load,
        throughput: payload.throughput,
        latency: payload.latency,
        packetLoss: payload.packet_loss,
        signalStrength: payload.signal_strength,
        congestionScore: score,
        congestionStatus: status,
        diagnosis: diag
      }));
    }

    setEvents((prev) => [
      {
        id: `ev-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        type: 'INFO',
        cell: targetCell,
        message: `External probe telemetry ingested: ${targetCell.toUpperCase()} updated (Load: ${payload.load}%, Score: ${score}/100)`
      },
      ...prev
    ]);
  };

  // Run Experiment Scenario
  const handleRunExperiment = (experimentId: string) => {
    setExperiments((prev) =>
      prev.map((e) => (e.id === experimentId ? { ...e, status: 'running' } : e))
    );

    setTimeout(() => {
      const exp = experiments.find((e) => e.id === experimentId);
      if (!exp) return;

      if (exp.scenario === 'normal') {
        // Balanced 3+3
        setCellA((prev) => ({
          ...prev,
          users: 3,
          load: 28.0,
          latency: 24.0,
          packetLoss: 0.1,
          throughput: 34.0,
          congestionScore: 22.0,
          congestionStatus: 'Normal'
        }));
        setCellB((prev) => ({
          ...prev,
          users: 3,
          load: 26.0,
          latency: 22.0,
          packetLoss: 0.1,
          throughput: 35.0,
          congestionScore: 20.0,
          congestionStatus: 'Normal'
        }));
      } else if (exp.scenario === 'crowded' || exp.scenario === 'strong_signal_congestion') {
        // Congested Cell A
        setCellA((prev) => ({
          ...prev,
          users: 7,
          load: 89.0,
          latency: 168.0,
          packetLoss: 6.8,
          throughput: 3.2,
          signalStrength: -51.0, // Strong signal!
          congestionScore: 91.5,
          congestionStatus: 'Severe',
          diagnosis: diagnoseCoverageVsCapacity(-51.0, 89.0, 7, 168.0, 6.8)
        }));
      } else if (exp.scenario === 'load_balancing') {
        handleApplyOptimization();
      }

      setExperiments((prev) =>
        prev.map((e) => (e.id === experimentId ? { ...e, status: 'completed' } : e))
      );

      setEvents((prev) => [
        {
          id: `ev-${Date.now()}`,
          timestamp: new Date().toTimeString().split(' ')[0],
          type: 'EXPERIMENT',
          cell: 'global',
          message: `Executed Academic Experiment: ${exp.name}`
        },
        ...prev
      ]);
    }, 1200);
  };

  // Export Data Handler
  const handleExport = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const exportObj = {
        testbed: {
          cell_a: cellA,
          cell_b: cellB,
          devices,
          history,
          events,
          beforeAfterList
        },
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartnet_testbed_export_${Date.now()}.json`;
      a.click();
    } else {
      let csv = 'timestamp,cell,users,load_pct,throughput_mbps,latency_ms,packet_loss_pct,signal_rssi_dbm,congestion_score,congestion_status\n';
      history.forEach((pt) => {
        csv += `${pt.timestamp},cell_a,${pt.cellAUsers},${pt.cellALoad},${pt.cellAThroughput},${pt.cellALatency},${pt.cellAPacketLoss},-53.0,${cellA.congestionScore},${cellA.congestionStatus}\n`;
        csv += `${pt.timestamp},cell_b,${pt.cellBUsers},${pt.cellBLoad},${pt.cellBThroughput},${pt.cellBLatency},${pt.cellBPacketLoss},-58.0,${cellB.congestionScore},${cellB.congestionStatus}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartnet_measurements_${Date.now()}.csv`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top NOC Header & Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overallStatus={overallStatus}
        overallScore={overallScore}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        streamInterval={streamInterval}
        setStreamInterval={setStreamInterval}
        onOptimize={handleApplyOptimization}
        onReset={handleReset}
        onExport={handleExport}
        canOptimize={recommendation.needsOptimization}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            cellA={cellA}
            cellB={cellB}
            recommendation={recommendation}
            onNavigateToTab={setActiveTab}
            onOptimize={handleApplyOptimization}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyTab
            cellA={cellA}
            cellB={cellB}
            devices={devices}
            onToggleDeviceCell={handleToggleDeviceCell}
            onUpdateDeviceTraffic={() => {}}
          />
        )}

        {activeTab === 'charts' && <LiveChartsTab history={history} />}

        {activeTab === 'diagnosis' && (
          <CongestionDiagnosisTab cellA={cellA} cellB={cellB} />
        )}

        {activeTab === 'ml' && (
          <MLPredictionTab
            cellA={cellA}
            cellB={cellB}
            predictionA={predictionA}
            predictionB={predictionB}
          />
        )}

        {activeTab === 'optimization' && (
          <OptimizationTab
            cellA={cellA}
            cellB={cellB}
            recommendation={recommendation}
            beforeAfterList={beforeAfterList}
            onOptimize={handleApplyOptimization}
            onReset={handleReset}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsTab
            experiments={experiments}
            onRunExperiment={handleRunExperiment}
            onExportReport={() => handleExport('json')}
          />
        )}

        {activeTab === 'events' && <EventsTab events={events} />}

        {activeTab === 'api_bridge' && (
          <TestbedApiTab onInjectMeasurement={handleInjectMeasurement} />
        )}

        {activeTab === 'research' && <ResearchDocTab />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart Mobile Network Congestion Detection and Optimization System • Academic Research Testbed</span>
          <span>Controlled APs: SmartNet_A (Ch 6) & SmartNet_B (Ch 36) • Monitor → Detect → Predict → Optimize</span>
        </div>
      </footer>
    </div>
  );
}
