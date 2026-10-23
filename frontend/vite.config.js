import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      // Forward all /v1/* requests to the Spring Boot backend
      '/v1': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        // No rewrite needed — Spring Boot's context-path is already /v1
      },
    },
  },
});
