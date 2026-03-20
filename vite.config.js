import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to handle CSV download with proper Content-Disposition headers
function csvDownloadPlugin() {
  return {
    name: 'csv-download',
    configureServer(server) {
      server.middlewares.use('/api/download-csv', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const { csvContent, filename } = JSON.parse(body);
              res.setHeader('Content-Type', 'text/csv; charset=utf-8');
              res.setHeader('Content-Disposition', `attachment; filename="${filename || 'export.csv'}"`);
              res.setHeader('Cache-Control', 'no-cache');
              res.end(csvContent);
            } catch (e) {
              res.statusCode = 400;
              res.end('Invalid request');
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method not allowed');
        }
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), csvDownloadPlugin()],
})
