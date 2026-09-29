"""
Network Monitoring and Optimization Configuration
Academic Testbed: 2 Wi-Fi APs representing Cell A and Cell B
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = os.path.join(BASE_DIR, "database", "network.db")
MODEL_PATH = os.path.join(BASE_DIR, "ml", "congestion_model.pkl")
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "network_measurements.csv")

# Testbed Access Points
CELLS = {
    "cell_a": {
        "id": "cell_a",
        "name": "Cell A (Node A)",
        "ssid": "SmartNet_A",
        "ip_gateway": "192.168.1.1",
        "iperf_port": 5201,
        "max_capacity_mbps": 50.0,
        "role": "Potentially congested network node"
    },
    "cell_b": {
        "id": "cell_b",
        "name": "Cell B (Node B)",
        "ssid": "SmartNet_B",
        "ip_gateway": "192.168.2.1",
        "iperf_port": 5202,
        "max_capacity_mbps": 50.0,
        "role": "Underutilized / available network node"
    }
}

# Measurement & Poll Intervals
COLLECTION_INTERVAL_SECONDS = 3.0
PING_COUNT = 4
PING_TIMEOUT_SECONDS = 2

# Congestion Detection Thresholds (Configurable)
CONGESTION_THRESHOLDS = {
    "load_severe": 80.0,
    "load_high": 60.0,
    "load_moderate": 35.0,
    "latency_severe_ms": 150.0,
    "latency_high_ms": 100.0,
    "latency_moderate_ms": 70.0,
    "packet_loss_severe_pct": 5.0,
    "packet_loss_high_pct": 3.0,
    "packet_loss_moderate_pct": 1.5,
    "signal_good_threshold_dbm": -70.0,  # Higher than -70 dBm is good signal
    "signal_poor_threshold_dbm": -82.0   # Lower than -82 dBm is poor coverage
}

# Weighted Congestion Scoring Weights (Total = 1.0)
CONGESTION_WEIGHTS = {
    "load": 0.35,
    "latency": 0.25,
    "packet_loss": 0.20,
    "throughput": 0.10,
    "user_density": 0.10
}

# Flask Server Config
FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
DEBUG = True
