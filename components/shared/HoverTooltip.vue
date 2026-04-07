<script lang="ts" setup>
import { useId } from "vue";

defineProps<{
  content: string;
}>();

const tooltipId = useId();
</script>

<template>
  <span
    class="group relative inline-block max-w-full align-baseline text-inherit"
  >
    <span
      class="cursor-help border-b border-dotted border-gray-500 outline-none"
      tabindex="0"
      :aria-describedby="tooltipId"
    >
      <slot></slot>
    </span>
    <span
      :id="tooltipId"
      role="tooltip"
      class="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-center text-base leading-relaxed text-white shadow-xl ring-1 ring-white/10 opacity-0 transition-opacity duration-75 ease-out group-hover:opacity-100 group-focus-within:opacity-100 sm:px-5 sm:text-lg sm:leading-normal"
    >
      {{ content }}
    </span>
  </span>
</template>
