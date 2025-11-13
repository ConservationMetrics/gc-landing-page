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

  modules: ["nuxt-auth-utils", "@nuxtjs/i18n"],

  i18n: {
    locales: [
      { code: "en", name: "English", language: "en-US", file: "en.json" },
      { code: "es", name: "Español", language: "es-ES", file: "es.json" },
      { code: "pt", name: "Português", language: "pt-PT", file: "pt.json" },
      { code: "nl", name: "Nederlands", language: "nl-NL", file: "nl.json" },
    ],
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      alwaysRedirect: true,
      redirectOn: "all",
    },
    strategy: "no_prefix",
    skipSettingLocaleOnNavigate: true, // persists locale when route changes
  },

  runtimeConfig: {
    // Session secret for nuxt-auth-utils
    sessionSecret: "your-session-secret-key-change-in-production",
    // OAuth configuration for nuxt-auth-utils and Auth0 management API
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
