"""
Congestion Detection Engine and Coverage vs Capacity Diagnosis
Implements:
1. Multi-KPI Weighted Congestion Scoring (0 - 100)
2. Coverage vs Capacity Distinguisher
"""

from typing import Dict, Any

class CongestionDetector:
    def __init__(self, thresholds: Dict[str, float] = None, weights: Dict[str, float] = None):
        self.thresholds = thresholds or {
            "load_severe": 80.0,
            "load_high": 60.0,
            "load_moderate": 35.0,
            "latency_severe_ms": 150.0,
            "latency_high_ms": 100.0,
            "latency_moderate_ms": 70.0,
            "packet_loss_severe_pct": 5.0,
            "packet_loss_high_pct": 3.0,
            "packet_loss_moderate_pct": 1.5,
            "signal_good_threshold_dbm": -70.0,
            "signal_poor_threshold_dbm": -82.0
        }
        self.weights = weights or {
            "load": 0.35,
            "latency": 0.25,
            "packet_loss": 0.20,
            "throughput": 0.10,
            "user_density": 0.10
        }

    def compute_congestion_score(
        self,
        load_pct: float,
        latency_ms: float,
        packet_loss_pct: float,
        throughput_mbps: float,
        user_count: int,
        nominal_capacity_mbps: float = 50.0
    ) -> float:
        """
        Computes composite Congestion Score between 0.0 and 100.0
        """
        # Load component (0 - 100)
        s_load = min(100.0, max(0.0, float(load_pct)))

        # Latency component (0 - 100): 20ms = 0 score, 200ms+ = 100 score
        s_latency = min(100.0, max(0.0, (float(latency_ms) - 20.0) / 1.8))

        # Packet loss component (0 - 100): 0% = 0 score, 10%+ = 100 score
        s_loss = min(100.0, max(0.0, float(packet_loss_pct) * 10.0))

        # Throughput degradation component: if load is high and throughput per user is throttled
        expected_per_user = nominal_capacity_mbps / max(1, user_count)
        actual_per_user = throughput_mbps / max(1, user_count)
        throughput_choke = max(0.0, 1.0 - (actual_per_user / max(0.1, expected_per_user)))
        s_throughput = min(100.0, throughput_choke * 100.0)

        # User density component: 1-2 users = low, 7+ users = high contention
        s_users = min(100.0, (user_count / 8.0) * 100.0)

        composite = (
            s_load * self.weights["load"] +
            s_latency * self.weights["latency"] +
            s_loss * self.weights["packet_loss"] +
            s_throughput * self.weights["throughput"] +
            s_users * self.weights["user_density"]
        )
        return round(composite, 1)

    def classify_status(self, score: float) -> str:
        if score >= 76.0:
            return "Severe"
        elif score >= 51.0:
            return "High"
        elif score >= 31.0:
            return "Moderate"
        else:
            return "Normal"

    def diagnose_root_cause(
        self,
        signal_dbm: float,
        load_pct: float,
        users: int,
        latency_ms: float,
        packet_loss_pct: float,
        throughput_mbps: float
    ) -> Dict[str, Any]:
        """
        Distinguishes Poor Coverage from Capacity Congestion
        """
        is_strong_signal = signal_dbm >= self.thresholds["signal_good_threshold_dbm"]
        is_weak_signal = signal_dbm <= self.thresholds["signal_poor_threshold_dbm"]

        is_overloaded = load_pct >= self.thresholds["load_high"] or users >= 5
        has_bufferbloat = latency_ms >= self.thresholds["latency_high_ms"] or packet_loss_pct >= self.thresholds["packet_loss_high_pct"]

        if is_strong_signal and (is_overloaded or has_bufferbloat):
            diagnosis_type = "CAPACITY_CONGESTION"
            signal_quality = "EXCELLENT / GOOD"
            capacity_status = "OVERLOADED / CONGESTED"
            probable_cause = "HIGH USER DENSITY & TRAFFIC CONTENTION"
            explanation = (
                f"Device reports strong RF signal ({signal_dbm} dBm), yet suffers from severe latency "
                f"({latency_ms} ms) and packet loss ({packet_loss_pct}%). The bottleneck is wireless media contention "
                f"and AP buffer saturation due to {users} competing clients."
            )
        elif is_weak_signal and load_pct < 50.0:
            diagnosis_type = "POOR_COVERAGE"
            signal_quality = "WEAK / DEGRADED"
            capacity_status = "UNDERUTILIZED"
            probable_cause = "RF ATTENUATION / DISTANCE FROM ACCESS POINT"
            explanation = (
                f"Poor wireless signal ({signal_dbm} dBm) causing packet retransmissions at low throughput. "
                f"The serving AP has ample spare capacity ({load_pct}% load), but the physical radio link is weak."
            )
        elif is_overloaded:
            diagnosis_type = "MODERATE_CONTENTION"
            signal_quality = "ACCEPTABLE"
            capacity_status = "ELEVATED LOAD"
            probable_cause = "INCREASING DEMAND"
            explanation = f"Network utilization is elevated ({load_pct}%). Monitoring for imminent buffer saturation."
        else:
            diagnosis_type = "NORMAL_OPERATION"
            signal_quality = "NORMAL"
            capacity_status = "HEALTHY"
            probable_cause = "NONE"
            explanation = "Network operating within nominal latency and capacity parameters."

        return {
            "diagnosis_type": diagnosis_type,
            "signal_quality": signal_quality,
            "capacity_status": capacity_status,
            "probable_cause": probable_cause,
            "explanation": explanation
        }

    def evaluate(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete evaluation pipeline for a cell
        """
        load = float(metrics.get("load", 0.0))
        lat = float(metrics.get("latency", 20.0))
        loss = float(metrics.get("packet_loss", 0.0))
        tp = float(metrics.get("throughput", 10.0))
        users = int(metrics.get("users", 1))
        sig = float(metrics.get("signal_strength", -55.0))

        score = self.compute_congestion_score(load, lat, loss, tp, users)
        status = self.classify_status(score)
        diagnosis = self.diagnose_root_cause(sig, load, users, lat, loss, tp)

        return {
            "congestion_score": score,
            "congestion_status": status,
            "diagnosis": diagnosis,
            "metrics": {
                "load": load,
                "latency": lat,
                "packet_loss": loss,
                "throughput": tp,
                "users": users,
                "signal_strength": sig
            }
        }
