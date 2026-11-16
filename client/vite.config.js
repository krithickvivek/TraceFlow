/**
 * @file vite.config.js
 * @description Vite configuration for TraceFlow V2. Configures React plugin
 *              and proxies API requests to the Express backend during development.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
});
