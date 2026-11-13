import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ["@vladmandic/face-api", "face-api.js"],
  },
  resolve: {
    alias: {
      "@vladmandic/face-api": "@vladmandic/face-api/dist/face-api.esm.js",
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      external: ["fs", "path", "crypto", "util", "os"],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor";
            }
            if (id.includes("face-api")) {
              return "face";
            }
          }
        },
      },
    },
  },
});