<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useI18n, useRuntimeConfig } from "#imports";
import HoverTooltip from "@/components/shared/HoverTooltip.vue";
import ServicesGrid from "@/components/homepage/ServicesGrid.vue";
import DataSourcesGrid from "@/components/homepage/DataSourcesGrid.vue";
import CoachMarkTour from "@/components/coachMarks/CoachMarkTour.vue";
import { useThemeSettings } from "@/composables/useThemeSettings";
import { useCustomApps } from "@/composables/useCustomApps";
import { useCoachMarks } from "@/composables/useCoachMarks";
import { ChevronDown } from "lucide-vue-next";

const props = defineProps<{
  shouldShowApp: boolean;
}>();

const config = useRuntimeConfig();
const communityName = config.public.communityName;
const { logoUrl } = useThemeSettings();
const { t } = useI18n();
const { pending: customAppsPending } = useCustomApps();
const { tryAutostart } = useCoachMarks();

const dataSourcesVisible = ref(false);
let observer: IntersectionObserver | null = null;

const showScrollCue = computed(
  () => props.shouldShowApp && !dataSourcesVisible.value,
);

const scrollToDataSources = () => {
  document
    .getElementById("data-sources")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const observeDataSources = () => {
  if (!import.meta.client) return;
  observer?.disconnect();
  observer = null;

  const target = document.getElementById("data-sources");
  if (!target) {
    dataSourcesVisible.value = false;
    return;
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      dataSourcesVisible.value = entry?.isIntersecting ?? false;
    },
    { threshold: 0.15 },
  );
  observer.observe(target);
};

watch(
  () => props.shouldShowApp,
  (show) => {
    if (!show) {
      observer?.disconnect();
      observer = null;
      dataSourcesVisible.value = false;
      return;
    }
    void nextTick().then(observeDataSources);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

watch(
  () => [props.shouldShowApp, customAppsPending.value] as const,
  ([show, pending]) => {
    if (show && !pending) void tryAutostart();
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white dark:bg-dusk-900">
    <main class="mx-auto mt-10 max-w-7xl px-4 pb-12 pt-0 sm:px-6 lg:px-8">
      <div class="pt-0">
        <div v-if="logoUrl" class="mb-8 flex justify-center">
          <img
            :src="logoUrl"
            :alt="communityName + ' logo'"
            class="max-h-32 w-auto object-contain"
          />
        </div>

        <div class="mb-12 text-center">
          <h2 class="mb-4 text-4xl font-bold text-gray-900 dark:text-dusk-100">
            {{ t("app.welcome") }}
          </h2>
          <p class="mx-auto max-w-3xl text-xl text-gray-600 dark:text-dusk-400">
            <i18n-t
              keypath="app.welcomeSubtitle"
              tag="span"
              :values="{ communityName }"
            >
              <template #gc>
                <HoverTooltip :content="t('app.guardianConnectorTooltip')">
                  Guardian Connector
                </HoverTooltip>
              </template>
            </i18n-t>
          </p>
        </div>

        <ServicesGrid v-if="props.shouldShowApp" />

        <div v-if="props.shouldShowApp" class="relative my-12">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div
              class="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-dusk-700 to-transparent"
            ></div>
          </div>
          <div class="relative flex justify-center">
            <button
              type="button"
              class="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-900/40 dark:to-emerald-900/40 ring-1 ring-gray-200 dark:ring-dusk-700 transition-colors hover:from-violet-200 hover:to-emerald-200 dark:hover:from-violet-900/60 dark:hover:to-emerald-900/60 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-dusk-900"
              :class="
                showScrollCue ? 'animate-bounce motion-reduce:animate-none' : ''
              "
              :aria-label="t('coachMarks.dataSources.title')"
              @click="scrollToDataSources"
            >
              <ChevronDown class="h-5 w-5 text-gray-600 dark:text-dusk-300" />
            </button>
          </div>
        </div>

        <DataSourcesGrid v-if="props.shouldShowApp" />

        <div v-if="props.shouldShowApp" class="mb-8 mt-8 text-center">
          <p class="text-sm italic text-gray-600 dark:text-dusk-400">
            {{ t("services.needHelp") }}
            <a
              href="https://docs.guardianconnector.net"
              target="_blank"
              rel="noopener noreferrer"
              class="text-violet-600 dark:text-violet-300 underline hover:text-violet-700 dark:hover:text-violet-200"
            >
              {{ t("services.documentationWebsite") }} </a
            >.
          </p>
        </div>
      </div>
    </main>

    <ClientOnly>
      <CoachMarkTour v-if="props.shouldShowApp" />
    </ClientOnly>
  </div>
</template>
