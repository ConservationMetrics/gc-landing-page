// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  ssr: true,

  nitro: {
    prerender: {},
  },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "nuxt-auth-utils",
  ],

  runtimeConfig: {
    // Session secret for nuxt-auth-utils
    sessionSecret: "your-session-secret-key-change-in-production",
    // OAuth configuration for nuxt-auth-utils
    oauth: {
      auth0: {
        clientId: "",
        clientSecret: "",
        domain: "",
      },
    },

    public: {
      communityName: "demo",
      baseUrl: "http://localhost:8080",
      auth0Enabled: true,
      // Service availability flags
      supersetEnabled: false,
      windmillEnabled: false,
      explorerEnabled: false,
      filebrowserEnabled: false,
    },
  },
});
