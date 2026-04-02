<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer
    class="flex flex-col items-center gap-4 text-center text-neutral-700"
    data-testid="sponsor-logos"
  >
    <p class="text-lg font-semibold tracking-wide text-stone-800 sm:text-xl">
      {{ t("auth.coCreatedBy") }}
    </p>
    <div
      class="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-2xl"
    >
      <img
        src="/cmi.png"
        alt="Conservation Metrics"
        class="h-8 w-auto max-w-[min(100%,14rem)] object-contain sm:h-9"
      />
      <img
        src="/niatero.png"
        alt="Nia Tero"
        class="h-10 w-auto max-w-[min(100%,12rem)] object-contain sm:h-11"
      />
    </div>
    <p
      class="mt-1 text-sm italic text-stone-600 sm:text-base"
    >
      {{ t("auth.andIndigenousPartners") }}
    </p>
  </footer>
</template>
