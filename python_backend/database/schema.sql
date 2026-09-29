-- SQLite Schema for Smart Mobile Network Congestion Detection and Optimization System

CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cell TEXT NOT NULL,
    users INTEGER NOT NULL,
    load REAL NOT NULL,
    throughput REAL NOT NULL,
    latency REAL NOT NULL,
    packet_loss REAL NOT NULL,
    signal_strength REAL NOT NULL,
    traffic_volume REAL NOT NULL,
    congestion_status TEXT NOT NULL,
    congestion_score REAL DEFAULT 0.0,
    cause_diagnosis TEXT DEFAULT 'NORMAL'
);

CREATE TABLE IF NOT EXISTS congestion_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cell TEXT NOT NULL,
    congestion_score REAL NOT NULL,
    congestion_status TEXT NOT NULL,
    probable_cause TEXT NOT NULL,
    signal_strength REAL NOT NULL,
    load REAL NOT NULL,
    users INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS optimization_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    source_cell TEXT NOT NULL,
    target_cell TEXT NOT NULL,
    users_migrated INTEGER NOT NULL,
    device_names TEXT NOT NULL,
    before_source_load REAL NOT NULL,
    after_source_load REAL NOT NULL,
    before_source_latency REAL NOT NULL,
    after_source_latency REAL NOT NULL,
    before_source_throughput REAL NOT NULL,
    after_source_throughput REAL NOT NULL,
    before_source_packet_loss REAL NOT NULL,
    after_source_packet_loss REAL NOT NULL,
    status TEXT DEFAULT 'COMPLETED'
);

CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'phone', 'laptop'
    mac_address TEXT,
    ip_address TEXT,
    current_cell TEXT NOT NULL,
    rssi_dbm REAL NOT NULL,
    traffic_profile TEXT NOT NULL, -- '4K Video', 'Speedtest', 'Gaming', 'Web', 'Idle'
    bandwidth_demand_mbps REAL NOT NULL,
    connected_since DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    cell TEXT NOT NULL,
    predicted_class TEXT NOT NULL,
    congestion_risk_pct REAL NOT NULL,
    user_count INTEGER,
    load REAL,
    latency REAL,
    packet_loss REAL,
    throughput REAL
);
