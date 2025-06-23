// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  runtimeConfig: {
    // Server-side (build-time) config
    communityName: process.env.COMMUNITY_NAME || "demo",
    auth0Domain: process.env.AUTH0_DOMAIN || "",
    auth0ClientId: process.env.AUTH0_CLIENT_ID || "",

    // Public config (client-side)
    public: {
      communityName: process.env.COMMUNITY_NAME || "demo",
      auth0Domain: process.env.AUTH0_DOMAIN || "",
      auth0ClientId: process.env.AUTH0_CLIENT_ID || "",
      auth0RedirectUri: process.env.AUTH0_REDIRECT_URI || "",
      authEnabled: !!(process.env.AUTH0_DOMAIN && process.env.AUTH0_CLIENT_ID),
    },
  },
})
