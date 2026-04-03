<script setup lang="ts">
import { useUserSession, useRuntimeConfig, useHead } from "#imports";
import { computed } from "vue";
import HomePage from "@/components/HomePage.vue";
import { useAuthActions } from "@/composables/useAuth";

const config = useRuntimeConfig();
const { t } = useI18n();
const { loggedIn } = useUserSession();

const isAuth0Configured = config.public.auth0Enabled;

const shouldShowApp = computed(() => {
  return isAuth0Configured ? loggedIn.value : true;
});

const { login } = useAuthActions();

useHead({
  title: t("app.title"),
});
</script>

<template>
  <HomePage
    :is-auth0-configured="isAuth0Configured"
    :logged-in="loggedIn"
    :should-show-app="shouldShowApp"
    @login="login"
  />
</template>
