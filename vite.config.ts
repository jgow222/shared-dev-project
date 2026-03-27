import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    // Enables HTTPS on the dev server so getUserMedia (camera API) works
    // on real phones connected to the same Wi-Fi network.
    // Phones will show a "not secure" warning — tap "Advanced" then "Proceed".
    basicSsl(),
  ],
  server: {
    https: true,
    host: true, // expose on all network interfaces (0.0.0.0)
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
});
