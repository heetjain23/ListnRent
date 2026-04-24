import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const vitePrerender = require("vite-plugin-prerender");

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePrerender({
      staticDir: path.resolve(process.cwd(), "dist"),
      routes: ["/", "/collection"],
      renderer: new vitePrerender.PuppeteerRenderer({
        renderAfterTime: 1500,
        headless: true,
      }),
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
