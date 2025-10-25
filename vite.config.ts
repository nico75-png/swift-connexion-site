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
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    globals: true,
    alias: {
      "@testing-library/react": path.resolve(__dirname, "./src/test-utils/rtl"),
      "@testing-library/user-event": path.resolve(__dirname, "./src/test-utils/userEvent"),
      "@testing-library/jest-dom/vitest": path.resolve(__dirname, "./src/test-utils/jestDom"),
    },
  },
}));
