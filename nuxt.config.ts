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

    // Public config (client-side) - Nuxt automatically handles NUXT_PUBLIC_ prefixed env vars
    public: {
      communityName: "demo",
      auth0Domain: "",
      auth0ClientId: "",
      auth0RedirectUri: "",
      // Service availability flags
      supersetEnabled: false,
      windmillEnabled: false,
      explorerEnabled: false,
      filesEnabled: false,
    },
  },
})