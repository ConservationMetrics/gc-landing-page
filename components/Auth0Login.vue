<script lang="ts" setup>
import { useUserSession, onMounted } from "#imports";
import GlobeLanguagePicker from "@/components/shared/GlobeLanguagePicker.vue";
import SponsorLogos from "@/components/SponsorLogos.vue";

interface Props {
  errorMessage: string;
}
const props = defineProps<Props>();
const { loggedIn } = useUserSession();
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const loginBackgroundSrc = computed(() => {
  const url = String(runtimeConfig.public.backgroundImage ?? "").trim();
  return url || "/background.jpg";
});
const loginWithAuth0 = () => {
  window.location.href = "/api/auth/auth0";
};
onMounted(() => {
  const redirectUrl = sessionStorage.getItem("redirect_url");
  if (redirectUrl && loggedIn.value) {
    sessionStorage.removeItem("redirect_url");
    window.location.href = redirectUrl;
  }
});
</script>

<template>
  <!-- Background is absolute (not fixed) so the photo and translucent panel share one compositing stack; fixed backgrounds often break “see-through” panels in browsers. -->
  <div class="relative flex min-h-screen w-full flex-col">
    <div
      class="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      <img
        :src="loginBackgroundSrc"
        alt=""
        class="h-full w-full object-cover object-center"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-stone-900/50 via-stone-900/35 to-stone-900/55"
      ></div>
    </div>

    <div class="relative z-10 flex min-h-screen flex-1 flex-col">
      <div class="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <GlobeLanguagePicker theme="white" variant="icon" />
      </div>
      <main
        class="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16"
      >
        <div
          class="login-glass-card w-full max-w-xl rounded-2xl border border-white/45 p-8 shadow-2xl shadow-stone-900/25 sm:p-10"
        >
          <h1
            class="text-center text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl"
          >
            {{ t("auth.welcomeToGuardianConnector") }}
          </h1>
          <div
            class="mx-auto mt-5 h-1 w-14 rounded-full bg-teal-600/90"
            aria-hidden="true"
          ></div>
          <p
            class="mt-6 text-center text-sm leading-relaxed text-stone-600 sm:text-base"
          >
            {{ t("auth.pleaseSignIn") }}
          </p>
          <button
            data-testid="login-button"
            type="button"
            class="mt-8 w-full rounded-lg bg-teal-700 px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[rgb(255_255_255/0.76)] sm:py-3.5"
            @click="loginWithAuth0"
          >
            {{ t("auth.signIn") }}
          </button>
          <p
            v-if="props.errorMessage"
            class="mt-4 text-center text-xs text-red-600"
          >
            {{ props.errorMessage }}
          </p>
          <div class="mt-10">
            <SponsorLogos />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Semi-transparent panel: alpha blends with the photo underneath (Terrastories-style). No backdrop-filter so we never depend on compositor quirks with fixed layers. */
.login-glass-card {
  background-color: rgb(255 255 255 / 0.76);
}
</style>
