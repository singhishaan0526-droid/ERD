import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { generateERDiagram } from './server/generator.js';

dotenv.config();

// Vite plugin to handle /api/generate directly in dev server
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const description = data.description;
              if (!description || typeof description !== 'string' || !description.trim()) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Please provide a valid database description text.' }));
                return;
              }

              const erModel = await generateERDiagram(description);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(erModel));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Generation failed. Please try again.' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
