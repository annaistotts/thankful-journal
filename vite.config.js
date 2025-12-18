import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        history: resolve(__dirname, "src/history/index.html"),
        entry: resolve(__dirname, "src/entry/index.html"),
        profile: resolve(__dirname, "src/profile/index.html")
      }
    },
    copyPublicDir: true
  }
});
