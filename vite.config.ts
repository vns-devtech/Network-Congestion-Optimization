import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

// In-memory testbed state for REST API endpoints
const apiState = {
  cell_a: {
    cell: 'cell_a',
    name: 'Cell A (SmartNet_A)',
    users: 6,
    load: 84.0,
    throughput: 4.2,
    latency: 148.0,
    packet_loss: 5.4,
    signal_strength: -53.0,
    congestion_score: 86.2,
    congestion_status: 'Severe'
  },
  cell_b: {
    cell: 'cell_b',
    name: 'Cell B (SmartNet_B)',
    users: 2,
    load: 21.0,
    throughput: 38.6,
    latency: 22.0,
    packet_loss: 0.1,
    signal_strength: -58.0,
    congestion_score: 16.5,
    congestion_status: 'Normal'
  }
};

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'smartnet-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        if (pathname === '/api/metrics') {
          const totalUsers = apiState.cell_a.users + apiState.cell_b.users;
          const avgLoad = (apiState.cell_a.load + apiState.cell_b.load) / 2;
          const avgTp = (apiState.cell_a.throughput + apiState.cell_b.throughput) / 2;
          const avgLat = (apiState.cell_a.latency + apiState.cell_b.latency) / 2;
          const avgLoss = (apiState.cell_a.packet_loss + apiState.cell_b.packet_loss) / 2;
          const status = apiState.cell_a.congestion_status === 'Severe' || apiState.cell_b.congestion_status === 'Severe' ? 'Severe' : 'Normal';

          return res.end(JSON.stringify({
            total_users: totalUsers,
            average_load: avgLoad,
            average_throughput: avgTp,
            average_latency: avgLat,
            packet_loss: avgLoss,
            overall_congestion_status: status,
            cells: apiState
          }));
        }

        if (pathname === '/api/load') {
          return res.end(JSON.stringify({
            cell_a_load: apiState.cell_a.load,
            cell_b_load: apiState.cell_b.load,
            overall_load: (apiState.cell_a.load + apiState.cell_b.load) / 2
          }));
        }

        if (pathname === '/api/throughput') {
          return res.end(JSON.stringify({
            cell_a_throughput: apiState.cell_a.throughput,
            cell_b_throughput: apiState.cell_b.throughput,
            aggregate_throughput: apiState.cell_a.throughput + apiState.cell_b.throughput,
            unit: 'Mbps'
          }));
        }

        if (pathname === '/api/latency') {
          return res.end(JSON.stringify({
            cell_a_latency: apiState.cell_a.latency,
            cell_b_latency: apiState.cell_b.latency,
            average_latency: (apiState.cell_a.latency + apiState.cell_b.latency) / 2,
            unit: 'ms'
          }));
        }

        if (pathname === '/api/packet-loss') {
          return res.end(JSON.stringify({
            cell_a_packet_loss: apiState.cell_a.packet_loss,
            cell_b_packet_loss: apiState.cell_b.packet_loss,
            unit: '%'
          }));
        }

        if (pathname.startsWith('/api/cells/')) {
          const parts = pathname.split('/');
          const cellId = parts[3] as 'cell_a' | 'cell_b';
          if (!apiState[cellId]) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Cell not found' }));
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                Object.assign(apiState[cellId], parsed);
                return res.end(JSON.stringify({ status: 'success', cell: cellId, metrics: apiState[cellId] }));
              } catch (e) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          return res.end(JSON.stringify({ cell: cellId, metrics: apiState[cellId] }));
        }

        // Default response for other /api routes
        return res.end(JSON.stringify({ status: 'ok', endpoint: pathname, state: apiState }));
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
