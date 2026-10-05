import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true, // dev only: lets the Codespaces URL through
    proxy: {
      // The browser calls /api on this server; Vite forwards it to the Express API.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Makes the API's CORS check see the origin it expects (CLIENT_URL in server/.env)
        headers: { origin: 'http://localhost:5173' },
      },
    },
  },
});