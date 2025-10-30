<script setup lang="ts">
import { useUserSession, useHead } from "#imports";
import { useAuth } from "~/composables/useAuth";
import { ref, onMounted } from "vue";

const { loggedIn } = useUserSession();
const { t } = useI18n();
const errorMessage = ref("");

onMounted(() => {
  const authError = useAuth(loggedIn);
  errorMessage.value = authError || "";
});

useHead({
  title: t('auth.signIn'),
});
</script>

<template>
  <Auth0Login :error-message="errorMessage" />
</template>
