<script lang="ts" setup>
import { useUserSession, navigateTo, createError, useHead } from "#imports";
import CustomAppsSettings from "~/components/CustomAppsSettings.vue";

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
  title: t("customApps.title") + " - Admin",
  meta: [{ name: "description", content: t("customApps.subtitle") }],
});
</script>

<template>
  <ClientOnly>
    <CustomAppsSettings />
  </ClientOnly>
</template>
