<script lang="ts" setup>
import { useUserSession, navigateTo, createError, useHead } from "#imports";
import UserManagement from "~/components/UserManagement.vue";
// i18n is auto-imported by @nuxtjs/i18n

const { t } = useI18n();

interface UserWithRoles {
  roles?: Array<{ name: string; id: string; description: string }>;
}

// Check if user is logged in and has admin privileges
const { loggedIn, user } = useUserSession();

// Redirect to login if not authenticated
if (!loggedIn.value) {
  await navigateTo("/login");
}

// Check if user has admin role
const hasAdminRole = (user.value as UserWithRoles)?.roles?.some(
  (role) => role.name === "Admin",
);

if (!hasAdminRole) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required.",
  });
}

// Set page metadata
useHead({
  title: t("userManagement.title") + " - Admin",
  meta: [{ name: "description", content: t("userManagement.subtitle") }],
});
</script>

<template>
  <div>
    <!-- Header with Language Picker -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex justify-end">
        <LanguagePicker />
      </div>
    </div>

    <UserManagement />
  </div>
</template>
