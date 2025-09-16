<script lang="ts" setup>
import { useUserSession } from "#imports";
import UserManagement from "~/components/UserManagement.vue";

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
const hasAdminRole = (user.value as UserWithRoles)?.roles?.some((role) => role.name === "Admin");

if (!hasAdminRole) {
  throw createError({
    statusCode: 403,
    statusMessage: "Access denied. Admin privileges required.",
  });
}

// Set page metadata
useHead({
  title: "User Management - Admin",
  meta: [
    { name: "description", content: "Manage user roles and approval status" },
  ],
});
</script>

<template>
  <div>
    <UserManagement />
  </div>
</template>
