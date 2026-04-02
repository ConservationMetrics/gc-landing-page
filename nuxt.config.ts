// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

// BACKGROUND_IMAGE is copied to NUXT_PUBLIC_BACKGROUND_IMAGE so the login page can read it via runtimeConfig.public.backgroundImage (Nuxt only auto-exposes NUXT_PUBLIC_* to the client).
if (
  process.env.BACKGROUND_IMAGE?.trim() &&
  !process.env.NUXT_PUBLIC_BACKGROUND_IMAGE?.trim()
) {
  process.env.NUXT_PUBLIC_BACKGROUND_IMAGE = process.env.BACKGROUND_IMAGE.trim();
}

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
    bundle: {
      optimizeTranslationDirective: false,
    },  // https://github.com/nuxt-modules/i18n/issues/3238#issuecomment-2672492536
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
      domain: "guardianconnector.net",
      baseUrl: "http://localhost:8080",
      auth0Enabled: true,
      logoUrl: "",
      // Service availability flags
      supersetEnabled: false,
      windmillEnabled: false,
      explorerEnabled: false,
      filebrowserEnabled: false,
      // Login page background URL or path; empty = /background.jpg from public/. Override with BACKGROUND_IMAGE or NUXT_PUBLIC_BACKGROUND_IMAGE.
      backgroundImage: "",
    },
  },
});
