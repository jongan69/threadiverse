import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: {
    alias: {
      util: 'rollup-plugin-node-polyfills/polyfills/util'
    }
  },
  define: {
    'process.env': '({})',
    global: 'globalThis'
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-allow-popups'
    }
  }
});