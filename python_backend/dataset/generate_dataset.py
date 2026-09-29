"""
Synthetic & Empirical Dataset Generator for Mobile Network Congestion Testbed
Generates realistic multi-KPI datasets adhering to 802.11 / cellular physics:
- When user count is high (e.g. 5-8 users on 1 AP), CSMA/CA contention causes throughput drop, latency explosion (bufferbloat), and packet loss EVEN WITH -50 dBm signal strength!
- When signal is low (-85 dBm) but users are few (1-2), load is low, latency is moderate, throughput is low due to modulation MCS backoff, but packet loss is isolated.
"""

import csv
import random
import os
from pathlib import Path

def generate_dataset(num_samples: int = 1200, output_path: str = None):
    if not output_path:
        base_dir = Path(__file__).resolve().parent
        output_path = os.path.join(base_dir, "network_measurements.csv")

    headers = [
        "timestamp_idx",
        "cell",
        "user_count",
        "load",
        "throughput",
        "latency",
        "packet_loss",
        "signal_strength",
        "traffic_volume",
        "congestion_status"
    ]

    rows = []
    # We generate balanced scenario distributions:
    # 35% Normal (Balanced testbed, 1-3 users, low load)
    # 25% Moderate (3-4 users, rising demand)
    # 25% High/Severe Congestion (Capacity bottleneck: 5-8 users, strong signal, bufferbloat)
    # 15% Poor Coverage (Weak signal, low user count)

    for i in range(num_samples):
        r = random.random()
        cell = random.choice(["cell_a", "cell_b"])

        if r < 0.35:
            # Normal balanced
            status = "Normal"
            user_count = random.randint(1, 3)
            load = round(random.uniform(10.0, 34.0), 1)
            signal_strength = round(random.uniform(-65.0, -50.0), 1)
            latency = round(random.uniform(15.0, 45.0), 1)
            packet_loss = round(random.uniform(0.0, 0.8), 2)
            throughput = round(random.uniform(25.0, 48.0), 2)
            traffic_volume = round(throughput * random.uniform(0.8, 1.2), 2)

        elif r < 0.60:
            # Moderate
            status = "Moderate"
            user_count = random.randint(3, 5)
            load = round(random.uniform(35.0, 58.0), 1)
            signal_strength = round(random.uniform(-68.0, -52.0), 1)
            latency = round(random.uniform(46.0, 85.0), 1)
            packet_loss = round(random.uniform(0.9, 2.4), 2)
            throughput = round(random.uniform(14.0, 28.0), 2)
            traffic_volume = round(throughput * random.uniform(1.0, 1.4), 2)

        elif r < 0.85:
            # Capacity Congestion (High or Severe)
            user_count = random.randint(5, 8)
            signal_strength = round(random.uniform(-62.0, -48.0), 1) # Strong signal!
            if random.random() < 0.5:
                status = "High"
                load = round(random.uniform(60.0, 78.0), 1)
                latency = round(random.uniform(86.0, 140.0), 1)
                packet_loss = round(random.uniform(2.5, 4.8), 2)
                throughput = round(random.uniform(5.0, 15.0), 2)
            else:
                status = "Severe"
                load = round(random.uniform(79.0, 98.0), 1)
                latency = round(random.uniform(145.0, 260.0), 1)
                packet_loss = round(random.uniform(5.0, 16.5), 2)
                throughput = round(random.uniform(1.2, 6.0), 2)
            traffic_volume = round(random.uniform(30.0, 75.0), 2)

        else:
            # Poor Coverage (Weak signal, not capacity congestion)
            user_count = random.randint(1, 2)
            signal_strength = round(random.uniform(-89.0, -82.0), 1) # Weak signal
            load = round(random.uniform(12.0, 38.0), 1)
            latency = round(random.uniform(40.0, 90.0), 1)
            packet_loss = round(random.uniform(1.0, 4.0), 2)
            throughput = round(random.uniform(3.0, 9.0), 2)
            traffic_volume = round(random.uniform(4.0, 12.0), 2)
            # Classification rule: although signal is poor, the cell congestion itself is low/moderate
            status = "Normal" if load < 30 else "Moderate"

        rows.append([
            i + 1,
            cell,
            user_count,
            load,
            throughput,
            latency,
            packet_loss,
            signal_strength,
            traffic_volume,
            status
        ])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"Generated {len(rows)} testbed measurements at {output_path}")

if __name__ == "__main__":
    generate_dataset()
