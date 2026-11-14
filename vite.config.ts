import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api/news": { target: "https://www.motorsport.com", changeOrigin: true, rewrite: () => "/rss/f1/news/" },
    },
  },
});
