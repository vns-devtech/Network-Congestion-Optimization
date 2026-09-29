"""
Load Balancer and Traffic Steering Optimization Engine
Calculates optimal device redistribution between Cell A and Cell B,
generates recommendations, simulates or applies steering, and evaluates Before vs After KPIs.
"""

import math
from typing import Dict, Any, List

class LoadBalancer:
    def __init__(self, target_max_imbalance_pct: float = 15.0):
        self.target_max_imbalance_pct = target_max_imbalance_pct

    def generate_recommendation(
        self,
        cell_a_metrics: Dict[str, Any],
        cell_b_metrics: Dict[str, Any],
        devices: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyzes current loads and determines if traffic steering is warranted
        """
        load_a = float(cell_a_metrics.get("load", 0.0))
        load_b = float(cell_b_metrics.get("load", 0.0))
        users_a = int(cell_a_metrics.get("users", 0))
        users_b = int(cell_b_metrics.get("users", 0))

        load_diff = abs(load_a - load_b)
        needs_optimization = False
        source_cell = None
        target_cell = None
        suggested_migration_count = 0
        recommended_devices = []

        if load_a > load_b and (load_a >= 60.0 or load_diff >= self.target_max_imbalance_pct):
            needs_optimization = True
            source_cell = "cell_a"
            target_cell = "cell_b"
        elif load_b > load_a and (load_b >= 60.0 or load_diff >= self.target_max_imbalance_pct):
            needs_optimization = True
            source_cell = "cell_b"
            target_cell = "cell_a"

        if needs_optimization:
            # Estimate how many users to move to balance the network
            source_users = users_a if source_cell == "cell_a" else users_b
            target_users = users_b if source_cell == "cell_a" else users_a

            # Target balanced users = (total_users) / 2
            total_users = source_users + target_users
            target_even = math.ceil(total_users / 2.0)
            suggested_migration_count = max(1, min(source_users - 1, source_users - target_even))

            # Pick candidates from source cell (prioritize high bandwidth consumers like video stream/speedtest)
            candidates = [d for d in devices if d.get("current_cell") == source_cell]
            # Sort by demand descending
            candidates.sort(key=lambda d: d.get("bandwidth_demand_mbps", 0.0), reverse=True)
            recommended_devices = candidates[:suggested_migration_count]

        # Projected metrics after redistribution
        expected_results = self.project_post_optimization_kpis(
            cell_a_metrics,
            cell_b_metrics,
            source_cell,
            suggested_migration_count
        )

        return {
            "needs_optimization": needs_optimization,
            "source_cell": source_cell,
            "target_cell": target_cell,
            "suggested_migration_count": suggested_migration_count,
            "recommended_devices": recommended_devices,
            "current_state": {
                "cell_a_load": load_a,
                "cell_b_load": load_b,
                "cell_a_users": users_a,
                "cell_b_users": users_b,
                "load_imbalance": round(load_diff, 1)
            },
            "recommendation_text": (
                f"{'Cell A' if source_cell == 'cell_a' else 'Cell B'} is experiencing capacity overload ({round(max(load_a, load_b), 1)}% load). "
                f"Steer {suggested_migration_count} user(s) to {'Cell B' if target_cell == 'cell_b' else 'Cell A'} to relieve wireless contention."
                if needs_optimization else "Network traffic is balanced within nominal thresholds. No steering action required."
            ),
            "expected_results": expected_results
        }

    def project_post_optimization_kpis(
        self,
        cell_a: Dict[str, Any],
        cell_b: Dict[str, Any],
        source: str,
        migration_count: int
    ) -> Dict[str, Any]:
        """
        Projects mathematical expectations after load balancing
        """
        if not source or migration_count == 0:
            return {}

        u_a = cell_a.get("users", 1)
        u_b = cell_b.get("users", 1)

        if source == "cell_a":
            new_ua = max(1, u_a - migration_count)
            new_ub = u_b + migration_count
            load_factor_a = new_ua / max(1, u_a)
            load_factor_b = new_ub / max(1, u_b)

            return {
                "projected_cell_a_load": round(cell_a.get("load", 80) * load_factor_a * 0.85, 1),
                "projected_cell_b_load": round(min(85.0, cell_b.get("load", 20) + (migration_count * 12.0)), 1),
                "projected_latency_reduction_pct": 45.0,
                "projected_throughput_gain_pct": 60.0
            }
        else:
            new_ub = max(1, u_b - migration_count)
            new_ua = u_a + migration_count
            return {
                "projected_cell_b_load": round(cell_b.get("load", 80) * (new_ub / max(1, u_b)) * 0.85, 1),
                "projected_cell_a_load": round(min(85.0, cell_a.get("load", 20) + (migration_count * 12.0)), 1),
                "projected_latency_reduction_pct": 45.0,
                "projected_throughput_gain_pct": 60.0
            }

    def calculate_improvement(
        self,
        before_metrics: Dict[str, Any],
        after_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Computes Section 30 Before vs After Table with actual percentage improvements
        """
        def pct_change(before, after, lower_is_better=True):
            if before == 0:
                return 0.0
            diff = (before - after) if lower_is_better else (after - before)
            return round((diff / before) * 100.0, 1)

        b_load = before_metrics.get("load", 0.0)
        a_load = after_metrics.get("load", 0.0)

        b_tp = before_metrics.get("throughput", 0.0)
        a_tp = after_metrics.get("throughput", 0.0)

        b_lat = before_metrics.get("latency", 0.0)
        a_lat = after_metrics.get("latency", 0.0)

        b_loss = before_metrics.get("packet_loss", 0.0)
        a_loss = after_metrics.get("packet_loss", 0.0)

        return {
            "load": {
                "before": b_load,
                "after": a_load,
                "improvement_pct": pct_change(b_load, a_load, lower_is_better=True)
            },
            "throughput": {
                "before": b_tp,
                "after": a_tp,
                "improvement_pct": pct_change(b_tp, a_tp, lower_is_better=False)
            },
            "latency": {
                "before": b_lat,
                "after": a_lat,
                "improvement_pct": pct_change(b_lat, a_lat, lower_is_better=True)
            },
            "packet_loss": {
                "before": b_loss,
                "after": a_loss,
                "improvement_pct": pct_change(b_loss, a_loss, lower_is_better=True)
            }
        }
