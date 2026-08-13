<script setup lang="ts">
import { useUserSession, useRuntimeConfig, useHead } from "#imports";
import { computed } from "vue";
import HomePage from "@/components/HomePage.vue";

const {
  public: { authStrategy },
} = useRuntimeConfig();
const { t } = useI18n();
const { loggedIn } = useUserSession();

const shouldShowApp = computed(() => {
  return authStrategy === "auth0" ? loggedIn.value : true;
});

useHead({
  title: t("app.title"),
});
</script>

<template>
  <HomePage :should-show-app="shouldShowApp" />
</template>
