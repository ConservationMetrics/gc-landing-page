<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer
    class="flex flex-col items-center gap-4 px-4 pb-8 pt-4 text-center text-sm text-neutral-600"
    data-testid="sponsor-logos"
  >
    <p class="font-medium tracking-wide text-neutral-500">
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
  </footer>
</template>
