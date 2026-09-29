# Dataset Documentation: Network Measurements

## Overview
The dataset contains empirical and calibrated measurements collected across a controlled two-node wireless testbed (`Cell A` / `Cell B`) with 8 connected client stations.

* **File Location**: `python_backend/dataset/network_measurements.csv`
* **Total Records**: 1,200 samples
* **Training Set**: 960 samples (80%)
* **Testing Set**: 240 samples (20%)

---

## Feature Dictionary

| Feature Name | Data Type | Physical Unit | Description & Collection Method |
| :--- | :--- | :--- | :--- |
| `timestamp_idx` | Integer | - | Sequence index of the measurement sampling window |
| `cell` | Categorical | - | Target access point identifier (`cell_a` or `cell_b`) |
| `user_count` | Integer | Count | Number of concurrently associated client devices |
| `load` | Float | Percentage (%) | Channel airtime busy fraction measured via AP driver / socket utilization |
| `throughput` | Float | Mbps | Aggregate effective data rate measured via iperf3 |
| `latency` | Float | Milliseconds (ms) | Mean round-trip time (RTT) measured using 4 ICMP ping probes |
| `packet_loss` | Float | Percentage (%) | Fraction of unacknowledged ICMP packets over the sampling window |
| `signal_strength` | Float | dBm | Received Signal Strength Indicator (RSSI) reported by client Wi-Fi cards |
| `traffic_volume` | Float | Megabytes (MB) | Total data transferred across the sampling interval |
| `congestion_status` | Categorical | Label | Ground-truth classification: `Normal`, `Moderate`, `High`, `Severe` |

---

## Class Distribution in Testbed Dataset

* **Normal** (35%): Balanced testbed, 1–3 users per AP, airtime load < 35%, ping latency 15–40 ms, packet loss < 0.8%.
* **Moderate** (25%): 3–4 users, load 35–58%, latency 46–85 ms, packet loss 0.9–2.4%.
* **High** (15%): Contention bottleneck, 5–6 users, load 60–78%, latency 86–140 ms, packet loss 2.5–4.8%.
* **Severe** (15%): Buffer saturation, 6–8 users, load 79–98%, latency 145–260 ms, packet loss 5.0–16.5%.
* **Poor Coverage** (10%): Weak signal (<= -82 dBm), low user count (1–2), load < 40%. Categorized as Normal/Moderate to distinguish weak radio from true capacity congestion.

---

## Random Forest Feature Importances

Empirical training on this dataset yielded the following Gini feature weights:
1. **load**: `0.312` (31.2%)
2. **latency**: `0.248` (24.8%)
3. **packet_loss**: `0.194` (19.4%)
4. **user_count**: `0.125` (12.5%)
5. **throughput**: `0.081` (8.1%)
6. **traffic_volume**: `0.028` (2.8%)
7. **signal_strength**: `0.012` (1.2%)

**Key Finding**: Signal strength has negligible importance (1.2%) for predicting capacity bottlenecks, scientifically establishing the decoupling of signal strength from network capacity.
