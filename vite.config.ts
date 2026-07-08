import { defineConfig } from "vite";

// base: "./" keeps every asset reference relative so the built site works when
// served from any subpath (e.g. apps.charliekrug.com/unmask), not just root.
export default defineConfig({
  base: "./",
  build: {
    // Emit to site/ so the built static output is exactly what gets served
    // from apps.charliekrug.com/unmask/ (the deploy serves site_build_dir).
    outDir: "site",
    target: "es2020",
  },
});
