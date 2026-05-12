import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/TCR/', // This ensures assets load from the correct subfolder
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
