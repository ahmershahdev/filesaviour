import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Django serves the built files from /static/ (STATICFILES_DIRS includes dist/).
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  base: "/static/",
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    origin: "http://127.0.0.1:5173",
    cors: { origin: ["http://127.0.0.1:8000", "http://localhost:8000"] },
  },
  build: isSsrBuild
    ? { outDir: "dist-ssr", emptyOutDir: true }
    : {
        outDir: "dist",
        emptyOutDir: true,
        manifest: "manifest.json",
        target: "es2022",
        rollupOptions: { input: { main: resolve(__dirname, "src/main.tsx") } },
      },
  ssr: { noExternal: ["@inertiajs/react", "@inertiajs/core"] },
}));
