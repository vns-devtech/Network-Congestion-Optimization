"""
Master Data Collector Daemon
Runs in a background thread or standalone loop.
Periodically polls ping, traffic, and Wi-Fi monitors for Cell A & Cell B,
evaluates congestion scoring and ML prediction, stores into SQLite, and optionally POSTs to Flask API.
"""

import time
import sqlite3
import os
import requests
from pathlib import Path
from typing import Dict, Any

from config import DB_PATH, COLLECTION_INTERVAL_SECONDS, CELLS
from collector.ping_monitor import PingMonitor
from collector.traffic_monitor import TrafficMonitor
from collector.wifi_monitor import WifiMonitor
from detection.congestion_detector import CongestionDetector
from ml.predict import CongestionPredictor

class NetworkCollector:
    def __init__(self, api_base_url: str = None):
        self.api_base_url = api_base_url
        self.detector = CongestionDetector()
        self.predictor = CongestionPredictor()
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        schema_path = os.path.join(os.path.dirname(DB_PATH), "schema.sql")
        conn = sqlite3.connect(DB_PATH)
        if os.path.exists(schema_path):
            with open(schema_path, "r") as f:
                conn.executescript(f.read())
        conn.commit()
        conn.close()

    def collect_cell(self, cell_id: str, simulated_state: Dict[str, Any] = None) -> Dict[str, Any]:
        cfg = CELLS[cell_id]
        ping_mon = PingMonitor(cfg["ip_gateway"])
        traffic_mon = TrafficMonitor(cfg["ip_gateway"], cfg["iperf_port"])
        wifi_mon = WifiMonitor(cfg["ssid"])

        # Physical measurements
        p_res = ping_mon.measure()
        t_res = traffic_mon.run_iperf_test(duration_sec=2)
        w_res = wifi_mon.get_signal_metrics()

        # If simulated_state is provided (e.g. from testbed scenario injection)
        if simulated_state:
            users = simulated_state.get("users", 3)
            load = simulated_state.get("load", 40.0)
            latency = simulated_state.get("latency", p_res["avg_latency_ms"])
            packet_loss = simulated_state.get("packet_loss", p_res["packet_loss_pct"])
            throughput = simulated_state.get("throughput", 20.0)
            signal = simulated_state.get("signal_strength", w_res["rssi_dbm"])
            volume = simulated_state.get("traffic_volume", 25.0)
        else:
            # Derive load and metrics
            latency = p_res["avg_latency_ms"]
            packet_loss = p_res["packet_loss_pct"]
            throughput = t_res["throughput_mbps"] if t_res["available"] else 24.5
            signal = w_res["rssi_dbm"]
            volume = t_res["traffic_volume_mb"] if t_res["available"] else 12.0
            users = 3
            load = min(100.0, max(10.0, (throughput / cfg["max_capacity_mbps"]) * 100.0))

        # Congestion Evaluation
        eval_res = self.detector.evaluate({
            "load": load,
            "latency": latency,
            "packet_loss": packet_loss,
            "throughput": throughput,
            "users": users,
            "signal_strength": signal
        })

        # ML Risk Prediction
        ml_res = self.predictor.predict(
            user_count=users,
            load_pct=load,
            throughput_mbps=throughput,
            latency_ms=latency,
            packet_loss_pct=packet_loss,
            signal_strength_dbm=signal,
            traffic_volume_mb=volume
        )

        record = {
            "cell": cell_id,
            "users": users,
            "load": round(load, 1),
            "throughput": round(throughput, 2),
            "latency": round(latency, 1),
            "packet_loss": round(packet_loss, 2),
            "signal_strength": round(signal, 1),
            "traffic_volume": round(volume, 2),
            "congestion_score": eval_res["congestion_score"],
            "congestion_status": eval_res["congestion_status"],
            "diagnosis": eval_res["diagnosis"],
            "prediction": ml_res
        }

        self._store_measurement(record)

        if self.api_base_url:
            try:
                requests.post(f"{self.api_base_url}/api/cells/{cell_id}/metrics", json=record, timeout=2)
            except Exception:
                pass

        return record

    def _store_measurement(self, rec: Dict[str, Any]):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO measurements (
                cell, users, load, throughput, latency, packet_loss,
                signal_strength, traffic_volume, congestion_status,
                congestion_score, cause_diagnosis
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                rec["cell"],
                rec["users"],
                rec["load"],
                rec["throughput"],
                rec["latency"],
                rec["packet_loss"],
                rec["signal_strength"],
                rec["traffic_volume"],
                rec["congestion_status"],
                rec["congestion_score"],
                rec["diagnosis"]["diagnosis_type"]
            )
        )
        conn.commit()
        conn.close()

if __name__ == "__main__":
    collector = NetworkCollector()
    print("Testing single-cycle collection...")
    res_a = collector.collect_cell("cell_a")
    res_b = collector.collect_cell("cell_b")
    print(f"Cell A: {res_a['congestion_status']} (Score: {res_a['congestion_score']})")
    print(f"Cell B: {res_b['congestion_status']} (Score: {res_b['congestion_score']})")
