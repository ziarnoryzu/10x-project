// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://ziarnoryzu.github.io/10x-project/",
  base: "/10x-project",
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: "standalone",
  }),
  env: {
    schema: {
      // Public variables (accessible in both client and server)
      SUPABASE_URL: envField.string({
        context: "server",
        access: "public",
      }),
      SUPABASE_ANON_KEY: envField.string({
        context: "server",
        access: "public",
      }),
      // Server-side only variables
      OPENROUTER_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      DEFAULT_USER_ID: envField.string({
        context: "server",
        access: "public",
      }),
    },
  },
});
