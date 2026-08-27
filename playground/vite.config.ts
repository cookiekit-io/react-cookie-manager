import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages hosts project sites below /<repository>/. Keep local
  // development at / so the playground remains convenient to run locally.
  base: command === "build" ? "/react-cookie-manager/" : "/",
  plugins: [react()],
}));
