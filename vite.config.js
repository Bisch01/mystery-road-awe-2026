import { defineConfig } from "vite";

// base: GitHub Pages liefert das Projekt unter /<repo-name>/ aus, nicht unter /.
// Vite schreibt damit alle absoluten Pfade in index.html um.
export default defineConfig({
  base: "/mystery-road-awe-2026/",
  server: {
    open: true,
  },
});
