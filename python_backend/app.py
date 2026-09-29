"""
Flask REST API for Smart Mobile Network Congestion Detection and Optimization System
Provides all endpoints requested in Section 16 of the academic specification.
"""

import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from config import DB_PATH, CELLS, CONGESTION_THRESHOLDS
from detection.congestion_detector import CongestionDetector
from optimization.load_balancer import LoadBalancer
from ml.predict import CongestionPredictor

app = Flask(__name__)
CORS(app)

detector = CongestionDetector()
load_balancer = LoadBalancer()
predictor = CongestionPredictor()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Mock in-memory testbed state for live responsive dashboard
testbed_state = {
    "cell_a": {
        "cell": "cell_a",
        "name": "Cell A (SmartNet_A)",
        "users": 6,
        "load": 82.0,
        "throughput": 4.2,
        "latency": 145.0,
        "packet_loss": 5.1,
        "signal_strength": -55.0,
        "traffic_volume": 42.0,
        "congestion_score": 84.0,
        "congestion_status": "Severe"
    },
    "cell_b": {
        "cell": "cell_b",
        "name": "Cell B (SmartNet_B)",
        "users": 2,
        "load": 22.0,
        "throughput": 38.5,
        "latency": 24.0,
        "packet_loss": 0.2,
        "signal_strength": -58.0,
        "traffic_volume": 14.0,
        "congestion_score": 18.0,
        "congestion_status": "Normal"
    },
    "devices": [
        {"id": "dev-1", "name": "Phone 1 (Pixel 8)", "device_type": "phone", "current_cell": "cell_a", "rssi_dbm": -52.0, "traffic_profile": "4K Video Stream", "bandwidth_demand_mbps": 12.0},
        {"id": "dev-2", "name": "Phone 2 (Samsung S23)", "device_type": "phone", "current_cell": "cell_a", "rssi_dbm": -54.0, "traffic_profile": "Continuous Speedtest", "bandwidth_demand_mbps": 18.0},
        {"id": "dev-3", "name": "Phone 3 (iPhone 15)", "device_type": "phone", "current_cell": "cell_a", "rssi_dbm": -56.0, "traffic_profile": "Gaming (Low latency)", "bandwidth_demand_mbps": 4.5},
        {"id": "dev-4", "name": "Phone 4 (OnePlus 11)", "device_type": "phone", "current_cell": "cell_a", "rssi_dbm": -55.0, "traffic_profile": "Cloud Backup Sync", "bandwidth_demand_mbps": 8.0},
        {"id": "dev-5", "name": "Laptop 3 (MacBook Air)", "device_type": "laptop", "current_cell": "cell_a", "rssi_dbm": -53.0, "traffic_profile": "Large File Download", "bandwidth_demand_mbps": 14.0},
        {"id": "dev-6", "name": "Phone 5 (Motorola Edge)", "device_type": "phone", "current_cell": "cell_a", "rssi_dbm": -58.0, "traffic_profile": "Web Browsing", "bandwidth_demand_mbps": 2.0},
        {"id": "dev-7", "name": "Laptop 2 (Dell XPS 15)", "device_type": "laptop", "current_cell": "cell_b", "rssi_dbm": -57.0, "traffic_profile": "Video Conference", "bandwidth_demand_mbps": 5.0},
        {"id": "dev-8", "name": "Laptop 1 (ThinkPad X1)", "device_type": "laptop", "current_cell": "cell_b", "rssi_dbm": -59.0, "traffic_profile": "Code Git Sync", "bandwidth_demand_mbps": 1.5}
    ],
    "optimization_history": [],
    "events": [
        {"timestamp": datetime.now().strftime("%H:%M:%S"), "type": "ALERT", "cell": "cell_a", "message": "High packet loss (5.1%) and latency (145 ms) detected on Cell A"},
        {"timestamp": datetime.now().strftime("%H:%M:%S"), "type": "CONGESTION", "cell": "cell_a", "message": "Cell A Congestion Score reached 84/100 (Severe)"}
    ]
}

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    total_users = ca["users"] + cb["users"]
    avg_load = round((ca["load"] + cb["load"]) / 2.0, 1)
    avg_tp = round((ca["throughput"] + cb["throughput"]) / 2.0, 2)
    avg_lat = round((ca["latency"] + cb["latency"]) / 2.0, 1)
    avg_loss = round((ca["packet_loss"] + cb["packet_loss"]) / 2.0, 2)

    overall_status = "Severe" if (ca["congestion_status"] == "Severe" or cb["congestion_status"] == "Severe") else (
        "High" if (ca["congestion_status"] == "High" or cb["congestion_status"] == "High") else (
            "Moderate" if (ca["congestion_status"] == "Moderate" or cb["congestion_status"] == "Moderate") else "Normal"
        )
    )

    return jsonify({
        "total_users": total_users,
        "average_load": avg_load,
        "average_throughput": avg_tp,
        "average_latency": avg_lat,
        "packet_loss": avg_loss,
        "overall_congestion_status": overall_status,
        "cells": {
            "cell_a": ca,
            "cell_b": cb
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route("/api/users", methods=["GET"])
def get_users():
    return jsonify({
        "devices": testbed_state["devices"],
        "total_connected": len(testbed_state["devices"]),
        "cell_a_users": testbed_state["cell_a"]["users"],
        "cell_b_users": testbed_state["cell_b"]["users"]
    })

@app.route("/api/load", methods=["GET"])
def get_load():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    return jsonify({
        "cell_a_load": ca["load"],
        "cell_b_load": cb["load"],
        "overall_load": round((ca["load"] + cb["load"]) / 2.0, 1),
        "imbalance": round(abs(ca["load"] - cb["load"]), 1)
    })

@app.route("/api/throughput", methods=["GET"])
def get_throughput():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    return jsonify({
        "cell_a_throughput": ca["throughput"],
        "cell_b_throughput": cb["throughput"],
        "aggregate_throughput": round(ca["throughput"] + cb["throughput"], 2),
        "unit": "Mbps"
    })

@app.route("/api/latency", methods=["GET"])
def get_latency():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    return jsonify({
        "cell_a_latency": ca["latency"],
        "cell_b_latency": cb["latency"],
        "average_latency": round((ca["latency"] + cb["latency"]) / 2.0, 1),
        "unit": "ms"
    })

@app.route("/api/packet-loss", methods=["GET"])
def get_packet_loss():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    return jsonify({
        "cell_a_packet_loss": ca["packet_loss"],
        "cell_b_packet_loss": cb["packet_loss"],
        "average_packet_loss": round((ca["packet_loss"] + cb["packet_loss"]) / 2.0, 2),
        "unit": "%"
    })

@app.route("/api/cells/<cell>/metrics", methods=["GET", "POST"])
def cell_metrics(cell):
    if cell not in ["cell_a", "cell_b"]:
        return jsonify({"error": "Unknown cell identifier. Use cell_a or cell_b"}), 404

    if request.method == "POST":
        payload = request.get_json(force=True)
        # Update metrics in testbed state
        for key in ["users", "load", "throughput", "latency", "packet_loss", "signal_strength"]:
            if key in payload:
                testbed_state[cell][key] = payload[key]

        # Re-evaluate congestion and diagnosis
        eval_res = detector.evaluate(testbed_state[cell])
        testbed_state[cell]["congestion_score"] = eval_res["congestion_score"]
        testbed_state[cell]["congestion_status"] = eval_res["congestion_status"]
        testbed_state[cell]["diagnosis"] = eval_res["diagnosis"]

        return jsonify({
            "status": "success",
            "cell": cell,
            "metrics": testbed_state[cell]
        })

    # GET
    eval_res = detector.evaluate(testbed_state[cell])
    return jsonify({
        "cell": cell,
        "metrics": testbed_state[cell],
        "diagnosis": eval_res["diagnosis"]
    })

@app.route("/api/detection", methods=["GET", "POST"])
def api_detection():
    data = request.get_json(silent=True) or testbed_state["cell_a"]
    eval_res = detector.evaluate(data)
    return jsonify(eval_res)

@app.route("/api/predict", methods=["GET", "POST"])
def api_predict():
    data = request.get_json(silent=True) or testbed_state["cell_a"]
    pred = predictor.predict(
        user_count=int(data.get("users", 5)),
        load_pct=float(data.get("load", 75.0)),
        throughput_mbps=float(data.get("throughput", 5.0)),
        latency_ms=float(data.get("latency", 120.0)),
        packet_loss_pct=float(data.get("packet_loss", 4.0)),
        signal_strength_dbm=float(data.get("signal_strength", -55.0)),
        traffic_volume_mb=float(data.get("traffic_volume", 40.0))
    )
    return jsonify(pred)

@app.route("/api/optimize", methods=["GET", "POST"])
def api_optimize():
    ca = testbed_state["cell_a"]
    cb = testbed_state["cell_b"]
    recommendation = load_balancer.generate_recommendation(ca, cb, testbed_state["devices"])

    if request.method == "POST":
        # Apply the recommendation
        if recommendation["needs_optimization"]:
            source = recommendation["source_cell"]
            target = recommendation["target_cell"]
            reassigned = []
            for dev in recommendation["recommended_devices"]:
                dev["current_cell"] = target
                reassigned.append(dev["name"])

            # Recalculate cell metrics after migration
            count_moved = len(reassigned)
            before_a = dict(ca)
            before_b = dict(cb)

            if source == "cell_a":
                ca["users"] = max(1, ca["users"] - count_moved)
                cb["users"] += count_moved
                ca["load"] = max(25.0, round(ca["load"] - (count_moved * 16.0), 1))
                cb["load"] = min(75.0, round(cb["load"] + (count_moved * 12.0), 1))
                ca["latency"] = max(28.0, round(ca["latency"] * 0.4, 1))
                ca["packet_loss"] = max(0.4, round(ca["packet_loss"] * 0.2, 2))
                ca["throughput"] = round(ca["throughput"] * 4.5, 2)
            else:
                cb["users"] = max(1, cb["users"] - count_moved)
                ca["users"] += count_moved
                cb["load"] = max(25.0, round(cb["load"] - (count_moved * 16.0), 1))
                ca["load"] = min(75.0, round(ca["load"] + (count_moved * 12.0), 1))
                cb["latency"] = max(28.0, round(cb["latency"] * 0.4, 1))
                cb["packet_loss"] = max(0.4, round(cb["packet_loss"] * 0.2, 2))
                cb["throughput"] = round(cb["throughput"] * 4.5, 2)

            # Re-evaluate congestion scores
            eval_a = detector.evaluate(ca)
            ca["congestion_score"] = eval_a["congestion_score"]
            ca["congestion_status"] = eval_a["congestion_status"]

            eval_b = detector.evaluate(cb)
            cb["congestion_score"] = eval_b["congestion_score"]
            cb["congestion_status"] = eval_b["congestion_status"]

            improvement = load_balancer.calculate_improvement(before_a, ca)

            event = {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "source_cell": source,
                "target_cell": target,
                "migrated_devices": reassigned,
                "before_load": before_a["load"],
                "after_load": ca["load"],
                "improvement": improvement
            }
            testbed_state["optimization_history"].append(event)
            testbed_state["events"].insert(0, {
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "type": "OPTIMIZATION",
                "cell": source,
                "message": f"Successfully migrated {count_moved} user(s) ({', '.join(reassigned)}) from {source.upper()} to {target.upper()}"
            })

            return jsonify({
                "status": "applied",
                "migrated_count": count_moved,
                "migrated_devices": reassigned,
                "before_metrics": before_a,
                "after_metrics": ca,
                "improvement": improvement
            })

    return jsonify(recommendation)

@app.route("/api/optimization/history", methods=["GET"])
def get_opt_history():
    return jsonify(testbed_state["optimization_history"])

@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify(testbed_state["events"])

@app.route("/api/history", methods=["GET"])
def get_history():
    # Return recent history measurements
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM measurements ORDER BY id DESC LIMIT 50")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/export", methods=["GET"])
def export_data():
    fmt = request.args.get("format", "csv").lower()
    if fmt == "json":
        return jsonify({
            "testbed_state": testbed_state,
            "export_time": datetime.now().isoformat()
        })

    # CSV export
    csv_data = "timestamp,cell,users,load,throughput,latency,packet_loss,signal_strength,congestion_status\n"
    for cell in ["cell_a", "cell_b"]:
        c = testbed_state[cell]
        csv_data += f"{datetime.now().isoformat()},{cell},{c['users']},{c['load']},{c['throughput']},{c['latency']},{c['packet_loss']},{c['signal_strength']},{c['congestion_status']}\n"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=network_measurements.csv"}
    )

if __name__ == "__main__":
    print(f"Starting Smart Network Flask Server on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=True)
