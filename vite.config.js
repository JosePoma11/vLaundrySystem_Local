import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    port: 4545, // Cambia este número al puerto deseado
  },
  optimizeDeps: {
    force: true, // Esta opción asegura que Vite use el puerto especificado sin intentar encontrar uno disponible.
  },
});
