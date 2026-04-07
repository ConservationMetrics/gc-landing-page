<script setup lang="ts">
import { Layers } from "lucide-vue-next";
</script>

<template>
  <NuxtLink
    to="/"
    class="flex max-[1000px]:min-w-0 max-[1000px]:flex-1 items-center gap-3"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-600"
    >
      <Layers class="h-6 w-6 text-white" />
    </div>
    <div
      class="min-w-0 shrink rounded-lg py-2 max-[1000px]:px-2 min-[1001px]:px-4"
    >
      <h1
        class="m-0 font-bold leading-tight max-[1000px]:text-sm min-[1001px]:text-lg min-[1001px]:max-[1200px]:text-xs"
      >
        Guardian Connector
      </h1>
    </div>
  </NuxtLink>
</template>
