package com.smartnet.congestiondetector

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.util.Log
import kotlinx.coroutines.*
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.math.roundToInt

/**
 * Academic Network Measurement Collector for Android Devices.
 * Periodically measures RSSI, Ping Latency, and Packet Loss,
 * and POSTs telemetry to the Smart Network Flask / Express REST API.
 */
class NetworkDataCollector(
    private val context: Context,
    private val serverBaseUrl: String = "http://192.168.1.100:5000",
    private val deviceId: String = "phone-1",
    private val deviceName: String = "Pixel 8 Pro"
) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isRunning = false
    private val TAG = "NetworkDataCollector"

    fun startCollection(intervalMs: Long = 3000L) {
        if (isRunning) return
        isRunning = true
        scope.launch {
            while (isActive && isRunning) {
                try {
                    val metrics = collectLocalMetrics()
                    sendMetricsToServer(metrics)
                } catch (e: Exception) {
                    Log.e(TAG, "Error in collection loop: ${e.message}")
                }
                delay(intervalMs)
            }
        }
    }

    fun stopCollection() {
        isRunning = false
        scope.cancel()
    }

    private fun collectLocalMetrics(): JSONObject {
        val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val wifiInfo: WifiInfo? = wifiManager.connectionInfo

        val rawSsid = wifiInfo?.ssid?.replace("\"", "") ?: "Unknown"
        val rssi = wifiInfo?.rssi ?: -99
        val linkSpeedMbps = wifiInfo?.linkSpeed ?: 0

        // Map SSID to cell_a or cell_b
        val targetCell = if (rawSsid.contains("SmartNet_B", ignoreCase = true)) "cell_b" else "cell_a"

        // Measure ping to gateway or server
        val pingStats = executePing("192.168.1.1", count = 3)

        return JSONObject().apply {
            put("device_id", deviceId)
            put("device_name", deviceName)
            put("cell", targetCell)
            put("ssid", rawSsid)
            put("signal_strength", rssi)
            put("link_speed_mbps", linkSpeedMbps)
            put("latency", pingStats.avgLatencyMs)
            put("packet_loss", pingStats.packetLossPct)
            put("timestamp", System.currentTimeMillis())
        }
    }

    private fun executePing(host: String, count: Int = 3): PingResult {
        return try {
            val process = Runtime.getRuntime().exec("/system/bin/ping -c $count -W 2 $host")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            var line: String?
            var avgLatency = 20.0
            var packetLoss = 0.0

            while (reader.readLine().also { line = it } != null) {
                val l = line!!
                if (l.contains("% packet loss")) {
                    val lossPattern = Regex("(\\d+(?:\\.\\d+)?)% packet loss")
                    lossPattern.find(l)?.let {
                        packetLoss = it.groupValues[1].toDoubleOrNull() ?: 0.0
                    }
                }
                if (l.contains("rtt min/avg/max")) {
                    val rttPattern = Regex("min/avg/max/[a-zA-Z]+\\s*=\\s*[\\d.]+/([\\d.]+)")
                    rttPattern.find(l)?.let {
                        avgLatency = it.groupValues[1].toDoubleOrNull() ?: 20.0
                    }
                }
            }
            process.waitFor()
            PingResult(avgLatency, packetLoss)
        } catch (e: Exception) {
            PingResult(25.0, 0.0)
        }
    }

    private fun sendMetricsToServer(payload: JSONObject) {
        val cell = payload.getString("cell")
        val url = URL("$serverBaseUrl/api/cells/$cell/metrics")
        val conn = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            setRequestProperty("Content-Type", "application/json; utf-8")
            doOutput = true
            connectTimeout = 3000
            readTimeout = 3000
        }

        OutputStreamWriter(conn.outputStream).use { writer ->
            writer.write(payload.toString())
            writer.flush()
        }

        val code = conn.responseCode
        if (code in 200..299) {
            Log.d(TAG, "Successfully reported telemetry for $deviceId to $cell")
        } else {
            Log.w(TAG, "Server responded with HTTP $code")
        }
        conn.disconnect()
    }

    data class PingResult(val avgLatencyMs: Double, val packetLossPct: Double)
}
