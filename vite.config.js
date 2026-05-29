import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Garante que assets sejam servidos a partir da raiz quando hospedado.
  // Se for hospedar em subpasta (ex.: /cha-de-cozinha/), mude para isso.
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        // Hash em todos os arquivos para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    host: true, // permite acesso na rede local em dev
  },

  preview: {
    port: 4173,
    host: true,
  },
})
