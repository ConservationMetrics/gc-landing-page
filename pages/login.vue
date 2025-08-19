<script setup lang="ts">
import { useUserSession } from "#imports";
import { useAuth } from "~/composables/useAuth";

const { loggedIn } = useUserSession();
const errorMessage = ref("");

onMounted(() => {
  const authError = useAuth(loggedIn);
  errorMessage.value = authError || "";
});

useHead({
  title: "GuardianConnector: Login",
});
</script>

<template>
  <Auth0Login :error-message="errorMessage" />
</template>
