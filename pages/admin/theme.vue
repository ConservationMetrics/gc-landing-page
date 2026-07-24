<script lang="ts" setup>
import { useUserSession, navigateTo, createError, useHead } from "#imports";
import ThemeSettings from "~/components/ThemeSettings.vue";
// i18n is auto-imported by @nuxtjs/i18n

const { t } = useI18n();

interface UserWithRoles {
  roles?: Array<{ name: string; id: string; description: string }>;
}

const { loggedIn, user } = useUserSession();

if (!loggedIn.value) {
  await navigateTo("/login");
}

const hasAdminRole = (user.value as UserWithRoles)?.roles?.some(
  (role) => role.name === "Admin",
);

if (!hasAdminRole) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required.",
  });
}

useHead({
  title: t("themeSettings.title") + " - Admin",
  meta: [{ name: "description", content: t("themeSettings.subtitle") }],
});
</script>

<template>
  <ThemeSettings />
</template>
