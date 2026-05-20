<script setup lang="ts">
import AppHeader from "@/components/shared/AppHeader.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-stone-950">
    <AppHeader />
    <slot></slot>
  </div>
</template>
