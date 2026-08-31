import { defineConfig } from "vite";

export default defineConfig({
    base: "/tree-memory/",

    server: {
        host: true,
        port: 5173,
        strictPort: true
    },

    build: {
        outDir: "dist",
        emptyOutDir: true,
        sourcemap: true
    }
});
