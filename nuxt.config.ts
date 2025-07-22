// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  // spa mode for static deployment
  ssr: false,

  nitro: {
    prerender: {}
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss()
    ]
  },

  runtimeConfig: {
    auth0RedirectUri: "",

    public: {
      communityName: "demo",
      auth0Domain: "",
      auth0ClientId: "",
      // Service availability flags
      supersetEnabled: false,
      windmillEnabled: false,
      explorerEnabled: false,
      filesEnabled: false,
    },
  },

  modules: [],
})