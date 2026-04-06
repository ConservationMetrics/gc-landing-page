<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <footer
    class="flex flex-col items-center gap-5 text-center text-neutral-700"
    data-testid="sponsor-logos"
  >
    <p class="text-base font-semibold tracking-wide text-stone-700 sm:text-lg">
      {{ t("auth.coCreatedBy") }}
    </p>
    <div
      class="flex max-w-2xl flex-wrap items-center justify-center gap-x-12 gap-y-5"
    >
      <img
        src="/cmi.png"
        alt="Conservation Metrics"
        class="h-8 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
      />
      <img
        src="/niatero.png"
        alt="Nia Tero"
        class="h-10 w-auto max-w-[min(100%,14rem)] object-contain sm:h-11"
      />
    </div>
    <p class="mt-0.5 text-sm italic text-stone-500 sm:text-[0.95rem]">
      {{ t("auth.andIndigenousPartners") }}
    </p>
  </footer>
</template>
