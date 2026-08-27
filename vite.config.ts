import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] }), cssInjectedByJsPlugin()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
    },
  },
  css: {
    modules: {
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "react-cookie-consenter",
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
      formats: ["es"],
    },
    rolldownOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        assetFileNames: "style.css",
        manualChunks: undefined,
        codeSplitting: false,
        minifyInternalExports: true,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.trace",
        ],
      },
    },
    sourcemap: false,
    reportCompressedSize: true,
  },
});
