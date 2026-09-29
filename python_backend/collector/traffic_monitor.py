"""
Throughput and Traffic Volume Monitor
Integrates with iperf3 client or network interface statistics
"""

import subprocess
import json
import shutil
from typing import Dict, Any

class TrafficMonitor:
    def __init__(self, iperf_server: str = "127.0.0.1", port: int = 5201):
        self.iperf_server = iperf_server
        self.port = port
        self.has_iperf3 = shutil.which("iperf3") is not None

    def run_iperf_test(self, duration_sec: int = 2) -> Dict[str, Any]:
        """
        Executes iperf3 test if client/server are present, otherwise falls back gracefully
        """
        if not self.has_iperf3:
            return {
                "available": False,
                "throughput_mbps": 0.0,
                "traffic_volume_mb": 0.0,
                "msg": "iperf3 binary not found in system PATH"
            }

        try:
            cmd = [
                "iperf3",
                "-c", self.iperf_server,
                "-p", str(self.port),
                "-t", str(duration_sec),
                "-J" # JSON output
            ]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=duration_sec + 3)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                end = data.get("end", {})
                sum_sent = end.get("sum_sent", {})
                bps = sum_sent.get("bits_per_second", 0.0)
                bytes_sent = sum_sent.get("bytes", 0.0)
                return {
                    "available": True,
                    "throughput_mbps": round(bps / 1_000_000.0, 2),
                    "traffic_volume_mb": round(bytes_sent / (1024 * 1024.0), 2),
                    "msg": "Real iperf3 measurement successful"
                }
            else:
                return {
                    "available": False,
                    "throughput_mbps": 0.0,
                    "traffic_volume_mb": 0.0,
                    "msg": f"iperf3 server at {self.iperf_server}:{self.port} not responding"
                }
        except Exception as e:
            return {
                "available": False,
                "throughput_mbps": 0.0,
                "traffic_volume_mb": 0.0,
                "msg": str(e)
            }
