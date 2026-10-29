import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, calls to /api are forwarded to the Express server,
// so the browser sees one address and no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
