// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false, // spa mode for static deployment
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  runtimeConfig: {
    // Server-side (build-time) config
    communityName: "demo",
    auth0Domain: "",
    auth0ClientId: "",

    // Public config (client-side)
    public: {
      communityName: "demo",
      auth0Domain: "",
      auth0ClientId: "",
      auth0RedirectUri: "",
      authEnabled: true,
      // Service availability flags
      supersetEnabled: process.env.NUXT_SUPERSET_ENABLED === 'true',
      windmillEnabled: process.env.NUXT_WINDMILL_ENABLED === 'true',
      explorerEnabled: process.env.NUXT_EXPLORER_ENABLED === 'true',
      filesEnabled: process.env.NUXT_FILES_BROWSER_ENABLED === 'true',
    },
  },
})