# REST API Documentation

This document describes all REST API endpoints provided by the **Smart Mobile Network Congestion Detection and Optimization System**.
Both the **Python Flask backend (`http://localhost:5000`)** and the **Web Dev Server (`http://localhost:3000`)** expose these endpoints.

---

## 1. Overall System Metrics

### `GET /api/metrics`
Retrieves aggregated network telemetry across all access points.

**Response:**
```json
{
  "total_users": 8,
  "average_load": 52.5,
  "average_throughput": 21.4,
  "average_latency": 85.0,
  "packet_loss": 2.75,
  "overall_congestion_status": "Severe",
  "cells": {
    "cell_a": {
      "users": 6,
      "load": 84.0,
      "throughput": 4.2,
      "latency": 148.0,
      "packet_loss": 5.4,
      "signal_strength": -53.0,
      "congestion_score": 86.2,
      "congestion_status": "Severe"
    },
    "cell_b": {
      "users": 2,
      "load": 21.0,
      "throughput": 38.6,
      "latency": 22.0,
      "packet_loss": 0.1,
      "signal_strength": -58.0,
      "congestion_score": 16.5,
      "congestion_status": "Normal"
    }
  }
}
```

---

## 2. Load and Capacity

### `GET /api/load`
Returns channel airtime utilization for Cell A, Cell B, and average load.

**Response:**
```json
{
  "cell_a_load": 84.0,
  "cell_b_load": 21.0,
  "overall_load": 52.5,
  "imbalance": 63.0
}
```

---

## 3. Throughput & Latency

### `GET /api/throughput`
**Response:**
```json
{
  "cell_a_throughput": 4.2,
  "cell_b_throughput": 38.6,
  "aggregate_throughput": 42.8,
  "unit": "Mbps"
}
```

### `GET /api/latency`
**Response:**
```json
{
  "cell_a_latency": 148.0,
  "cell_b_latency": 22.0,
  "average_latency": 85.0,
  "unit": "ms"
}
```

### `GET /api/packet-loss`
**Response:**
```json
{
  "cell_a_packet_loss": 5.4,
  "cell_b_packet_loss": 0.1,
  "unit": "%"
}
```

---

## 4. Cell-Specific Telemetry & Ingestion

### `GET /api/cells/<cell>/metrics`
Returns current metrics and diagnosis for `cell_a` or `cell_b`.

### `POST /api/cells/<cell>/metrics`
Ingests real-time measurements from Python background collectors, laptops, or Android smartphones.

**Sample Request Body:**
```json
{
  "users": 6,
  "load": 82.0,
  "throughput": 4.2,
  "latency": 145.0,
  "packet_loss": 5.1,
  "signal_strength": -55.0
}
```

**Response:**
```json
{
  "status": "success",
  "cell": "cell_a",
  "metrics": {
    "users": 6,
    "load": 82.0,
    "throughput": 4.2,
    "latency": 145.0,
    "packet_loss": 5.1,
    "signal_strength": -55.0,
    "congestion_score": 84.0,
    "congestion_status": "Severe"
  }
}
```

---

## 5. Congestion Detection & ML Prediction

### `POST /api/detection`
Evaluates multi-KPI vector and outputs composite score (0–100) and Coverage vs Capacity diagnosis.

### `POST /api/predict`
Calculates imminent congestion risk probability percentage (0–100%) and predicted severity class using the trained Random Forest classifier.

**Response:**
```json
{
  "predicted_class": "Severe",
  "congestion_risk_pct": 84.2,
  "confidence_pct": 91.5,
  "feature_contributions": {
    "load": 29.4,
    "latency": 23.5,
    "packet_loss": 18.2,
    "user_count": 10.8,
    "throughput_choke": 7.4
  }
}
```

---

## 6. Optimization & Traffic Steering

### `GET /api/optimize`
Generates traffic steering recommendation based on cell imbalance.

### `POST /api/optimize`
Executes traffic steering, migrates selected devices to target cell, and records Section 30 Before vs After delta metrics.

---

## 7. Data Export

### `GET /api/export?format=csv`
Downloads testbed telemetry dataset in CSV format.

### `GET /api/export?format=json`
Returns full testbed state snapshot in JSON format.
