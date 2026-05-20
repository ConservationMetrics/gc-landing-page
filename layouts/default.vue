<script setup lang="ts">
import AppHeader from "@/components/shared/AppHeader.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-slate-900">
    <AppHeader />
    <slot></slot>
  </div>
</template>
