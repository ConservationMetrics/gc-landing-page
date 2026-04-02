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
    <div class="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
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
        <div class="login-glass-card w-full max-w-xl rounded-3xl p-9 sm:p-12">
          <h1
            class="text-balance text-center text-[1.65rem] font-medium leading-snug tracking-tight text-stone-800 sm:text-3xl sm:leading-tight"
          >
            {{ t("auth.welcomeToGuardianConnector") }}
          </h1>
          <div
            class="mx-auto mt-7 h-0.5 w-20 bg-gradient-to-r from-transparent via-teal-600/55 to-transparent"
            aria-hidden="true"
          ></div>
          <p
            class="mt-7 text-center text-sm leading-relaxed text-stone-700 sm:text-[0.95rem]"
          >
            {{ t("auth.pleaseSignIn") }}
          </p>
          <button
            data-testid="login-button"
            type="button"
            class="mt-10 w-full rounded-xl bg-teal-800 px-5 py-3.5 text-center text-sm font-medium uppercase tracking-[0.12em] text-white shadow-[0_4px_14px_-2px_rgba(15,118,110,0.45)] transition-[box-shadow,background-color,transform] duration-200 hover:bg-teal-900 hover:shadow-[0_8px_22px_-4px_rgba(15,118,110,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(255_255_255/0.6)] active:translate-y-px sm:py-4"
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
          <div class="mt-14">
            <SponsorLogos />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Frosted panel: absolute bg layer lets backdrop-filter read the photo; soft shadow + hairline lift it off the weave. */
.login-glass-card {
  background-color: rgb(255 255 255 / 0.6);
  border: 1px solid rgb(255 255 255 / 0.42);
  box-shadow:
    0 1px 0 rgb(255 255 255 / 0.45) inset,
    0 24px 56px -16px rgb(28 25 23 / 0.32),
    0 12px 24px -12px rgb(28 25 23 / 0.14);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
</style>
