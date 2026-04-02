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
  <div class="container relative flex min-h-screen flex-col">
    <!-- Header with Language Picker -->
    <div class="absolute top-4 right-4 z-10">
      <GlobeLanguagePicker theme="white" variant="icon" />
    </div>

    <div
      class="flex flex-1 flex-col items-center justify-center px-4 py-16"
    >
      <p class="italic">{{ t("auth.pleaseSignIn") }}</p>
      <button
        data-testid="login-button"
        class="px-4 py-2 mt-4 mb-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50"
        @click="loginWithAuth0"
      >
        {{ t("auth.signIn") }}
      </button>
      <p v-if="props.errorMessage" class="text-red-500 text-xs italic">
        {{ props.errorMessage }}
      </p>
    </div>

    <SponsorLogos />
  </div>
</template>
