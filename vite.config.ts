import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const port = Number(process.env.PORT || 5173);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  server: {
    host: "0.0.0.0",
    port,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://backendfortskmlm-1.onrender.com", // Change to your backend port
        changeOrigin: true,
      },
    },
  },
 
  preview: {
    host: "0.0.0.0",
    port,
  },
});