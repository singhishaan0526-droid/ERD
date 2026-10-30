import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import express from 'express';
import apiRouter from './server/api.js';

dotenv.config();

// Vite plugin to mount express apiRouter in the dev server
function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server: any) {
      const app = express();
      app.use(express.json());
      app.use('/api', apiRouter);
      server.middlewares.use(app);
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
