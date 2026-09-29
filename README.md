# Smart Mobile Network Congestion Detection and Optimization System for Crowded Areas

## Academic Project Overview (PBL / Research Prototype)

This project is an **academic controlled-testbed prototype** designed to investigate and solve a fundamental wireless networking challenge:

> **In high-density environments (campuses, auditoriums, stadiums, railway stations, airports, malls), mobile users frequently see full signal bars (-50 dBm to -60 dBm RSSI) yet experience buffer stalls, high latency, and degraded throughput.**

### Core Networking Principle Demonstrated:
**Strong signal strength does not guarantee sufficient network capacity.**

Radio signal strength (RSSI/RSRP) merely indicates proximity and RF link attenuation to the Access Point. In crowded areas, the true bottleneck is **wireless channel airtime saturation, CSMA/CA MAC backoff contention, and AP queue bufferbloat** caused by competing mobile stations.

---

## Controlled Hardware Testbed Architecture

```text
                               ┌───────────────────────────┐
                               │   Laptop 1 (Controller)   │
                               │  Flask/Express + SQLite   │
                               │   Scikit-Learn ML Model   │
                               └─────────────┬─────────────┘
                                             │
                                     Ethernet Switch
                                             │
                                    ┌────────┴────────┐
                                    │                 │
                             ┌──────▼─────┐    ┌──────▼─────┐
                             │    AP A    │    │    AP B    │
                             │   Cell A   │    │   Cell B   │
                             │SmartNet_A  │    │SmartNet_B  │
                             │  2.4 GHz   │    │  5.0 GHz   │
                             └──────┬─────┘    └──────┬─────┘
                                    │                 │
                             Wi-Fi  │                 │  Wi-Fi
                               ┌────┴───┐         ┌───┴────┐
                               │        │         │        │
                             Phones   Laptops   Phones   Laptops
                             (1 - 4)    (3)       (5)     (1 - 2)
```

### Hardware Equipment:
1. **2 Wireless Access Points (Routers)**:
   - **Cell A**: SSID `SmartNet_A`, 2.4 GHz (Channel 6), Gateway IP `192.168.1.1` *(Potentially congested node)*
   - **Cell B**: SSID `SmartNet_B`, 5.0 GHz (Channel 36), Gateway IP `192.168.2.1` *(Underutilized / available node)*
2. **Mobile Clients**:
   - 4–5 Smartphones (Android / iOS)
   - 2–3 Laptops (Windows / macOS / Linux)
3. **Gigabit Ethernet Switch & Cat6 Cables**

---

## System Workflow Pipeline

```text
NETWORK TESTBED
      ↓
REAL DATA COLLECTION (Ping + iperf3 + Wi-Fi RSSI)
      ↓
COMPOSITE CONGESTION DETECTION (0–100 Weighted Score)
      ↓
COVERAGE VS. CAPACITY ANALYSIS (Decoupling RSSI from Bufferbloat)
      ↓
ML CONGESTION RISK FORECASTING (Random Forest Classifier)
      ↓
OPTIMIZATION ENGINE (Automated / Recommended Traffic Steering)
      ↓
BEFORE vs. AFTER PERFORMANCE EVALUATION
      ↓
WEB NETWORK OPERATIONS CENTER (NOC) DASHBOARD
```

---

## Directory Structure

```text
├── README.md                      # Comprehensive academic guide
├── API_DOCUMENTATION.md           # Full REST API specification
├── EXPERIMENT_GUIDE.md            # Step-by-step procedures for the 6 experiments
├── DATASET_DOCUMENTATION.md       # Feature dictionary & ML training data schema
│
├── python_backend/                # Complete Standalone Python Flask System
│   ├── app.py                     # Flask REST API server (Port 5000)
│   ├── config.py                  # Thresholds, cell parameters, paths
│   ├── requirements.txt           # Python dependencies
│   ├── database/
│   │   ├── schema.sql             # SQLite database schema
│   │   └── network.db             # SQLite database file
│   ├── collector/
│   │   ├── collector.py           # Master collection daemon
│   │   ├── ping_monitor.py        # ICMP RTT & packet loss monitor
│   │   ├── traffic_monitor.py     # iperf3 bandwidth & throughput collector
│   │   └── wifi_monitor.py        # Cross-platform RSSI monitor (nmcli/netsh)
│   ├── detection/
│   │   └── congestion_detector.py # 5-KPI scoring & Coverage vs Capacity logic
│   ├── optimization/
│   │   └── load_balancer.py       # Client redistribution & delta calculator
│   ├── ml/
│   │   ├── train_model.py         # Random Forest training & evaluation
│   │   ├── predict.py             # Real-time risk probability forecaster
│   │   └── model_evaluation.json  # Accuracy, F1, and Confusion Matrix
│   └── dataset/
│       ├── generate_dataset.py    # Empirical dataset synthesizer
│       └── network_measurements.csv # 1,200 collected records
│
├── android_companion/             # Optional Android Measurement App
│   ├── README.md                  # Android installation & permissions
│   ├── AndroidManifest.xml        # Background service & Wi-Fi permissions
│   └── NetworkDataCollector.kt    # Kotlin measurement & REST ingestion service
│
├── src/                           # Modern Responsive Web NOC Dashboard (React + Vite)
│   ├── components/                # Modular UI views (Overview, Topology, Charts, etc.)
│   ├── types/                     # TypeScript definitions
│   └── utils/                     # Telemetry & scoring utilities
└── vite.config.ts                 # Full-stack REST API middleware + Vite server
```

---

## Quick Start & Installation

### Option 1: Live Web Dashboard (Running on Port 3000)
The web dashboard provides the complete interactive Network Operations Center (NOC) with simulated testbed streaming, live chart plotting, scenario injection, and REST API endpoints.

```bash
# Install dependencies
npm install

# Run dev server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

### Option 2: Running the Python Flask Backend on a Physical Laptop
To connect real access points and physical smartphones:

```bash
cd python_backend

# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train the Random Forest Machine Learning Model
python3 ml/train_model.py

# 4. Start the Flask REST API Server
python3 app.py
```
The Flask API will run on `http://0.0.0.0:5000`.

---

## Traffic Generation with iperf3

To generate controlled network congestion during laboratory demonstrations:

1. **Start the iperf3 server on the Controller laptop:**
   ```bash
   iperf3 -s -p 5201
   ```

2. **Generate heavy traffic from client laptops/phones connected to Cell A:**
   ```bash
   # Generate 30 seconds of multi-stream TCP traffic
   iperf3 -c 192.168.1.100 -p 5201 -t 30 -P 4
   ```

3. Observe immediate latency jumps (bufferbloat) and packet drops on Cell A in the dashboard!

---

## Academic Positioning
> **This system is an academic research prototype demonstrating traffic-steering and congestion-mitigation principles in a controlled multi-node Wi-Fi testbed. It does not claim direct control over commercial cellular carriers (Jio, Airtel, Vi).**
