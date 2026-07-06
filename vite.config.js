import { defineConfig } from "vite";

export default defineConfig({
  server: {

  },
  build: {
    manifest: true,
    sourcemap: true,
    rolldownOptions: {
      input: 'src/main.tsx',
      output: {
        format: "es",
        assetFileNames: `assets/[name][extname]`,
        chunkFileNames: '[name].js',
        entryFileNames: "[name].js"
      }
    },
    outDir: "romfs",
    target: "ES2022"
  },
})