import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Note: We have removed the tailwindcss import and plugin

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Correct way to set alias in an ES Module
      "@": path.resolve(__dirname, "./src"),
    },
  },
});