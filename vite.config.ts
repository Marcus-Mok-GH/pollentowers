import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/pollentowers/", // GitHub Pages project site

  server: { host: true, port: 5180 },
  preview: { host: true, port: 5180 },
});