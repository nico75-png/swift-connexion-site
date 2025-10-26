import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tanstack/react-table": path.resolve(__dirname, "./src/vendor/tanstack/react-table"),
      "@tanstack/react-virtual": path.resolve(__dirname, "./src/vendor/tanstack/react-virtual"),
    },
  },
  test: {
    environment: "node",
    setupFiles: "./src/setupTests.ts",
    globals: true,
  },
}));
