import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: GitHub Pages liefert das Projekt unter /<repo-name>/ aus, nicht unter /.
// Vite schreibt damit alle absoluten Pfade in index.html um.
export default defineConfig({
  // Kompiliert .tsx zu JavaScript und sorgt im Dev-Server für React Fast Refresh.
  plugins: [react()],
  base: "/mystery-road-awe-2026/",
  server: {
    open: true,
  },
});
