# Android Network Measurement Companion App

## Overview
This optional companion client runs on physical Android smartphones (e.g., Phone 1, Phone 2, etc.) deployed across **Cell A (`SmartNet_A`)** and **Cell B (`SmartNet_B`)**.

### Primary Roles:
1. **Radio Signal Monitoring**: Continuously extracts Wi-Fi RSSI (dBm), link speed, BSSID, and frequency band.
2. **End-to-End Latency Measurement**: Periodically runs lightweight ICMP/TCP pings against the testbed access point gateway.
3. **Telemetric Ingestion**: Sends real-time telemetry payloads to the Flask REST API at:
   ```http
   POST /api/cells/{cell_id}/metrics
   Content-Type: application/json
   ```

### Architecture:
```text
Android Smartphone
  ├── WifiManager (RSSI, SSID, BSSID, LinkSpeed)
  ├── PingService (RTT, Jitter, Packet Loss)
  └── OkHttpClient / Retrofit (Periodic REST POST)
            │
            ▼ (Wi-Fi)
  Access Point A / B (SmartNet_A / SmartNet_B)
            │
            ▼ (Ethernet Switch)
  Flask REST API (http://192.168.1.100:5000)
            │
            ▼
  SQLite + Machine Learning + Real-Time Web Dashboard
```

### Required Android Permissions:
* `android.permission.INTERNET`
* `android.permission.ACCESS_NETWORK_STATE`
* `android.permission.ACCESS_WIFI_STATE`
* `android.permission.ACCESS_FINE_LOCATION` (Required by Android 10+ to read Wi-Fi SSID and RSSI)
