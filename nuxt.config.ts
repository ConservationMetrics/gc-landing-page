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
    communityName: process.env.NUXT_COMMUNITY_NAME || "demo",
    auth0Domain: process.env.NUXT_AUTH0_DOMAIN || "",
    auth0ClientId: process.env.NUXT_AUTH0_CLIENT_ID || "",

    // Public config (client-side) - uses NUXT_PUBLIC_ prefix
    public: {
      communityName: process.env.NUXT_PUBLIC_COMMUNITY_NAME || process.env.NUXT_COMMUNITY_NAME || "demo",
      auth0Domain: process.env.NUXT_PUBLIC_AUTH0_DOMAIN || process.env.NUXT_AUTH0_DOMAIN || "",
      auth0ClientId: process.env.NUXT_PUBLIC_AUTH0_CLIENT_ID || process.env.NUXT_AUTH0_CLIENT_ID || "",
      auth0RedirectUri: process.env.NUXT_PUBLIC_AUTH0_REDIRECT_URI || process.env.NUXT_AUTH0_REDIRECT_URI || "",
      authEnabled: !!(process.env.NUXT_PUBLIC_AUTH0_DOMAIN || process.env.NUXT_AUTH0_DOMAIN) && !!(process.env.NUXT_PUBLIC_AUTH0_CLIENT_ID || process.env.NUXT_AUTH0_CLIENT_ID),
      // Service availability flags
      supersetEnabled: (process.env.NUXT_PUBLIC_SUPERSET_ENABLED || process.env.NUXT_SUPERSET_ENABLED) === 'true',
      windmillEnabled: (process.env.NUXT_PUBLIC_WINDMILL_ENABLED || process.env.NUXT_WINDMILL_ENABLED) === 'true',
      explorerEnabled: (process.env.NUXT_PUBLIC_EXPLORER_ENABLED || process.env.NUXT_EXPLORER_ENABLED) === 'true',
      filesEnabled: (process.env.NUXT_PUBLIC_FILES_BROWSER_ENABLED || process.env.NUXT_FILES_BROWSER_ENABLED) === 'true',
    },
  },
})