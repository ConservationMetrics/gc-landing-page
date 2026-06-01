<script setup lang="ts">
import { useHead } from "#imports";
import { useTheme } from "@/composables/useTheme";

const { isDark } = useTheme();

useHead({
  htmlAttrs: {
    class: () => (isDark.value ? "dark" : ""),
  },
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
